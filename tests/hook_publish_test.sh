#!/usr/bin/env bash
# Publisher tests for .claude/hooks/office_hook.py (final states, lock, .dirty). No network:
# the "origin" is a local bare repo. Run: bash tests/hook_publish_test.sh
set -u
HERE="$(cd "$(dirname "$0")/.." && pwd)"; H="$HERE/.claude/hooks/office_hook.py"
S="$(mktemp -d)"; trap 'rm -rf "$S"' EXIT
G="git -c user.name=t -c user.email=t@example.invalid"; FAIL=0; N=0
ok(){ if [ "$2" = 0 ]; then echo "PASS $1"; else echo "FAIL $1"; FAIL=1; fi; }

# newenv NAME -> fresh bare origin + working clone; sets W (work dir) and O (origin) and CLAUDE_PROJECT_DIR
newenv(){
  N=$((N+1)); local d="$S/e$N"; mkdir -p "$d"; O="$d/origin.git"
  git init -q --bare "$O"; git clone -q "$O" "$d/seed" 2>/dev/null
  (cd "$d/seed" && echo x > README && git add . && $G commit -qm init && git branch -M main && git push -q origin main) >/dev/null 2>&1
  git clone -q "$O" "$d/work" 2>/dev/null; W="$d/work"; echo "status/" > "$W/.gitignore"
  export CLAUDE_PROJECT_DIR="$W"; cd "$W" || exit 1
}
# hook EVENT [--publish] with PAYLOAD; fails the run if the hook prints anything or exits non-zero
hook(){ local ev="$1"; shift; local out; out="$(printf '%s' "${PAYLOAD:-{\}}" | python3 "$H" "$ev" "$@" 2>&1)"; local rc=$?
        [ $rc -eq 0 ] && [ -z "$out" ] || { echo "  hook $ev rc=$rc out=[$out]"; return 1; }; }
pub(){ git -C "$O" show data:status.json 2>/dev/null; }
state(){ pub | python3 -c "import json,sys;d=json.load(sys.stdin);print(d['agents'].get('$1',{}).get('state',''))" 2>/dev/null; }
commits(){ git -C "$O" rev-list --count data 2>/dev/null || echo 0; }
last_log(){ tail -n1 "$W/status/publish.log" 2>/dev/null; }
# a real subagent is a SubagentStart followed by a SubagentStop carrying the same agent_id and type
sstart(){ PAYLOAD="{\"agent_type\":\"$1\",\"agent_id\":\"id-$1\"}" hook SubagentStart; }
sstop(){ PAYLOAD="{\"agent_type\":\"$1\",\"agent_id\":\"id-$1\"}" hook SubagentStop --publish; }

# T1: SubagentStop right after another publish is published, not dropped
newenv
sstart lucas; sstart sofia; sstop lucas; sstop sofia
ok "T1 SubagentStop logo após outra publicação é publicado (sem rate limit)" "$([ "$(state lucas)" = completed ] && [ "$(state sofia)" = completed ]; echo $?)"
ok "T1 nenhum 'skipped: rate limit' no log" "$(grep -q 'rate limit' status/publish.log; [ $? -ne 0 ]; echo $?)"

# T2: two SubagentStop in under 1 s -> remote ends with both completed
newenv; t0=$(date +%s%N)
sstart lucas; sstart sofia
sstop lucas; sstop sofia
ok "T2 dois SubagentStop em sequência: ambos completed no remoto" "$([ "$(state lucas)" = completed ] && [ "$(state sofia)" = completed ]; echo $?)"
ok "T2 .dirty limpo ao final" "$([ ! -e status/.dirty ]; echo $?)"

# T3: N hooks in parallel converge on the REMOTE with no later event to rescue them (3 rounds)
for round in 1 2 3; do
  newenv; rcs="$S/rcs$N"; : > "$rcs"
  for a in lucas sofia noah maya ethan olivia; do sstart $a; done
  for a in lucas sofia noah maya ethan olivia; do
    ( printf '{"agent_type":"%s","agent_id":"id-%s"}' "$a" "$a" | python3 "$H" SubagentStop --publish >/dev/null 2>&1; echo $? >> "$rcs" ) &
  done; wait
  ok "T3.$round 6 hooks paralelos: todos saem com 0" "$([ "$(grep -vc '^0$' "$rcs")" = 0 ] && [ "$(wc -l < "$rcs")" = 6 ]; echo $?)"
  miss=0; for a in lucas sofia noah maya ethan olivia; do [ "$(state $a)" = completed ] || { miss=1; echo "  faltando no remoto: $a"; }; done
  ok "T3.$round remoto bare converge (6 completed) sem Stop extra" "$miss"
  ok "T3.$round .dirty limpo" "$([ ! -e status/.dirty ]; echo $?)"
  ok "T3.$round worktree íntegro" "$(git -C status/.data-wt status --porcelain >/dev/null 2>&1; echo $?)"
done

# T4: lock contention -> loser returns fast with exit 0, marks .dirty, state published later.
# The holder signals readiness with a file (no sleep) and releases the lock only when told to.
newenv; READY="$S/ready$N"; RELEASE="$S/release$N"
python3 - "$W/status" "$READY" "$RELEASE" <<'PYEOF' &
import fcntl, os, sys, time
d, ready, release = sys.argv[1:4]
os.makedirs(d, exist_ok=True)
f = open(os.path.join(d, ".publish.lock"), "a"); fcntl.flock(f, fcntl.LOCK_EX)
open(ready, "w").close()
end = time.time() + 30                      # safety net so the test can never hang
while not os.path.exists(release) and time.time() < end: time.sleep(0.05)
PYEOF
HOLD=$!
for i in $(seq 1 200); do [ -e "$READY" ] && break; sleep 0.05; done
ok "T4 segurador sinalizou que adquiriu o lock" "$([ -e "$READY" ]; echo $?)"
sstart lucas
t0=$(date +%s%N); sstop lucas; rc=$?; dt=$(( ($(date +%s%N)-t0)/1000000 ))
ok "T4 sem o lock: sai em < 1,5 s com exit 0 e sem stdout" "$([ $rc -eq 0 ] && [ $dt -lt 1500 ]; echo $?)"
ok "T4 .dirty mantido para o detentor/próximo evento" "$([ -e status/.dirty ]; echo $?)"
ok "T4 nada publicado enquanto o lock estava ocupado" "$([ -z "$(pub)" ]; echo $?)"
: > "$RELEASE"; wait $HOLD; PAYLOAD='{}' hook Stop --publish
ok "T4 depois de liberar o lock, o estado pendente é publicado" "$([ "$(state lucas)" = completed ] && [ ! -e status/.dirty ]; echo $?)"

# T5: SubagentStop after Stop still publishes
newenv
sstart lucas; PAYLOAD='{}' hook Stop --publish
sstop lucas
ok "T5 SubagentStop depois de Stop publica (lucas completed)" "$([ "$(state lucas)" = completed ] && [ "$(state alex)" = idle ]; echo $?)"

# T6: rejected push keeps .dirty and is retried by the next event
newenv
printf '#!/bin/sh\necho rejected >&2\nexit 1\n' > "$O/hooks/pre-receive"; chmod +x "$O/hooks/pre-receive"
sstart lucas; sstart sofia
sstop lucas; rc=$?
ok "T6 push recusado: exit 0, sem stdout" "$rc"
ok "T6 push recusado: .dirty preservado" "$([ -e status/.dirty ]; echo $?)"
rm -f "$O/hooks/pre-receive"
sstop sofia
ok "T6 próximo evento republica tudo e limpa o .dirty" "$([ "$(state lucas)" = completed ] && [ "$(state sofia)" = completed ] && [ ! -e status/.dirty ]; echo $?)"

# T7: unreachable remote -> exit 0, no stdout, within the deadline, .dirty kept
newenv; t0=$(date +%s); sstart lucas
out="$(printf '{"agent_type":"lucas","agent_id":"id-lucas"}' | AAO_PUBLISH_REMOTE="$S/does-not-exist.git" python3 "$H" SubagentStop --publish 2>&1)"; rc=$?
ok "T7 remoto inalcançável: exit 0, sem stdout, dentro do prazo (< 30 s)" "$([ $rc -eq 0 ] && [ -z "$out" ] && [ $(( $(date +%s)-t0 )) -lt 30 ]; echo $?)"
ok "T7 .dirty preservado" "$([ -e status/.dirty ]; echo $?)"

# T8: privacy / schema unchanged
newenv
sstart lucas
PAYLOAD='{"agent_type":"lucas","agent_id":"id-lucas","agent_transcript_path":"/root/.claude/secret-transcript.jsonl","cwd":"/secret/path","session_id":"SID123","prompt":"MY SECRET PROMPT","last_assistant_message":"password=hunter2 ghp_FAKE /root/x"}' hook SubagentStop --publish
PAYLOAD='{"cwd":"/home/user/secret","session_id":"SID999"}' hook Stop --publish
ok "T8 schema público: apenas schema/generated_at/agents" "$(pub | python3 -c "import json,sys;d=json.load(sys.stdin);assert set(d)=={'schema','generated_at','agents'} and d['schema']==1" 2>/dev/null; echo $?)"
ok "T8 por agente: apenas state/updated_at/last_event" "$(pub | python3 -c "import json,sys;d=json.load(sys.stdin);assert all(set(v)=={'state','updated_at','last_event'} for v in d['agents'].values())" 2>/dev/null; echo $?)"
ok "T8 nada sensível nem caminho absoluto no remoto" "$(pub | grep -qiE 'secret|hunter|ghp_|/root|/home|/tmp|SID|prompt|cwd|transcript|id-lucas'; [ $? -ne 0 ]; echo $?)"
ok "T8 só agentes da lista conhecida" "$(pub | python3 -c "import json,sys;d=json.load(sys.stdin);assert set(d['agents'])<= {'alex','arthur','lucas','sofia','noah','maya','ethan','olivia'}" 2>/dev/null; echo $?)"
ok "T8 filtro SAFE e allowlist presentes no código" "$(grep -q '^SAFE = re.compile' "$H" && grep -q 'PUBLIC_STATES' "$H" && grep -q 'if not SAFE.match(text)' "$H"; echo $?)"

# T9: regression - non-publishing events never publish nor create .dirty
newenv
for ev in SessionStart SubagentStart PreToolUse Notification; do PAYLOAD='{"agent_type":"lucas"}' hook $ev; done
ok "T9 SessionStart/SubagentStart/PreToolUse/Notification não publicam" "$([ "$(commits)" = 0 ] && [ ! -e status/.dirty ] && [ ! -e status/.publish.lock ]; echo $?)"

# T10: unchanged state creates no empty commit
newenv
sstart lucas; sstop lucas; c1=$(commits)
PAYLOAD='{"agent_type":"Explore","agent_id":"x1"}' hook SubagentStop --publish; c2=$(commits)
ok "T10 estado inalterado: sem novo commit e log 'unchanged'" "$([ "$c1" = "$c2" ] && [ "$c1" != 0 ] && last_log | grep -q unchanged; echo $?)"

# H7: Alex stuck in working (901 s) is expired and published by a SessionStart --publish
newenv
PAYLOAD='{"agent_type":"alex"}' hook PreToolUse
python3 - <<'PYEOF'
import json
p = "status/status.json"; d = json.load(open(p)); d["agents"]["alex"]["updated_at"] -= 901; json.dump(d, open(p, "w"))
PYEOF
PAYLOAD='{"agent_type":"lucas","agent_id":"Z9"}' hook SubagentStop --publish   # ignored event: only the sweeper changes Alex
ok "H7 Alex working antigo (901 s) + evento ignorado com --publish: remoto mostra alex idle" "$([ "$(state alex)" = idle ]; echo $?)"
ok "H7 .dirty ausente após a publicação" "$([ ! -e status/.dirty ]; echo $?)"

# H8: SubagentStart --publish makes "working" visible, is exempt from the 30 s limit, and exposes no ids
newenv
PAYLOAD='{"agent_type":"lucas","agent_id":"id-lucas"}' hook SubagentStart --publish
PAYLOAD='{"agent_type":"sofia","agent_id":"id-sofia"}' hook SubagentStart --publish
ok "H8 SubagentStart --publish: lucas working no remoto" "$([ "$(state lucas)" = working ]; echo $?)"
ok "H8 segundo SubagentStart dentro de 30 s tambem publica (sem rate limit): sofia working" "$([ "$(state sofia)" = working ]; echo $?)"
ok "H8 nenhum agent_id no snapshot publico" "$(pub | grep -q 'id-lucas\|id-sofia\|agent_id'; [ $? -ne 0 ]; echo $?)"

# Bonus: non-final events keep the 30 s rate limit and leave .dirty for a later final event
newenv
sstart lucas; sstart sofia
sstop lucas
PAYLOAD='{}' hook Notification --publish
ok "B1 evento não final dentro de 30 s: pulado, .dirty mantido" "$(last_log | grep -q 'rate limit' && [ -e status/.dirty ]; echo $?)"
sstop sofia
ok "B1 próximo evento final publica o estado pendente" "$([ "$(state sofia)" = completed ] && [ ! -e status/.dirty ]; echo $?)"
exit $FAIL
