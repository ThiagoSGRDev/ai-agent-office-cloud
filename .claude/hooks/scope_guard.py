#!/usr/bin/env python3
"""PreToolUse scope guard for subagents. Fails closed: exit 2 blocks, exit 0 allows."""
import json
import os
import sys

WRITE_TOOLS = ("Write", "Edit", "MultiEdit", "NotebookEdit")
DENY = (".claude", ".git", ".github", "status")   # infrastructure: never writable by a subagent; everything else is deny-by-default unless in scope


def block(why):
    sys.stderr.write("scope_guard: bloqueado (%s)\n" % why)
    sys.exit(2)


def under(rel, prefix):
    return rel == prefix or rel.startswith(prefix + "/")


def lucas_prefixes(root):
    try:
        with open(os.path.join(root, "status", "scope.txt"), encoding="utf-8") as f:
            lines = f.read().splitlines()
    except FileNotFoundError:
        return ["sandbox"]
    except Exception:
        block("scope.txt ilegivel")
    out = []
    for line in lines:
        s = line.strip()
        if not s or s.startswith("#") or s.startswith("/"):
            continue
        while s.startswith("./"):
            s = s[2:]
        s = s.rstrip("/")
        if not s or ".." in s.split("/"):
            continue
        out.append(s)
    return out or ["sandbox"]


def main():
    try:
        data = json.load(sys.stdin)
        if not isinstance(data, dict):
            block("json invalido")
        tool = data.get("tool_name")
        if tool not in WRITE_TOOLS:
            sys.exit(0)
        argv = sys.argv[1:]
        if "--only" in argv:      # settings.json mode: restrict ONLY the listed agent types (e.g. not the main session)
            i = argv.index("--only")
            if i + 1 >= len(argv) or not argv[i + 1].strip():
                block("--only sem valor")
            who = data.get("agent_type")
            who = who.lower() if isinstance(who, str) else ""
            if who not in {a.strip().lower() for a in argv[i + 1].split(",")}:
                sys.exit(0)
        ti = data.get("tool_input")
        if not isinstance(ti, dict):
            block("tool_input ausente")
        path = ti.get("file_path") or ti.get("notebook_path")
        if not isinstance(path, str) or not path.strip() or "\0" in path:
            block("caminho ausente")
        root = os.path.realpath(os.environ.get("CLAUDE_PROJECT_DIR") or os.getcwd())
        target = os.path.realpath(os.path.join(root, path))
        rel = os.path.relpath(target, root).replace(os.sep, "/")
        if rel == "." or rel == ".." or rel.startswith("../"):
            block("fora da raiz")
        if any(under(rel, d) for d in DENY):
            block("area protegida")
        agent = data.get("agent_type")
        agent = agent.lower() if isinstance(agent, str) else ""
        if agent == "sofia":
            allowed = ["tests", "sandbox"]
        elif agent == "lucas":
            allowed = lucas_prefixes(root)
        else:
            block("agente sem permissao")
        allowed = [p for p in allowed if not any(under(p, d) for d in DENY)]
        if not any(under(rel, p) for p in allowed):
            block("fora do escopo")
    except SystemExit:
        raise
    except Exception:
        block("erro interno")
    sys.exit(0)


if __name__ == "__main__":
    main()
