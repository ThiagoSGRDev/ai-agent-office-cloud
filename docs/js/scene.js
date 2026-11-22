// Scene = the DECORATIVE layer (where characters stand/walk and which gesture they make).
// It never decides what is true: every behaviour is gated by the evidence resolved in state.js.
//   working / blocked / unknown / standby  -> stay at the desk (unknown: frozen, no gestures)
//   idle                                   -> may do purposeful outings (coffee, sofa, board, plant, stretch, rounds)
//   NEW completed (observed transition)    -> celebrate; a subagent may hand its report to Alex
//   Alex idle after "Stop" + team completed-> ONE short team meeting per run (cooldown)
import { AGENTS, PERSONA, DEFAULT_PERSONA, WALK_SPEED, MAX_WALKERS, MEETING_COOLDOWN_S, FRESH_S } from "./config.js";
import { resolveAgent } from "./state.js";

const rnd = (a, b) => a + Math.random() * (b - a);
const hashId = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
const ACTIVE = AGENTS.filter((a) => a.active).map((a) => a.id);

export function createScene() {
  let L = null, adj = {}, t = 0, frame = 0, dirty = true;
  const ag = {}, res = {}, reserved = new Map();
  let tuples = null, queue = [], reaction = null, lastMeeting = -1e9;

  for (const a of AGENTS) {
    ag[a.id] = { id: a.id, mode: "seated", x: 0, y: 0, dir: "down", node: "S_" + a.id, path: [], plan: [], step: null, wait: 0, planKind: null, allowed: null,
      nextAt: 0, micro: null, nextMicro: 0, hist: [], cheerUntil: 0, phase: hashId(a.id) % 7, wf: 0, pauseLeft: 0, held: [] };
    res[a.id] = { state: "unknown", reason: "sem-dados" };
  }

  // ---- graph ---------------------------------------------------------------------------------
  function setLayout(layout) {
    L = layout; adj = {};
    for (const [a, b] of L.edges) {
      const [ax, ay] = L.nodes[a], [bx, by] = L.nodes[b], w = Math.hypot(ax - bx, ay - by);
      (adj[a] ||= []).push([b, w]); (adj[b] ||= []).push([a, w]);
    }
    reserved.clear(); queue = []; reaction = null;
    for (const a of AGENTS) toSeat(ag[a.id]);
  }
  function route(from, to) {
    if (from === to) return [from];
    const dist = { [from]: 0 }, prev = {}, todo = new Set([from]), done = new Set();
    while (todo.size) {
      let u = null; for (const n of todo) if (u === null || dist[n] < dist[u]) u = n;
      todo.delete(u); if (u === to) break; done.add(u);
      for (const [v, w] of adj[u] || []) { if (done.has(v)) continue; const d = dist[u] + w; if (dist[v] === undefined || d < dist[v]) { dist[v] = d; prev[v] = u; todo.add(v); } }
    }
    if (dist[to] === undefined) return null;
    const p = [to]; while (p[0] !== from) p.unshift(prev[p[0]]);
    return p;
  }
  const dirTo = (fromNode, toNode) => { const [a, b] = L.nodes[fromNode], [c, d] = L.nodes[toNode]; return Math.abs(c - a) >= Math.abs(d - b) ? (c > a ? "right" : "left") : (d > b ? "down" : "up"); };

  // ---- placing / aborting ----------------------------------------------------------------------
  function release(a) { for (const n of a.held) if (reserved.get(n) === a.id) reserved.delete(n); a.held = []; }
  function toSeat(a) {
    if (!L) return;
    release(a);
    const [x, y] = L.nodes["S_" + a.id];
    Object.assign(a, { mode: "seated", x, y, dir: "down", node: "S_" + a.id, path: [], plan: [], step: null, planKind: null, allowed: null, pauseLeft: 0, wait: 0 });
    dirty = true;
  }
  const away = (a) => a.mode !== "seated" || a.plan.length > 0 || a.step !== null;

  function setPlan(a, steps, kind, allowed) {
    a.plan = steps.slice(); a.step = null; a.planKind = kind; a.allowed = allowed; a.micro = null; next(a);
  }
  const rest = (a) => { a.nextAt = t + rnd(...(PERSONA[a.id] || DEFAULT_PERSONA).interval); };   // a full interval of rest after any outing/reaction
  function next(a) {
    a.step = a.plan.shift() || null;
    if (!a.step) { rest(a); toSeat(a); return; }
    const s = a.step;
    if (s.seatWait != null) { a.mode = "seated"; a.wait = s.seatWait; if (s.cheer) a.cheerUntil = t + s.seatWait; dirty = true; return; }
    const dest = s.to === "seat" ? "S_" + a.id : s.to;
    const p = route(a.node, dest);
    if (!p) { toSeat(a); return; }
    a.path = p.slice(1);
    if (a.path.length) { a.mode = "walking"; dirty = true; } else arrive(a);
  }
  function arrive(a) {
    const s = a.step;
    if (s.to === "seat") { rest(a); toSeat(a); return; }
    a.mode = "doing"; a.wait = s.dur; if (s.face) a.dir = s.face;
    if (s.notify) s.notify(a);
    dirty = true;
  }
  function walk(a, dt) {
    let move = WALK_SPEED * dt;
    while (move > 0 && a.path.length) {
      const [tx, ty] = L.nodes[a.path[0]], dx = tx - a.x, dy = ty - a.y, d = Math.hypot(dx, dy);
      if (d > 0.001) a.dir = Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up");
      if (d <= move) {
        a.x = tx; a.y = ty; move -= d; a.node = a.path.shift();
        if (a.path.length > 1 && a.planKind === "deco" && Math.random() < 0.1) { a.pauseLeft = rnd(0.5, 1.1); return; }   // occasional dawdle
      } else { a.x += (dx / d) * move; a.y += (dy / d) * move; move = 0; }
    }
    a.wf += dt * 8;
    dirty = true;
  }
  function runPlan(a, dt) {
    if (a.mode === "walking") {
      if (a.pauseLeft > 0) { a.pauseLeft -= dt; return; }
      walk(a, dt);
      if (!a.path.length) arrive(a);
    } else if (a.step) {
      a.wait -= dt;
      if (a.wait <= 0) next(a);
    }
  }

  // ---- decorative outings (idle only) --------------------------------------------------------------
  const free = (spots) => (spots || []).filter((n) => !reserved.has(n));
  function reserve(a, ...nodes) { for (const n of nodes) { reserved.set(n, a.id); a.held.push(n); } }
  function outing(a) {
    const persona = PERSONA[a.id] || DEFAULT_PERSONA;
    const recent = a.hist.slice(-2), others = ACTIVE.filter((id) => id !== a.id);
    const can = {
      coffee: () => free(L.spots.coffee).length > 0, sofa: () => free(L.spots.sofa).length > 0, whiteboard: () => free(L.spots.board).length > 0,
      plant: () => free(L.spots.plant).length > 0, stretch: () => !!L.side[a.id], rounds: () => others.length > 0,
    };
    const pool = Object.entries(persona.acts).filter(([n]) => !recent.includes(n) && can[n] && can[n]());
    if (!pool.length) return null;
    let r = Math.random() * pool.reduce((s, [, w]) => s + w, 0), name = pool[0][0];
    for (const [n, w] of pool) { if ((r -= w) <= 0) { name = n; break; } }
    const pickFree = (list) => { const f = free(list); return f[Math.floor(Math.random() * f.length)]; };
    let steps;
    if (name === "coffee") { const n = pickFree(L.spots.coffee); reserve(a, n); steps = [{ to: n, face: L.faces[n], pose: "mug", dur: rnd(5, 7) }]; }
    else if (name === "sofa") { const n = pickFree(L.spots.sofa); reserve(a, n); steps = [{ to: n, face: "down", pose: "sit", sit: true, dur: rnd(12, 20) }]; }
    else if (name === "whiteboard") { const n = pickFree(L.spots.board); reserve(a, n); steps = [{ to: n, face: "up", pose: "point", dur: rnd(6, 9) }]; }
    else if (name === "plant") { const n = pickFree(L.spots.plant); reserve(a, n); steps = [{ to: n, face: "up", pose: "water", dur: rnd(3, 5) }]; }
    else if (name === "stretch") { steps = [{ to: L.side[a.id], face: "down", pose: "up", dur: rnd(2.5, 3.5) }]; }
    else {                                                                          // rounds: peek at 1-2 colleagues' desks
      const targets = others.slice().sort(() => Math.random() - 0.5).slice(0, 1 + (Math.random() < 0.5 ? 1 : 0));
      steps = targets.map((id) => ({ to: L.side[id], face: dirTo(L.side[id], "S_" + id), pose: "look", dur: rnd(2, 3) }));
    }
    steps.push({ to: "seat" });
    a.hist.push(name); if (a.hist.length > 4) a.hist.shift();
    return steps;
  }

  // ---- small seated gestures -------------------------------------------------------------------
  function micro(a, r) {
    if (a.micro && t > a.micro.until) { a.micro = null; dirty = true; }
    if (a.micro || away(a) || t < a.nextMicro) return;
    const s = r.state, x = Math.random();
    let m = null, gap = 15;
    if (s === "working") { m = x < 0.28 ? { name: "think", dur: 2.4 } : { name: "look", dur: 0.9, look: x < 0.64 ? -1 : 1 }; gap = rnd(4, 9); }
    else if (s === "idle") { m = x < 0.5 ? { name: "look", dur: 1.4, look: x < 0.25 ? -1 : 1 } : x < 0.85 ? { name: "sip", dur: 2.2 } : { name: "yawn", dur: 1.6 }; gap = rnd(7, 15); }
    else if (s === "blocked") { m = { name: "shake", dur: 1 }; gap = rnd(5, 9); }
    else if (s === "completed") { m = { name: "look", dur: 1.2, look: x < 0.5 ? -1 : 1 }; gap = rnd(12, 24); }
    a.nextMicro = t + gap;
    if (m) { a.micro = { ...m, until: t + m.dur }; dirty = true; }
  }

  // ---- reactions (only from REAL transitions observed after load) -----------------------------------
  function startReaction() {
    if (reaction || !queue.length || !L) return;
    const q = queue.shift();
    if (q.kind === "done") {
      const a = ag[q.id];
      if (res[q.id].state !== "completed" || away(a)) return;
      const al = ag.alex, alexOk = q.id !== "alex" && !away(al) && ["working", "idle"].includes(res.alex.state) && L.side[q.id] && L.side.alex;
      const steps = [{ seatWait: 3.5, cheer: true }];
      if (alexOk) {
        const face = dirTo(L.side.alex, "S_alex");
        steps.push({ to: L.side.alex, face, pose: "paper", dur: 2.8, notify: () => { al.micro = { name: "look", look: face === "left" ? 1 : -1, until: t + 3.2 }; } });
        steps.push({ to: "seat" });
      }
      setPlan(a, steps, "react", new Set(["completed"]));
      reaction = { ids: [q.id] };
    } else if (q.kind === "meeting") {
      const crew = ["alex", ...ACTIVE.filter((id) => id !== "alex" && res[id].state === "completed")].slice(0, 3);
      if (crew.length < 2 || crew.some((id) => away(ag[id]) || !L.side[id]) || res.alex.state !== "idle") {
        if (q.tries < 5) { q.tries++; q.at = t + 2; queue.unshift(q); }
        return;
      }
      lastMeeting = t;
      crew.forEach((id, i) => {
        const spot = L.spots.meeting[i];
        setPlan(ag[id], [{ seatWait: 0.5 * i }, { to: spot, face: "up", pose: id === "alex" ? "point" : "talk", dur: 8, talk: true },
          { to: spot, face: "up", pose: "cheer", dur: 2.5 }, { to: "seat" }], "react", new Set([id === "alex" ? "idle" : "completed"]));
      });
      reaction = { ids: crew };
    }
  }

  /** Called when a NEW valid snapshot arrives. Only transitions seen after the first snapshot matter. */
  function sync(snap, nowSec) {
    if (!snap) return;
    const cur = {};
    for (const a of AGENTS) { const d = snap.agents[a.id]; cur[a.id] = d && d.state && d.updatedAt != null ? { state: d.state, ts: d.updatedAt, ev: d.lastEvent } : null; }
    if (tuples) {
      const changed = (id) => cur[id] && (!tuples[id] || tuples[id].state !== cur[id].state || tuples[id].ts !== cur[id].ts);
      const fresh = (id) => nowSec - cur[id].ts <= FRESH_S;
      const al = cur.alex;
      const crew = ACTIVE.filter((id) => id !== "alex" && cur[id] && cur[id].state === "completed" && al && Math.abs(al.ts - cur[id].ts) <= 600);
      const runEnded = al && changed("alex") && al.state === "idle" && al.ev === "Stop" && fresh("alex") && crew.length > 0
        && !ACTIVE.some((id) => cur[id] && cur[id].state === "working" && fresh(id)) && t - lastMeeting > MEETING_COOLDOWN_S;
      if (runEnded) queue.push({ kind: "meeting", tries: 0, at: 0 });         // the team celebrates together instead of N separate hand-offs
      else for (const a of AGENTS) if (changed(a.id) && cur[a.id].state === "completed" && fresh(a.id) && queue.length < 4) queue.push({ kind: "done", id: a.id });
    }
    tuples = cur;                                                              // kept across fetch failures: no replays on reconnect
  }

  // ---- main update ------------------------------------------------------------------------------------
  function update(dt, data) {
    if (!L) return;
    t += dt;
    const nf = Math.floor(t * 12);
    for (const a of AGENTS) res[a.id] = resolveAgent(a, data.snap, data.nowSec);
    if (data.reduced) { for (const a of AGENTS) { const g = ag[a.id]; if (away(g) || g.micro) { toSeat(g); g.micro = null; } } frame = 0; return; }
    let walkers = 0;
    for (const a of AGENTS) {
      const g = ag[a.id], r = res[a.id];
      if (away(g) && g.allowed && !g.allowed.has(r.state)) toSeat(g);        // evidence changed: show the agent at the desk right away
      if (!away(g) && g.cheerUntil && t > g.cheerUntil) g.cheerUntil = 0;
      if (r.state !== "idle") g.nextAt = 0;
      if (away(g) && g.mode !== "seated") walkers += g.planKind === "deco" ? 1 : 0;
    }
    if (reaction && reaction.ids.every((id) => !away(ag[id]))) reaction = null;
    if (!reaction && queue.length && (queue[0].at || 0) <= t) startReaction();
    for (const a of AGENTS) {
      const g = ag[a.id], r = res[a.id];
      if (away(g)) runPlan(g, dt);
      else if (r.state === "idle" && !reaction && !queue.length) {
        if (!g.nextAt) g.nextAt = t + rnd(6, 16);
        else if (t >= g.nextAt && walkers < MAX_WALKERS) {
          const steps = outing(g), persona = PERSONA[g.id] || DEFAULT_PERSONA;
          g.nextAt = t + rnd(...persona.interval);
          if (steps) { setPlan(g, steps, "deco", new Set(["idle"])); walkers++; }
        }
      }
      if (!g.nextMicro) g.nextMicro = t + rnd(1, 7);
      micro(g, r);
    }
    if (nf !== frame) { frame = nf; if (busy()) dirty = true; }
  }

  function busy() {
    for (const a of AGENTS) {
      const g = ag[a.id], s = res[a.id].state;
      // static gestures (look/sip/yawn/think) repaint only when they start and end; only animated things need frames
      if (g.mode !== "seated" || (g.micro && g.micro.name === "shake") || g.cheerUntil || s === "working") return true;
    }
    return false;
  }

  return {
    setLayout, sync, update, busy, res, agent: (id) => ag[id], route, dirTo,
    get frame() { return frame; }, get t() { return t; }, get dirty() { return dirty; }, clean() { dirty = false; },
    markDirty() { dirty = true; }, away,
    get reaction() { return reaction; }, get queued() { return queue.length; },
  };
}
