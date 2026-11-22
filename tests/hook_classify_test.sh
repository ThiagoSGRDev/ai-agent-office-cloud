#!/usr/bin/env bash
# Event classification tests for .claude/hooks/office_hook.py: which events may change the public state.
# No network: the only remote is a local bare repo (privacy test). Run: bash tests/hook_classify_test.sh
set -u
HERE="$(cd "$(dirname "$0")/.." && pwd)"; H="$HERE/.claude/hooks/office_hook.py"
S="$(mktemp -d)"; trap 'rm -rf "$S"' EXIT
G="git -c user.name=t -c user.email=t@example.invalid"; FAIL=0; N=0
ok(){ if [ "$2" = 0 ]; then echo "PASS $1"; else echo "FAIL $1"; FAIL=1; fi; }

newenv(){                                   # fresh project dir (+ local bare origin for the privacy test)
  N=$((N+1)); local d="$S/e$N"; mkdir -p "$d"; O="$d/origin.git"
  git init -q --bare "$O"; git clone -q "$O" "$d/seed" 2>/dev/null
  (cd "$d/seed" && echo x > README && git add . && $G commit -qm init && git branch -M main && git push -q origin main) >/dev/null 2>&1
  git clone -q "$O" "$d/work" 2>/dev/null; W="$d/work"; echo "status/" > "$W/.gitignore"
  export CLAUDE_PROJECT_DIR="$W"; cd "$W" || exit 1
}
# h EVENT PAYLOAD [--publish]: the hook must exit 0 and print nothing, whatever the payload
h(){ local ev="$1" pl="$2"; shift 2; local out; out="$(printf '%s' "$pl" | python3 "$H" "$ev" "$@" 2>&1)"; local rc=$?
     [ $rc -eq 0 ] && [ -z "$out" ] || { echo "  hook $ev rc=$rc out=[$out]"; return 1; }; }
st(){ python3 -c "import json;d=json.load(open('status/status.json'))['agents'].get('$1');print(d['state'] if d else 'absent')"; }
le(){ python3 -c "import json;d=json.load(open('status/status.json'))['agents'].get('$1');print(d['last_event'] if d else 'absent')"; }
agents_sum(){ python3 -c "import json,hashlib;print(hashlib.md5(json.dumps(json.load(open('status/status.json'))['agents'],sort_keys=True).encode()).hexdigest())"; }
aud(){ python3 -c "import json;l=[json.loads(x) for x in open('status/events.jsonl')][-1];print(l.get('$1'))"; }   # last audit entry field
reg(){ python3 -c "import json;r=json.load(open('status/subagents.json'));print(len(r.get('$1',{})))"; }
regid(){ python3 -c "import json;r=json.load(open('status/subagents.json'));print('$2' in r.get('$1',{}))"; }
age(){ python3 - "$1" "$2" <<'PYEOF'                # age(table, seconds): make every registry entry older
import json, sys
t, n = sys.argv[1], int(sys.argv[2]); p = "status/subagents.json"; r = json.load(open(p))
for v in r[t].values():
    for k in ("seen", "start", "ts"):
        if k in v: v[k] -= n
json.dump(r, open(p, "w"))
PYEOF
}
agestate(){ python3 - "$1" "$2" <<'PYEOF'             # agestate(agent, seconds): make a public state older
import json, sys
a, n = sys.argv[1], int(sys.argv[2]); p = "status/status.json"; d = json.load(open(p))
d["agents"][a]["updated_at"] -= n; json.dump(d, open(p, "w"))
PYEOF
}

# C1/C2: main-session events drive Alex
newenv
h PreToolUse '{"agent_type":"alex"}'
ok "C2 PreToolUse do principal -> Alex working" "$([ "$(st alex)" = working ]; echo $?)"
h Stop '{"agent_type":"alex"}'
ok "C1 Stop do principal -> Alex idle" "$([ "$(st alex)" = idle ] && [ "$(le alex)" = Stop ]; echo $?)"
h PreToolUse '{}'; ok "C2b PreToolUse sem agent_type e sem agent_id (sessão principal) -> Alex working" "$([ "$(st alex)" = working ]; echo $?)"
h Stop '{}'

# C3: SubagentStop from the internal main-agent context must not complete Alex
before="$(agents_sum)"
h SubagentStop '{"agent_type":"alex","agent_id":"internal-1"}'
ok "C3 SubagentStop com agent_type alex: estado de Alex intacto (idle, não completed)" "$([ "$(st alex)" = idle ] && [ "$(le alex)" = Stop ] && [ "$(agents_sum)" = "$before" ]; echo $?)"
ok "C3 auditado como ignorado, com motivo" "$([ "$(aud accepted)" = False ] && [ "$(aud reason)" = main-agent-type ]; echo $?)"
h SubagentStart '{"agent_type":"alex","agent_id":"internal-2"}'
ok "C3b SubagentStart com agent_type alex também é ignorado (não registra id)" "$([ "$(aud reason)" = main-agent-type ] && [ "$(reg active)" = 0 ]; echo $?)"

# C4: empty / missing type, missing id
h SubagentStop '{"agent_type":"","agent_id":"e-1"}'
ok "C4 SubagentStop com agent_type vazio: ignorado" "$([ "$(agents_sum)" = "$before" ] && [ "$(aud reason)" = empty-agent-type ]; echo $?)"
h SubagentStop '{"agent_id":"e-2"}'
ok "C4b SubagentStop sem agent_type: ignorado" "$([ "$(agents_sum)" = "$before" ] && [ "$(aud reason)" = empty-agent-type ]; echo $?)"
h SubagentStop '{"agent_type":"lucas"}'
ok "C4c SubagentStop sem agent_id: ignorado (lucas não aparece)" "$([ "$(st lucas)" = absent ] && [ "$(aud reason)" = no-agent-id ]; echo $?)"
h SubagentStop '{"agent_type":"Explore","agent_id":"x-1"}'
ok "C4d agente desconhecido (Explore): ignorado" "$([ "$(aud reason)" = unknown-agent-type ] && [ "$(st explore)" = absent ]; echo $?)"

# C5: a real subagent: matching start/stop
h SubagentStart '{"agent_type":"lucas","agent_id":"L1"}'
ok "C5 SubagentStart registra e marca lucas working" "$([ "$(st lucas)" = working ] && [ "$(regid active L1)" = True ]; echo $?)"
h PreToolUse '{"agent_type":"lucas","agent_id":"L1"}'
ok "C5b PreToolUse do subagente registrado mantém lucas working" "$([ "$(st lucas)" = working ] && [ "$(aud reason)" = subagent-activity ]; echo $?)"
h SubagentStop '{"agent_type":"lucas","agent_id":"L1"}'
ok "C5c SubagentStop correspondente -> lucas completed e id removido da tabela" "$([ "$(st lucas)" = completed ] && [ "$(regid active L1)" = False ] && [ "$(st alex)" = idle ]; echo $?)"

# C6: stop without a matching start
before="$(agents_sum)"
h SubagentStop '{"agent_type":"sofia","agent_id":"S9"}'
ok "C6 SubagentStop sem SubagentStart correspondente: ignorado, estado público intacto" "$([ "$(agents_sum)" = "$before" ] && [ "$(st sofia)" = absent ] && [ "$(aud reason)" = no-matching-start ]; echo $?)"
h SubagentStart '{"agent_type":"noah","agent_id":"N1"}'
before="$(agents_sum)"; h SubagentStop '{"agent_type":"maya","agent_id":"N1"}'
ok "C6b mesmo agent_id mas tipo diferente: não corresponde" "$([ "$(agents_sum)" = "$before" ] && [ "$(st noah)" = working ]; echo $?)"

# C7: out of order
newenv
h SubagentStop '{"agent_type":"sofia","agent_id":"O1"}'
ok "C7 Stop antes do Start: ignorado na hora (sofia ausente)" "$([ "$(st sofia)" = absent ]; echo $?)"
h SubagentStart '{"agent_type":"sofia","agent_id":"O1"}'
ok "C7 Start tardio do mesmo id: sofia completed (não working falso) e sem registro pendente" "$([ "$(st sofia)" = completed ] && [ "$(le sofia)" = SubagentStop ] && [ "$(regid active O1)" = False ] && [ "$(aud reason)" = start-after-stop ]; echo $?)"
h SubagentStop '{"agent_type":"noah","agent_id":"O2"}'; age early 200
h SubagentStart '{"agent_type":"noah","agent_id":"O2"}'
ok "C7b Stop antigo (> janela) não é reutilizado: Start posterior deixa noah working e registrado" "$([ "$(st noah)" = working ] && [ "$(regid active O2)" = True ]; echo $?)"
h SubagentStop '{"agent_type":"noah","agent_id":"O2"}'
ok "C7c ... e o Stop correspondente o conclui normalmente" "$([ "$(st noah)" = completed ]; echo $?)"

# C8: expired identifiers
newenv
h SubagentStart '{"agent_type":"maya","agent_id":"M1"}'; age active 2000; agestate maya 2000
h SubagentStop '{"agent_type":"maya","agent_id":"M1"}'
ok "C8 id expirado não é reutilizado: Stop tardio é ignorado" "$([ "$(aud reason)" = no-matching-start ] && [ "$(aud accepted)" = False ]; echo $?)"
ok "C8b subagente preso em working por mais de 30 min volta a idle (nunca a completed)" "$([ "$(st maya)" = idle ]; echo $?)"
ok "C8c id expirado removido da tabela local" "$([ "$(regid active M1)" = False ]; echo $?)"
h SubagentStart '{"agent_type":"ethan","agent_id":"E1"}'; rm -f status/subagents.json; agestate ethan 2000
h Stop '{}'
ok "C8d tabela local perdida: working antigo vira idle no próximo evento" "$([ "$(st ethan)" = idle ]; echo $?)"
h SubagentStart '{"agent_type":"olivia","agent_id":"V1"}'; age active 1000; agestate olivia 1000
h Stop '{}'
ok "C8e registro ainda válido (< 30 min): subagente continua working" "$([ "$(st olivia)" = working ]; echo $?)"

# C9: untrusted contexts
newenv
h Stop '{}'
before="$(agents_sum)"
h PreToolUse '{"agent_type":"lucas","agent_id":"U1"}'
ok "C9 PreToolUse de subagente não registrado: ignorado" "$([ "$(agents_sum)" = "$before" ] && [ "$(aud reason)" = uncorrelated-subagent-context ]; echo $?)"
h PreToolUse '{"agent_type":"lucas"}'
ok "C9b PreToolUse com tipo de subagente mas sem agent_id: ignorado (não vira Alex nem lucas)" "$([ "$(agents_sum)" = "$before" ] && [ "$(aud reason)" = agent-type-without-id ]; echo $?)"
h Stop '{"agent_type":"lucas","agent_id":"U1"}'
ok "C9c Stop com agent_id: ignorado" "$([ "$(agents_sum)" = "$before" ] && [ "$(aud reason)" = unexpected-event-in-subagent-context ]; echo $?)"

# C10: privacy - no internal identifier, transcript path or prompt in anything published
newenv
h SubagentStart '{"agent_type":"lucas","agent_id":"SECRETID-123","prompt":"MY SECRET PROMPT"}' --publish
h SubagentStop '{"agent_type":"lucas","agent_id":"SECRETID-123","agent_transcript_path":"/root/.claude/projects/x/secret-transcript.jsonl","last_assistant_message":"password=hunter2 ghp_FAKE","cwd":"/secret/path","session_id":"SID123"}' --publish
h Stop '{"agent_type":"alex"}' --publish
PUB="$(git -C "$O" show data:status.json 2>/dev/null)"
ok "C10 remoto publicou o estado correto (lucas completed, alex idle)" "$(printf '%s' "$PUB" | python3 -c "import json,sys;d=json.load(sys.stdin)['agents'];assert d['lucas']['state']=='completed' and d['alex']['state']=='idle'" 2>/dev/null; echo $?)"
ok "C10 nenhum id/transcript/prompt/caminho no remoto" "$(printf '%s' "$PUB" | grep -qiE 'SECRETID|transcript|prompt|hunter|ghp_|/root|/secret|SID123|agent_id|agent_ref'; [ $? -ne 0 ]; echo $?)"
ok "C10 remoto só tem status.json" "$([ "$(git -C "$O" ls-tree -r --name-only data)" = status.json ]; echo $?)"
ok "C10 status.json local e worktree de publicação sem id" "$(grep -qi 'SECRETID' status/status.json status/.data-wt/status.json; [ $? -ne 0 ]; echo $?)"
ok "C10 auditoria local guarda só impressão curta (agent_ref), não o id" "$(grep -q 'SECRETID' status/events.jsonl; [ $? -ne 0 ] && grep -q agent_ref status/events.jsonl; echo $?)"
[ -f status/subagents.json ]; ok "C10 a tabela local existe (pré-condição)" "$?"
git check-ignore -q status/subagents.json; ok "C10 git check-ignore confirma que status/subagents.json é ignorado" "$?"
[ -z "$(git ls-files -- status/subagents.json)" ]; ok "C10 git ls-files confirma que status/subagents.json NÃO está versionado" "$?"
ND="$S/noignore"; mkdir -p "$ND/status" && git -C "$ND" init -q && echo '{}' > "$ND/status/subagents.json"
git -C "$ND" check-ignore -q status/subagents.json; ok "C10 controle negativo: sem .gitignore o check-ignore FALHA (o teste acima detectaria)" "$([ $? -ne 0 ]; echo $?)"
ok "C10 schema público inalterado (schema/generated_at/agents; state/updated_at/last_event)" "$(printf '%s' "$PUB" | python3 -c "import json,sys;d=json.load(sys.stdin);assert set(d)=={'schema','generated_at','agents'} and d['schema']==1 and all(set(v)=={'state','updated_at','last_event'} for v in d['agents'].values())" 2>/dev/null; echo $?)"

# C11: fail safe - exit 0 and no stdout whatever the input or local state
newenv
mkdir -p status; echo '{{{ not json' > status/subagents.json
fails=0
h SubagentStart '{"agent_type":"lucas","agent_id":"OK1"}' || fails=1
ok "C11 tabela local corrompida: sai com 0, recomeça vazia e registra" "$([ $fails = 0 ] && [ "$(regid active OK1)" = True ]; echo $?)"
fails=0
h SubagentStop '{"agent_type":"lucas","agent_id":123}' || fails=1
h SubagentStop '{"agent_type":["lucas"],"agent_id":["x"]}' || fails=1
h SubagentStop "{\"agent_type\":\"lucas\",\"agent_id\":\"$(printf 'a%.0s' $(seq 1 300))\"}" || fails=1
h SubagentStop '{"agent_type":"lucas","agent_id":"has space/../x"}' || fails=1
h SubagentStart 'not json at all' || fails=1
h SubagentStop '' || fails=1
h SubagentStop '[1,2,3]' || fails=1
ok "C11 payloads malformados (tipos errados, id longo/estranho, JSON inválido, vazio): exit 0 e sem stdout" "$fails"
ok "C11 ... e nenhum deles alterou o estado de lucas (ainda working do OK1)" "$([ "$(st lucas)" = working ]; echo $?)"
t0=$(date +%s); python3 "$H" SubagentStop --publish < <(sleep 12); rc=$?
ok "C11 stdin aberto e mudo: desiste em ~5 s com exit 0" "$([ $rc -eq 0 ] && [ $(( $(date +%s)-t0 )) -le 9 ]; echo $?)"
chmod 000 status/subagents.json 2>/dev/null; h SubagentStart '{"agent_type":"sofia","agent_id":"OK2"}' >/dev/null 2>&1; rc=$?; chmod 644 status/subagents.json 2>/dev/null
ok "C11 tabela local ilegível/protegida: ainda sai com 0" "$rc"

# C12: bounded tables; a live (even silent) subagent is never evicted by pressure
newenv
h SubagentStart '{"agent_type":"sofia","agent_id":"QUIET"}'
for i in $(seq 1 70); do printf '{"agent_type":"lucas","agent_id":"B%d"}' "$i" | python3 "$H" SubagentStart >/dev/null 2>&1; done
ok "C12 tabela ativa limitada a 64 registros" "$([ "$(reg active)" -le 64 ] && [ "$(reg active)" -gt 1 ]; echo $?)"
ok "C12 subagente ativo e silencioso continua registrado após > 64 outros ids" "$([ "$(regid active QUIET)" = True ]; echo $?)"
ok "C12 inícios acima do limite foram ignorados e auditados (registry-full), sem working falso" "$([ "$(aud reason)" = registry-full ] && [ "$(aud accepted)" = False ]; echo $?)"
h SubagentStop '{"agent_type":"sofia","agent_id":"QUIET"}'
ok "C12 o SubagentStop legítimo do subagente original resulta em completed" "$([ "$(st sofia)" = completed ] && [ "$(regid active QUIET)" = False ]; echo $?)"
h SubagentStart '{"agent_type":"noah","agent_id":"AFTER"}'
ok "C12 liberada uma vaga, um novo subagente volta a ser registrado" "$([ "$(st noah)" = working ] && [ "$(regid active AFTER)" = True ]; echo $?)"

# C12c: out-of-order (early) entries are the first to go and never displace live ones
newenv
h SubagentStart '{"agent_type":"sofia","agent_id":"LIVE"}'
for i in $(seq 1 90); do printf '{"agent_type":"lucas","agent_id":"EA%d"}' "$i" | python3 "$H" SubagentStop >/dev/null 2>&1; done
ok "C12c tabela early limitada a 64 e o registro ativo não foi tocado" "$([ "$(reg early)" -le 64 ] && [ "$(reg early)" -gt 0 ] && [ "$(regid active LIVE)" = True ]; echo $?)"
ok "C12c os early mais antigos saem primeiro (o mais recente permanece)" "$([ "$(regid early EA90)" = True ] && [ "$(regid early EA1)" = False ]; echo $?)"

# C14: duplicate / late SubagentStart after a valid SubagentStop must not revive the agent
newenv
h SubagentStart '{"agent_type":"lucas","agent_id":"D1"}'
h SubagentStop '{"agent_type":"lucas","agent_id":"D1"}'
h SubagentStart '{"agent_type":"lucas","agent_id":"D1"}'
ok "C14 Start(D1) -> Stop(D1) -> Start(D1): lucas permanece completed" "$([ "$(st lucas)" = completed ] && [ "$(aud reason)" = duplicate-start-after-stop ] && [ "$(regid active D1)" = False ]; echo $?)"
before="$(agents_sum)"; h SubagentStop '{"agent_type":"lucas","agent_id":"D1"}'
ok "C14b SubagentStop duplicado também é ignorado e não cria registro fora de ordem" "$([ "$(agents_sum)" = "$before" ] && [ "$(aud reason)" = duplicate-stop ] && [ "$(regid early D1)" = False ]; echo $?)"
age done 200
h SubagentStart '{"agent_type":"lucas","agent_id":"D1"}'
ok "C14c após a janela de 120 s o id pode ser reutilizado (lucas volta a working)" "$([ "$(st lucas)" = working ] && [ "$(regid active D1)" = True ]; echo $?)"
h SubagentStart '{"agent_type":"noah","agent_id":"D2"}'; h SubagentStop '{"agent_type":"maya","agent_id":"D2"}'; h SubagentStart '{"agent_type":"noah","agent_id":"D2"}'
ok "C14d duplicado com o mesmo id e mesmo tipo mantém uma única registro ativo (sem estado novo)" "$([ "$(st noah)" = working ] && [ "$(regid active D2)" = True ]; echo $?)"
newenv                                              # out-of-order pairing is preserved and also protected from a later duplicate
h SubagentStop '{"agent_type":"sofia","agent_id":"O9"}'; h SubagentStart '{"agent_type":"sofia","agent_id":"O9"}'; h SubagentStart '{"agent_type":"sofia","agent_id":"O9"}'
ok "C14e Stop antes do Start continua funcionando, e um Start duplicado depois não reabre (completed)" "$([ "$(st sofia)" = completed ] && [ "$(aud reason)" = duplicate-start-after-stop ]; echo $?)"

# C15: concurrent hooks on the local table lose nothing
newenv; rcs="$S/rcs$N"; : > "$rcs"
for i in $(seq 1 30); do ( printf '{"agent_type":"lucas","agent_id":"P%d"}' "$i" | python3 "$H" SubagentStart >/dev/null 2>&1; echo $? >> "$rcs" ) & done; wait
ok "C15 30 SubagentStart concorrentes: todos saem com 0" "$([ "$(wc -l < "$rcs")" = 30 ] && [ "$(grep -vc '^0$' "$rcs")" = 0 ]; echo $?)"
miss=0; for i in $(seq 1 30); do [ "$(regid active P$i)" = True ] || miss=1; done
ok "C15 30 SubagentStart concorrentes: nenhum registro perdido (P1..P30 presentes)" "$miss"
python3 -c "import json;json.load(open('status/subagents.json'));json.load(open('status/status.json'))" 2>/dev/null; ok "C15 arquivos locais continuam JSON válido (sem gravação parcial)" "$?"
: > "$rcs"
for i in $(seq 1 30); do ( printf '{"agent_type":"lucas","agent_id":"P%d"}' "$i" | python3 "$H" SubagentStop >/dev/null 2>&1; echo $? >> "$rcs" ) & done; wait
ok "C15b 30 SubagentStop concorrentes: todos concluídos, tabela ativa vazia, lucas completed" "$([ "$(grep -vc '^0$' "$rcs")" = 0 ] && [ "$(reg active)" = 0 ] && [ "$(st lucas)" = completed ] && [ "$(reg done)" = 30 ]; echo $?)"

# C15c: an entry stamped a few seconds "in the future" (a hook that read the clock before waiting for the lock)
# must not be dropped; an absurdly future one is
newenv
h SubagentStart '{"agent_type":"lucas","agent_id":"SK1"}'; h SubagentStart '{"agent_type":"sofia","agent_id":"SK2"}'
python3 - <<'PYEOF'
import json, time
p = "status/subagents.json"; r = json.load(open(p)); n = int(time.time())
r["active"]["SK1"]["seen"] = n + 3; r["active"]["SK2"]["seen"] = n + 100000
json.dump(r, open(p, "w"))
PYEOF
h SubagentStop '{"agent_type":"lucas","agent_id":"SK1"}'; h SubagentStop '{"agent_type":"sofia","agent_id":"SK2"}'
ok "C15c timestamp poucos segundos no futuro (corrida entre hooks) não descarta o registro" "$([ "$(st lucas)" = completed ]; echo $?)"
ok "C15c timestamp absurdamente no futuro é descartado (sofia não conclui)" "$([ "$(st sofia)" = working ] && [ "$(aud reason)" = no-matching-start ]; echo $?)"

# C16: phantom internal SubagentStop of Alex after Stop, WITH --publish, against a temporary bare remote
newenv
h Stop '{"agent_type":"alex"}' --publish
c1=$(git -C "$O" rev-list --count data); b1=$(git -C "$O" rev-parse data:status.json)
h SubagentStop '{"agent_type":"alex","agent_id":"phantom-1","agent_transcript_path":"/root/x.jsonl"}' --publish
h SubagentStop '{"agent_type":"alex","agent_id":"phantom-2"}' --publish
h SubagentStop '{"agent_type":"","agent_id":"phantom-3"}' --publish
c2=$(git -C "$O" rev-list --count data); b2=$(git -C "$O" rev-parse data:status.json)
ok "C16 SubagentStop fantasma de Alex com --publish: nenhum commit redundante no remoto" "$([ "$c1" = 1 ] && [ "$c1" = "$c2" ]; echo $?)"
ok "C16 snapshot remoto inalterado (mesmo blob) e Alex continua idle" "$([ "$b1" = "$b2" ] && git -C "$O" show data:status.json | python3 -c "import json,sys;d=json.load(sys.stdin)['agents'];assert d['alex']['state']=='idle' and d['alex']['last_event']=='Stop'" 2>/dev/null; echo $?)"
ok "C16 o remoto usado é o bare temporário (e não o real)" "$([ "$(git -C "$W" remote get-url origin)" = "$O" ]; echo $?)"
ok "C16 o hook tentou publicar e concluiu 'unchanged'" "$(tail -n1 status/publish.log | grep -q unchanged; echo $?)"
ok "C16 .dirty limpo" "$([ ! -e status/.dirty ]; echo $?)"

# C13: public state file keeps the exact schema after all of the above
ok "C13 status.json local: schema/generated_at/agents e campos por agente inalterados" "$(python3 -c "import json;d=json.load(open('status/status.json'));assert set(d)=={'schema','generated_at','agents'} and all(set(v)=={'state','updated_at','last_event'} for v in d['agents'].values())" 2>/dev/null; echo $?)"
exit $FAIL
