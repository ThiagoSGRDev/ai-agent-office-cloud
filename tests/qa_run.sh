#!/usr/bin/env bash
# QA runner with bounded output. Only Alex (who has Bash) should run this; subagents (Lucas, Sofia) have no Bash.
# Usage: bash tests/qa_run.sh <classify|publish|hook|state|guard|sandbox>
set -u
if [ "$#" -ne 1 ]; then echo "qa_run: suite invalida" >&2; exit 2; fi
NAME="$1"
case "$NAME" in
  classify) CMD=(bash tests/hook_classify_test.sh) ;;
  publish)  CMD=(bash tests/hook_publish_test.sh) ;;
  hook)     CMD=(bash tests/hook_test.sh) ;;
  state)    CMD=(node tests/state_test.mjs) ;;
  guard)    CMD=(bash tests/scope_guard_test.sh) ;;
  sandbox)  CMD=(python3 -m unittest discover -s sandbox/tests -p 'test_*.py') ;;
  *) echo "qa_run: suite invalida" >&2; exit 2 ;;
esac

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SYSPATH="/usr/local/bin:/usr/bin:/bin"
NODE="$(command -v node 2>/dev/null || true)"
[ -n "$NODE" ] && SYSPATH="$SYSPATH:$(dirname "$NODE")"
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
LOG="$TMP/log"
cd "$ROOT" || exit 2
env -i PATH="$SYSPATH" HOME="$TMP" TMPDIR="$TMP" LANG=C.UTF-8 PYTHONPATH="$ROOT/sandbox" PYTHONDONTWRITEBYTECODE=1 timeout 300 "${CMD[@]}" >"$LOG" 2>&1
RC=$?

FAILN="$(grep -c '^FAIL' "$LOG" || true)"
PASSN="$(grep -c '^PASS' "$LOG" || true)"
if [ "$NAME" = sandbox ]; then
  if grep -qE '^(OK|ok)' "$LOG"; then PASSN=ok; fi
  DETAIL='^(FAIL:|ERROR:)|Error'
else
  DETAIL='^FAIL'
fi
echo "suite=$NAME rc=$RC PASS=$PASSN FAIL=$FAILN"
grep -E "$DETAIL" "$LOG" | head -n 15 | cut -c1-200
tail -n 3 "$LOG" | cut -c1-200
exit "$RC"
