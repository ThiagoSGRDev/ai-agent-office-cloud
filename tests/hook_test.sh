#!/usr/bin/env bash
# Regression test for .claude/hooks/office_hook.py using a local fake "origin". Run: bash tests/hook_test.sh
# Verifies: sanitization (no leaks), rate limit, Stop always publishes, Stop does NOT reset running
# subagents, recovery after a rejected push, and that every failure mode exits 0 quickly.
set -u
HERE="$(cd "$(dirname "$0")/.." && pwd)"; H="$HERE/.claude/hooks/office_hook.py"
S="$(mktemp -d)"; trap 'rm -rf "$S"' EXIT; cd "$S"
G="git -c user.name=t -c user.email=t@example.invalid"; FAIL=0
ok(){ if [ "$2" = 0 ]; then echo "PASS $1"; else echo "FAIL $1"; FAIL=1; fi; }
git init -q --bare origin.git; git clone -q origin.git seed 2>/dev/null
(cd seed && echo x > README && git add . && $G commit -qm init && git branch -M main && git push -q origin main) >/dev/null 2>&1
git clone -q origin.git work 2>/dev/null; cd work; echo "status/" > .gitignore; export CLAUDE_PROJECT_DIR="$PWD"
hook(){ ev="$1"; shift; printf '%s' "$PAYLOAD" | python3 "$H" "$ev" "$@"; }
pub(){ git -C "$S/origin.git" show data:status.json 2>/dev/null; }
py(){ python3 -c "import json,sys;d=json.load(sys.stdin);$1" <<<"$(pub)"; }

PAYLOAD='{"cwd":"/secret/path","session_id":"SID123"}' hook SessionStart
PAYLOAD='{"agent_type":"lucas","agent_id":"a1","prompt":"MY SECRET PROMPT"}' hook SubagentStart
PAYLOAD='{"agent_type":"lucas","last_assistant_message":"password=hunter2 /root/x ghp_FAKE"}' hook SubagentStop --publish
ok "publica a branch data no primeiro SubagentStop" "$([ -n "$(pub)" ]; echo $?)"
ok "somente campos permitidos (schema/generated_at/agents)" "$(py 'assert set(d)=={"schema","generated_at","agents"} and all(set(v)=={"state","updated_at","last_event"} for v in d["agents"].values())' >/dev/null 2>&1; echo $?)"
ok "nada sensível vazou" "$(pub | grep -qiE 'secret|hunter|ghp_|/root|SID123|prompt|transcript|cwd' ; [ $? -ne 0 ]; echo $?)"
PAYLOAD='{"agent_type":"sofia"}' hook SubagentStart; PAYLOAD='{"agent_type":"sofia"}' hook SubagentStop --publish
ok "limite de frequência pula o 2º SubagentStop" "$(tail -n1 status/publish.log | grep -q 'rate limit'; echo $?)"
PAYLOAD='{"agent_type":"sofia"}' hook SubagentStart
PAYLOAD='{}' hook Stop --publish
ok "Stop publica mesmo dentro do limite" "$(py 'assert d["agents"]["alex"]["state"]=="idle"' >/dev/null 2>&1; echo $?)"
ok "Stop NÃO zera subagente ainda em execução (sofia continua working)" "$(py 'assert d["agents"]["sofia"]["state"]=="working"' >/dev/null 2>&1; echo $?)"
ok "agentes desconhecidos (ex.: Explore) são ignorados" "$(PAYLOAD='{"agent_type":"Explore"}' hook SubagentStop --publish; python3 -c "import json;d=json.load(open('status/status.json'));assert 'explore' not in d['agents']" ; echo $?)"

# divergence: someone else pushes to data first -> next publish still succeeds
(cd "$S" && git clone -q -b data origin.git other 2>/dev/null && cd other && echo 1 > other.txt && git add . && $G commit -qm other && git push -q origin data) >/dev/null 2>&1
rm -f status/.last_publish; PAYLOAD='{"agent_type":"lucas"}' hook SubagentStart; PAYLOAD='{}' hook Stop --publish
ok "recupera de divergência na branch data" "$(tail -n1 status/publish.log | grep -q published; echo $?)"

# failure modes: always exit 0, never hang
fx(){ local t0=$(date +%s); printf '%s' "$2" | env $3 python3 "$H" $1 --publish; local rc=$?; [ $rc -eq 0 ] && [ $(( $(date +%s) - t0 )) -lt 30 ]; echo $?; }
rm -f status/.last_publish; ok "remoto inválido: exit 0 e rápido" "$(fx Stop '{}' AAO_PUBLISH_REMOTE=https://invalid.invalid/x.git)"
ok "JSON inválido no stdin: exit 0" "$(fx Stop 'not json {{{' X=1)"
printf '#!/bin/sh\necho rejected >&2\nexit 1\n' > "$S/origin.git/hooks/pre-receive"; chmod +x "$S/origin.git/hooks/pre-receive"
rm -f status/.last_publish; PAYLOAD='{"agent_type":"lucas"}' hook SubagentStop; ok "push recusado: exit 0" "$(fx Stop '{}' X=1)"
rm -f "$S/origin.git/hooks/pre-receive"; rm -f status/.last_publish
PAYLOAD='{}' hook Stop --publish; ok "depois de um push recusado, volta a publicar" "$(tail -n1 status/publish.log | grep -qE 'published|unchanged'; echo $?)"
t0=$(date +%s); python3 "$H" Stop < <(sleep 12); rc=$?; ok "stdin aberto e mudo: desiste em ~5 s com exit 0" "$([ $rc -eq 0 ] && [ $(( $(date +%s) - t0 )) -le 9 ]; echo $?)"
mkdir -p "$S/nogit"; (cd "$S/nogit" && CLAUDE_PROJECT_DIR="$S/nogit" bash -c "echo '{}' | python3 '$H' Stop --publish"); ok "fora de repositório git: exit 0" "$?"
exit $FAIL
