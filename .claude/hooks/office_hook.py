#!/usr/bin/env python3
"""AI Agent Office hook.

Records the state of each agent LOCALLY (status/, git-ignored) and, when called
with --publish, publishes a SANITIZED snapshot to the `data` branch.

Guarantees: never raises, never prints, ALWAYS exits 0, bounded run time.
Final events (Stop, SubagentStop) are never rate limited: they mark status/.dirty and one publisher
(status/.publish.lock) republishes the latest state while changes are pending. A hook that cannot take
the lock returns at once; a failed or timed-out publish leaves .dirty for the next event.
Classification: a SubagentStop completes an agent only when it matches a SubagentStart seen earlier
(same agent_id and type, kept LOCALLY in status/subagents.json, expiring). SubagentStop claiming to be the
main agent, with an empty type or no match is ignored and audited (events.jsonl: accepted/reason).
Published fields are an allowlist (schema, generated_at, agent name, state,
updated_at, last_event). Nothing else from a hook payload is ever published.
"""
import fcntl
import hashlib
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
MIN_INTERVAL = 30          # seconds between publishes (FINAL events are exempt)
FINAL = {"Stop", "SubagentStop", "SubagentStart"}   # never rate limited or dropped (SubagentStart makes "working" visible)
PUB_LOCK = os.path.join(DIR, ".publish.lock")   # single publisher at a time
DIRTY = os.path.join(DIR, ".dirty")             # local state not yet confirmed on the remote
DEADLINE = 25              # total seconds allowed for git work
MAIN_AGENT = "alex"
KNOWN = {"alex", "arthur", "lucas", "sofia", "noah", "maya", "ethan", "olivia"}
STATE = {"SessionStart": "idle", "SubagentStart": "working", "PreToolUse": "working",
         "SubagentStop": "completed", "Notification": "blocked", "Stop": "idle"}
PUBLIC_STATES = {"idle", "working", "completed", "blocked"}
ID_RE = re.compile(r"^[A-Za-z0-9_.:-]{1,128}$")   # agent_id shape we accept (kept LOCAL, never published)
ACTIVE_TTL = 1800          # s without activity before a subagent registration (and a stuck "working") expires
MAIN_TTL = 900             # s a main-agent "working" may go without news before it expires to idle
EARLY_TTL = 120           # s window to pair a SubagentStop that arrived before its SubagentStart
DONE_TTL = 120             # s a finished agent_id is remembered, so a duplicate/late SubagentStart cannot revive it
SKEW_S = 60                # tolerated "future" timestamp: concurrent hooks read the clock at slightly different moments
MAX_ACTIVE = 64           # max live registrations. Never evicted: when full, new SubagentStarts are ignored
MAX_AUX = 64               # max entries in each auxiliary table ("early", "done"); oldest are dropped first
REG = os.path.join(DIR, "subagents.json")      # LOCAL correlation table: agent_id -> type (status/ is git-ignored)
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


def load_registry(now):
    """Local correlation tables (active / early / done). Corrupt or missing file -> empty; expired entries dropped."""
    try:
        with open(REG) as f:
            raw = json.load(f)
    except Exception:
        raw = {}
    reg = {"active": {}, "early": {}, "done": {}}
    for table, key, ttl in (("active", "seen", ACTIVE_TTL), ("early", "ts", EARLY_TTL), ("done", "ts", DONE_TTL)):
        src = raw.get(table) if isinstance(raw, dict) and isinstance(raw.get(table), dict) else {}
        for aid, v in list(src.items())[:512]:
            if (ID_RE.match(str(aid)) and isinstance(v, dict) and v.get("type") in KNOWN
                    and isinstance(v.get(key), int) and -SKEW_S <= now - v[key] <= ttl):
                reg[table][aid] = v
    return reg


def save_registry(reg):
    # live registrations are never trimmed here (classify() refuses new ones when MAX_ACTIVE is reached);
    # the auxiliary tables lose their OLDEST entries first
    out = {"active": reg["active"]}
    for table in ("early", "done"):
        # timestamps have 1 s resolution: ties are broken by insertion order (later insertion = newer)
        ranked = sorted(enumerate(reg[table].items()), key=lambda iv: (iv[1][1]["ts"], iv[0]), reverse=True)
        out[table] = dict(kv for _, kv in sorted(ranked[:MAX_AUX]))
    tmp = REG + ".tmp"
    with open(tmp, "w") as f:
        json.dump(out, f)
    os.replace(tmp, REG)


def classify(payload, reg, now):
    """-> (agent or None, state override or None, last_event, reason). agent None = event ignored for state.
    Only a SubagentStop that matches a registered SubagentStart (same agent_id and type) may complete a
    subagent. Anything claiming to be the main agent through SubagentStop is internal and ignored."""
    at = payload.get("agent_type")
    at = at.strip().lower() if isinstance(at, str) else ""
    aid = payload.get("agent_id")
    aid = aid if isinstance(aid, str) and ID_RE.match(aid) else None
    if EVENT in ("SubagentStart", "SubagentStop"):
        if not aid:
            return None, None, EVENT, "no-agent-id"
        if not at:
            return None, None, EVENT, "empty-agent-type"
        if at == MAIN_AGENT:
            return None, None, EVENT, "main-agent-type"
        if at not in KNOWN:
            return None, None, EVENT, "unknown-agent-type"
        done = reg["done"].get(aid)
        done = done if done and done["type"] == at else None
        if EVENT == "SubagentStart":
            if done:                                      # duplicate/late start of a finished agent
                return None, None, EVENT, "duplicate-start-after-stop"
            early = reg["early"].pop(aid, None)
            if early and early["type"] == at:             # its stop arrived first: already finished
                reg["done"][aid] = {"type": at, "ts": now}
                others = any(v["type"] == at for v in reg["active"].values())
                return at, ("working" if others else "completed"), "SubagentStop", "start-after-stop"
            if len(reg["active"]) >= MAX_ACTIVE and aid not in reg["active"]:
                return None, None, EVENT, "registry-full"  # never evict a live registration
            reg["active"][aid] = {"type": at, "start": now, "seen": now}
            return at, None, EVENT, "start-registered"
        act = reg["active"].get(aid)
        if act and act["type"] == at:
            del reg["active"][aid]
            reg["done"][aid] = {"type": at, "ts": now}
            if any(v["type"] == at for v in reg["active"].values()):   # public state is per agent name:
                return at, "working", EVENT, "stop-matched-others-active"  # another instance is still running
            return at, None, EVENT, "stop-matched"
        if done:                                          # duplicate stop of a finished agent
            return None, None, EVENT, "duplicate-stop"
        reg["early"][aid] = {"type": at, "ts": now}       # may pair with a late SubagentStart
        return None, None, EVENT, "no-matching-start"
    if aid:                                               # some other event inside a subagent context
        if EVENT not in ("PreToolUse", "Notification"):
            return None, None, EVENT, "unexpected-event-in-subagent-context"
        act = reg["active"].get(aid)
        if not act:
            return None, None, EVENT, "uncorrelated-subagent-context"
        act["seen"] = now
        return act["type"], None, EVENT, "subagent-activity"
    if at in ("", MAIN_AGENT):                            # no agent_id: the main session
        return MAIN_AGENT, None, EVENT, "main-session"
    return None, None, EVENT, "agent-type-without-id"


def record(payload):
    os.makedirs(DIR, exist_ok=True)
    raw = payload.get("agent_type")
    aid_raw = payload.get("agent_id")
    with open(os.path.join(DIR, ".lock"), "w") as lk:
        fcntl.flock(lk, fcntl.LOCK_EX)
        now = int(time.time())      # read AFTER taking the lock: a hook that waited must not use an older clock
        sp = os.path.join(DIR, "status.json")
        # status.json is rewritten on every event, so ANY structurally invalid content is replaced here
        # (recovery); only a fixed label is recorded, never the content
        recovery = None
        try:
            with open(sp) as f:
                st = json.load(f)
        except FileNotFoundError:
            st = {}
        except ValueError:
            st, recovery = {}, "malformed-json"
        except Exception:
            st, recovery = {}, "unreadable"
        if not isinstance(st, dict):
            st, recovery = {}, "not-an-object"
        agents = st.get("agents")
        if not isinstance(agents, dict):
            recovery = recovery or ("agents-not-an-object" if "agents" in st else None)
            agents = {}
        clean = {k: v for k, v in agents.items() if isinstance(k, str) and isinstance(v, dict)}
        if len(clean) != len(agents):
            recovery = recovery or "invalid-agent-entries"
        agents = clean
        reg = load_registry(now)
        # a subagent left "working" with no live registration and no news for ACTIVE_TTL (lost
        # SubagentStop) goes back to idle instead of staying stuck; no completion is invented
        live = {v["type"] for v in reg["active"].values()}
        expired = None
        for name, a in agents.items():
            if (name == MAIN_AGENT and isinstance(a, dict) and a.get("state") == "working"
                    and isinstance(a.get("updated_at"), int) and now - a["updated_at"] > MAIN_TTL):
                a.update(state="idle", updated_at=now, last_event="Stop")
                expired = "alex-main-ttl"
                log("expired main agent working state")
            if (name != MAIN_AGENT and isinstance(a, dict) and a.get("state") == "working"
                    and isinstance(a.get("updated_at"), int) and now - a["updated_at"] > ACTIVE_TTL
                    and name not in live):
                a["state"], a["updated_at"] = "idle", now
        agent, state, last_event, reason = classify(payload, reg, now)
        if agent and EVENT in STATE:
            agents[agent] = {"state": state or STATE[EVENT], "updated_at": now, "last_event": last_event}
        else:
            agent = None
        try:
            save_registry(reg)
        except Exception:
            pass
        audit = {"ts": now, "event": EVENT, "agent": agent,
                 "agent_type": raw if isinstance(raw, str) else None,
                 "has_agent_id": "agent_id" in payload,
                 "accepted": agent is not None, "reason": reason}
        if expired:
            audit["expired"] = expired
        if recovery:
            audit["recovery"] = recovery
            log("recovered status.json: " + recovery)
        if isinstance(aid_raw, str) and aid_raw:       # local audit keeps only a short fingerprint
            audit["agent_ref"] = hashlib.sha256(aid_raw.encode("utf-8", "replace")).hexdigest()[:8]
        with open(os.path.join(DIR, "events.jsonl"), "a") as f:
            f.write(json.dumps(audit) + "\n")
        # NOTE: "Stop" only ends the MAIN session's turn (Alex becomes idle via STATE). Subagents may
        # still be running in the background, so their state is NOT touched here.
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
    """One publish attempt. True = nothing left to retry (published, unchanged or not applicable);
    False = failed, the caller must keep the state marked as pending."""
    pub = public_snapshot(local)
    text = json.dumps(pub, indent=2, sort_keys=True) + "\n"
    if not SAFE.match(text):
        log("blocked: unsafe characters in snapshot")
        return True
    stamp = os.path.join(DIR, ".last_publish")
    if git(["rev-parse", "--git-dir"]).returncode:
        log("skipped: not a git repository")
        return True
    git(["worktree", "prune"])
    f = git(["fetch", "--depth=1", REMOTE, "+data:" + REF])
    remote_has = f.returncode == 0
    if not remote_has and "couldn't find remote ref" not in f.stderr:
        log("fetch failed: " + f.stderr)
        return False
    if not os.path.isdir(WT):
        r = (git(["worktree", "add", "--detach", WT, REF]) if remote_has
             else git(["worktree", "add", "--orphan", "-b", "aao-data", WT]))
        if r.returncode:
            log("worktree failed: " + r.stderr)
            return False
    elif remote_has:
        r = git(["reset", "--hard", REF], cwd=WT)
        if r.returncode:
            log("reset failed: " + r.stderr)
            return False
    try:
        with open(os.path.join(WT, "status.json")) as f:
            # only skip when the REMOTE already has this state (a failed earlier push must be retried)
            if remote_has and json.load(f).get("agents") == pub["agents"]:
                log("skipped: unchanged")
                return True
    except Exception:
        pass
    with open(os.path.join(WT, "status.json"), "w") as f:
        f.write(text)
    r = git(["add", "status.json"], cwd=WT)
    if r.returncode:
        log("add failed: " + r.stderr)
        return False
    if git(["diff", "--cached", "--quiet"], cwd=WT).returncode != 0:   # something new to commit
        r = git(["-c", "user.name=AI Agent Office", "-c", "user.email=noreply@users.noreply.github.com",
                 "commit", "-q", "-m", "status snapshot"], cwd=WT)
        if r.returncode:
            log("commit failed: " + (r.stderr or r.stdout))
            return False
    r = git(["push", REMOTE, "HEAD:refs/heads/data"], cwd=WT)   # also retries an earlier failed push
    if r.returncode:
        log("push failed: " + r.stderr)
        return False
    try:
        with open(stamp, "w") as f:
            f.write(str(time.time()))
    except Exception:
        pass
    log("published")
    return True


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


def mark_dirty():
    with open(DIRTY, "a"):
        pass
    os.utime(DIRTY, None)


def is_dirty():
    return os.path.exists(DIRTY)


def too_soon():
    """Rate limit for non-final events only."""
    try:
        with open(os.path.join(DIR, ".last_publish")) as f:
            return time.time() - float(f.read()) < MIN_INTERVAL
    except Exception:
        return False


def drain():
    """Holding the publisher lock: publish the latest local state while changes are pending.
    Returns False when a publish failed (state stays pending for the next event)."""
    while is_dirty():
        if DEADLINE - (time.time() - START) <= 3:
            log("pending: deadline reached, state kept for the next event")
            return False
        if EVENT not in FINAL and too_soon():
            log("skipped: rate limit")
            return False
        try:
            os.unlink(DIRTY)
        except FileNotFoundError:
            pass
        ok = False
        try:
            with open(os.path.join(DIR, "status.json")) as f:
                ok = publish(json.load(f))
        except BaseException as e:
            log("publish error: %s" % type(e).__name__)
        if not ok:
            mark_dirty()
            return False
    return True


def flush():
    """Single publisher. A hook that cannot take the lock returns at once: the holder sees the
    .dirty marker it just set. The marker is re-checked after releasing the lock, so no change is lost."""
    while True:
        lk = open(PUB_LOCK, "a")
        try:
            try:
                fcntl.flock(lk, fcntl.LOCK_EX | fcntl.LOCK_NB)
            except OSError:
                log("deferred: another publisher is running")
                return
            if not drain():
                return
        finally:
            lk.close()                     # releases the lock
        if not is_dirty():
            return


def main():
    payload = read_payload()
    record(payload)
    if PUBLISH:
        mark_dirty()
        flush()


if __name__ == "__main__":
    try:
        main()
    except BaseException as e:           # never block or fail the Claude Code session
        log("error: %s" % type(e).__name__)
    sys.exit(0)
