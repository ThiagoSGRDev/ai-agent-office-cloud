#!/usr/bin/env bash
# Tests for .claude/hooks/scope_guard.py (fail-closed write scope guard) and the qa_run.sh argument check.
# No network. Run: bash tests/scope_guard_test.sh
set -u
HERE="$(cd "$(dirname "$0")/.." && pwd)"; G="$HERE/.claude/hooks/scope_guard.py"
S="$(mktemp -d)"; trap 'rm -rf "$S"' EXIT
P="$S/proj"; FAIL=0
ok(){ if [ "$2" = 0 ]; then echo "PASS $1"; else echo "FAIL $1"; FAIL=1; fi; }

mkdir -p "$P/sandbox" "$P/tests" "$P/docs/js" "$P/.claude" "$P/status"
echo x > "$P/ARCHITECTURE.md"
ln -s ../docs/js "$P/sandbox/linkdir"
ln -s ../ARCHITECTURE.md "$P/sandbox/linkfile"
ln -s /tmp "$P/tests/escape"

# run JSON -> exit code of the guard
run(){ printf '%s' "$1" | CLAUDE_PROJECT_DIR="$P" python3 "$G" >/dev/null 2>&1; echo $?; }
# t NAME EXPECTED_RC JSON
t(){ local rc; rc="$(run "$3")"; [ "$rc" = "$2" ] ; ok "$1 (rc=$rc, want $2)" $?; }
# w NAME EXPECTED_RC AGENT TOOL PATH
w(){ t "$1" "$2" "$(printf '{"tool_name":"%s","tool_input":{"file_path":"%s"},"agent_type":"%s"}' "$4" "$5" "$3")"; }

rm -f "$P/status/scope.txt"
w "sofia sandbox/a.py" 0 sofia Write sandbox/a.py
w "sofia tests/t.py" 0 sofia Write tests/t.py
w "sofia absolute in sandbox" 0 sofia Write "$P/sandbox/a.py"
w "sofia docs/js/x.js" 2 sofia Write docs/js/x.js
w "sofia .claude/hooks/x.py" 2 sofia Write .claude/hooks/x.py
w "sofia status/scope.txt" 2 sofia Write status/scope.txt
w "sofia root x.txt" 2 sofia Write x.txt
w "sofia sandbox/../docs/js/x.js" 2 sofia Write sandbox/../docs/js/x.js
w "sofia symlink dir" 2 sofia Write sandbox/linkdir/x.js
w "sofia symlink file Edit" 2 sofia Edit sandbox/linkfile
w "sofia tests/escape/x" 2 sofia Write tests/escape/x
w "sofia /etc/x" 2 sofia Write /etc/x
w "sofia .. out of root" 2 sofia Write ../../x
w "sofia MultiEdit denied" 2 sofia MultiEdit docs/js/x.js
w "sofia MultiEdit allowed" 0 sofia MultiEdit sandbox/a.py
t "sofia NotebookEdit denied" 2 '{"tool_name":"NotebookEdit","tool_input":{"notebook_path":"docs/n.ipynb"},"agent_type":"sofia"}'
t "sofia NotebookEdit allowed" 0 '{"tool_name":"NotebookEdit","tool_input":{"notebook_path":"sandbox/n.ipynb"},"agent_type":"sofia"}'

w "lucas no scope sandbox/a.py" 0 lucas Write sandbox/a.py
w "lucas no scope tests/t.py" 2 lucas Write tests/t.py
printf 'docs/js/\n# comentario\n\n.claude/\n' > "$P/status/scope.txt"
w "lucas scope docs/js/a.js" 0 lucas Write docs/js/a.js
w "lucas scope docs/js/sub/b.js" 0 lucas Write docs/js/sub/b.js
w "lucas scope .claude/x denied" 2 lucas Write .claude/x
w "lucas scope ARCHITECTURE.md denied" 2 lucas Write ARCHITECTURE.md
printf 'docs/jsx/\n' > "$P/status/scope.txt"
w "lucas partial prefix docs/jsx" 2 lucas Write docs/js/a.js
rm -f "$P/status/scope.txt"

w "agent alex" 2 alex Write sandbox/a.py
w "agent Explore" 2 Explore Write sandbox/a.py
t "agent absent" 2 '{"tool_name":"Write","tool_input":{"file_path":"sandbox/a.py"}}'
t "invalid JSON" 2 'not json{'
t "Write without file_path" 2 '{"tool_name":"Write","tool_input":{},"agent_type":"sofia"}'
w "Read any path" 0 sofia Read /etc/passwd

# (a) agent definitions must not grant Bash
for a in lucas sofia; do
  f="$HERE/.claude/agents/$a.md"
  [ -f "$f" ] && ! grep -E '^tools:' "$f" | grep -qiw Bash; ok "$a.md tools has no Bash" $?
done

# (b) qa_run.sh rejects bad arguments without running anything
Q="$HERE/tests/qa_run.sh"
chk(){ local n="$1"; shift; local out rc; out="$(bash "$Q" "$@" 2>&1)"; rc=$?
       [ "$rc" = 2 ] && [ "$out" = "qa_run: suite invalida" ]; ok "qa_run rejects $n" $?; }
chk "no args"
chk "two args" classify guard
chk "injection" 'classify; echo x'
chk "path" '../x'

# --only lucas,sofia (settings.json mode): only those agent types are restricted
runo(){ printf '%s' "$1" | CLAUDE_PROJECT_DIR="$P" python3 "$G" --only lucas,sofia >/dev/null 2>&1; echo $?; }
to(){ local rc; rc="$(runo "$3")"; [ "$rc" = "$2" ]; ok "$1 (rc=$rc, want $2)" $?; }
J(){ printf '{"tool_name":"Write","tool_input":{"file_path":"%s"},"agent_type":"%s"}' "$2" "$1"; }
to "only: lucas fora do escopo negado" 2 "$(J lucas "$P/tests/t.py")"
to "only: lucas dentro do escopo permitido" 0 "$(J lucas "$P/sandbox/a.py")"
to "only: sofia fora do escopo negada" 2 "$(J sofia "$P/docs/js/x.js")"
to "only: sessao principal (alex) nao e restringida" 0 "$(J alex "$P/docs/js/x.js")"
to "only: agent_type ausente nao e restringido" 0 '{"tool_name":"Write","tool_input":{"file_path":"x"}}'
to "only: Lucas continua bloqueado em .claude" 2 "$(J lucas "$P/.claude/x.py")"
rc="$(printf '%s' "$(J lucas "$P/sandbox/a.py")" | CLAUDE_PROJECT_DIR="$P" python3 "$G" --only >/dev/null 2>&1; echo $?)"; [ "$rc" = 2 ]; ok "only sem valor falha fechado (rc=$rc)" $?
exit $FAIL
