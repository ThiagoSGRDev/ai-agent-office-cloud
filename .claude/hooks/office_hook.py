#!/usr/bin/env python3
"""AI Agent Office hook.

Records the state of each agent LOCALLY (status/, git-ignored) and, when called
with --publish, publishes a SANITIZED snapshot to the `data` branch.

Guarantees: never raises, never prints, ALWAYS exits 0, bounded run time.
Published fields are an allowlist (schema, generated_at, agent name, state,
updated_at, last_event). Nothing else from a hook payload is ever published.
"""
import fcntl
import json
import os
import re
import select
import subprocess
import sys
import time

EVENT = sys.argv[1] if len(sys.argv) > 1 else "unknown"
PUBLISH = "--publish" in sys.argv[2:]
ROOT = os.environ.get("CLAUDE_PROJECT_DIR") or os.getcwd()
DIR = os.path.join(ROOT, "status")
WT = os.path.join(DIR, ".data-wt")
REMOTE = os.environ.get("AAO_PUBLISH_REMOTE", "origin")
REF = "refs/aao/data"
MIN_INTERVAL = 30          # seconds between publishes (Stop is always allowed)
DEADLINE = 25              # total seconds allowed for git work
MAIN_AGENT = "alex"
KNOWN = {"alex", "arthur", "lucas", "sofia", "noah", "maya", "ethan", "olivia"}
STATE = {"SessionStart": "idle", "SubagentStart": "working", "PreToolUse": "working",
         "SubagentStop": "completed", "Notification": "blocked", "Stop": "idle"}
PUBLIC_STATES = {"idle", "working", "completed", "blocked"}
SAFE = re.compile(r'^[A-Za-z0-9_{}\[\]":,.\s-]*$')   # final privacy guard on published text
START = time.time()


def log(msg):
    try:
        os.makedirs(DIR, exist_ok=True)
        msg = re.sub(r"https?://\S+", "<url>", str(msg))[:300].replace("\n", " | ")
        with open(os.path.join(DIR, "publish.log"), "a") as f:
            f.write("%d %s %s\n" % (time.time(), EVENT, msg))
    except Exception:
        pass


def agent_of(payload):
    a = payload.get("agent_type")
    if isinstance(a, str):
        a = a.lower()
        return a if a in KNOWN else None      # built-in/unknown subagent types are ignored
    return MAIN_AGENT                          # main session = Alex


def record(payload):
    os.makedirs(DIR, exist_ok=True)
    now = int(time.time())
    raw = payload.get("agent_type")
    agent = agent_of(payload)
    with open(os.path.join(DIR, ".lock"), "w") as lk:
        fcntl.flock(lk, fcntl.LOCK_EX)
        with open(os.path.join(DIR, "events.jsonl"), "a") as f:
            f.write(json.dumps({"ts": now, "event": EVENT, "agent": agent,
                                "agent_type": raw if isinstance(raw, str) else None,
                                "has_agent_id": "agent_id" in payload}) + "\n")
        sp = os.path.join(DIR, "status.json")
        try:
            with open(sp) as f:
                st = json.load(f)
        except Exception:
            st = {}
        agents = st.get("agents") if isinstance(st.get("agents"), dict) else {}
        if agent and EVENT in STATE:
            agents[agent] = {"state": STATE[EVENT], "updated_at": now, "last_event": EVENT}
        # NOTE: "Stop" only ends the MAIN session's turn (Alex becomes idle via STATE). Subagents may
        # still be running in the background, so their state is NOT touched here; if one never reports
        # SubagentStop, the frontend expires its stale "working" claim by age.
        out = {"schema": 1, "generated_at": now, "agents": agents}
        tmp = sp + ".tmp"
        with open(tmp, "w") as f:
            json.dump(out, f, indent=2)
        os.replace(tmp, sp)
        return out


def public_snapshot(local):
    out = {"schema": 1, "generated_at": int(local["generated_at"]), "agents": {}}
    for name, a in (local.get("agents") or {}).items():
        if name not in KNOWN or not isinstance(a, dict):
            continue
        st, ua, ev = a.get("state"), a.get("updated_at"), a.get("last_event")
        if st not in PUBLIC_STATES or not isinstance(ua, int) or not (1577836800 < ua < 4102444800):
            continue
        out["agents"][name] = {"state": st, "updated_at": ua,
                               "last_event": ev if ev in STATE else None}
    return out


def git(args, cwd=None):
    t = min(15, DEADLINE - (time.time() - START))
    if t <= 1:
        raise TimeoutError("deadline reached")
    env = dict(os.environ, GIT_TERMINAL_PROMPT="0")
    return subprocess.run(["git"] + args, cwd=cwd or ROOT, capture_output=True,
                          text=True, timeout=t, env=env)


def publish(local):
    pub = public_snapshot(local)
    text = json.dumps(pub, indent=2, sort_keys=True) + "\n"
    if not SAFE.match(text):
        log("blocked: unsafe characters in snapshot")
        return
    stamp = os.path.join(DIR, ".last_publish")
    if EVENT != "Stop":
        try:
            with open(stamp) as f:
                if time.time() - float(f.read()) < MIN_INTERVAL:
                    log("skipped: rate limit")
                    return
        except Exception:
            pass
    if git(["rev-parse", "--git-dir"]).returncode:
        log("skipped: not a git repository")
        return
    git(["worktree", "prune"])
    f = git(["fetch", "--depth=1", REMOTE, "+data:" + REF])
    remote_has = f.returncode == 0
    if not remote_has and "couldn't find remote ref" not in f.stderr:
        log("fetch failed: " + f.stderr)
        return
    if not os.path.isdir(WT):
        r = (git(["worktree", "add", "--detach", WT, REF]) if remote_has
             else git(["worktree", "add", "--orphan", "-b", "aao-data", WT]))
        if r.returncode:
            log("worktree failed: " + r.stderr)
            return
    elif remote_has:
        r = git(["reset", "--hard", REF], cwd=WT)
        if r.returncode:
            log("reset failed: " + r.stderr)
            return
    try:
        with open(os.path.join(WT, "status.json")) as f:
            # only skip when the REMOTE already has this state (a failed earlier push must be retried)
            if remote_has and json.load(f).get("agents") == pub["agents"]:
                log("skipped: unchanged")
                return
    except Exception:
        pass
    with open(os.path.join(WT, "status.json"), "w") as f:
        f.write(text)
    r = git(["add", "status.json"], cwd=WT)
    if r.returncode:
        log("add failed: " + r.stderr)
        return
    if git(["diff", "--cached", "--quiet"], cwd=WT).returncode != 0:   # something new to commit
        r = git(["-c", "user.name=AI Agent Office", "-c", "user.email=noreply@users.noreply.github.com",
                 "commit", "-q", "-m", "status snapshot"], cwd=WT)
        if r.returncode:
            log("commit failed: " + (r.stderr or r.stdout))
            return
    r = git(["push", REMOTE, "HEAD:refs/heads/data"], cwd=WT)   # also retries an earlier failed push
    if r.returncode:
        log("push failed: " + r.stderr)
        return
    try:
        with open(stamp, "w") as f:
            f.write(str(time.time()))
    except Exception:
        pass
    log("published")


def read_payload(timeout=5.0):
    """Read the hook JSON from stdin without ever waiting forever."""
    chunks, end = [], time.time() + timeout
    try:
        fd = sys.stdin.fileno()
        while time.time() < end:
            ready, _, _ = select.select([fd], [], [], max(0.0, end - time.time()))
            if not ready:
                break
            data = os.read(fd, 65536)
            if not data:
                break
            chunks.append(data)
            if sum(len(c) for c in chunks) > 4_000_000:
                break
        payload = json.loads(b"".join(chunks).decode("utf-8", "replace"))
        return payload if isinstance(payload, dict) else {}
    except Exception:
        return {}


def main():
    payload = read_payload()
    local = record(payload)
    if PUBLISH:
        publish(local)


if __name__ == "__main__":
    try:
        main()
    except BaseException as e:           # never block or fail the Claude Code session
        log("error: %s" % type(e).__name__)
    sys.exit(0)
