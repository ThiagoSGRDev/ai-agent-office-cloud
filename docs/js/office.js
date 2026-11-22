// Rendering. The pixel map lives in a SMALL logical canvas (176x320 / 352x176) that the browser scales
// with CSS (image-rendering: pixelated); nameplates are DOM elements (crisp text, updated only when needed).
import { AGENTS, CELEBRATE_S, STATE_STYLE, PERSONA, DEFAULT_PERSONA } from "./config.js";
import { resolveAgent, formatAge } from "./state.js";
import { drawChair, drawDesk, drawMonitor, drawBubble, drawConfetti } from "./sprites.js";
import { drawSeated, seatedHands, drawStandingChar, drawSitting } from "./characters.js";
import { LAYOUTS, DESK_ORDER, cellGeom, buildBackground } from "./layout.js";
import { createScene } from "./scene.js";

const BY_ID = Object.fromEntries(AGENTS.map((a) => [a.id, a]));
const MAX_ZOOM = 4;
const NAME_STATE = (r) => (r.state === "unknown" ? (r.reason === "dado-antigo" ? "Dado antigo" : r.reason === "relogio" ? "Relógio?" : "Sem dados") : STATE_STYLE[r.state].label);

export function createOffice(stage, world, canvas, labels, getData) {
  const g = canvas.getContext("2d");
  const scene = createScene();
  const bgs = {};
  const view = { zoom: 0, ox: 0, oy: 0 };
  const o = { layout: "", animate: true, dpr: 1, cw: 0, ch: 0, geoKey: "" };
  const plates = {}, zones = [];
  canvas.dataset.frames = "0";

  // ---- DOM labels ---------------------------------------------------------------------------------
  for (const id of DESK_ORDER) {
    const el = document.createElement("div"), l1 = document.createElement("div"), l2 = document.createElement("div"), dot = document.createElement("span"), tx = document.createElement("span");
    el.className = "plate"; l1.className = "l1"; l2.className = "l2"; dot.className = "dot"; l2.append(dot, tx); el.append(l1, l2); labels.append(el);
    plates[id] = { el, l1, tx, dot };
  }

  function pickLayout() { return o.cw / Math.max(1, o.ch) < 0.9 ? "portrait" : "landscape"; }

  function geometry() {
    const L = LAYOUTS[o.layout];
    const fit = Math.max(1, Math.floor(Math.min(o.cw / L.w, o.ch / L.h)));
    const S = fit + view.zoom, mw = L.w * S, mh = L.h * S;
    // integer DEVICE-pixel offsets: a half-pixel translate would make the compositor resample (blur) the canvas
    const ox = Math.round(mw <= o.cw ? (o.cw - mw) / 2 : Math.min(0, Math.max(o.cw - mw, view.ox)));
    const oy = Math.round(mh <= o.ch ? (o.ch - mh) / 2 : Math.min(0, Math.max(o.ch - mh, view.oy)));
    return { L, S, fit, ox, oy, mw, mh, k: S / o.dpr };
  }

  function applyGeometry() {
    const { L, S, ox, oy, mw, mh, k } = geometry();
    const key = [o.layout, S, Math.round(ox), Math.round(oy), o.dpr].join("|");
    if (key === o.geoKey) return;
    o.geoKey = key;
    world.style.width = mw / o.dpr + "px"; world.style.height = mh / o.dpr + "px";
    world.style.transform = `translate(${ox / o.dpr}px, ${oy / o.dpr}px)`;
    world.dataset.scale = String(S);
    DESK_ORDER.forEach((id, i) => {
      const gm = cellGeom(L, i), p = plates[id].el;
      p.style.left = gm.cx * k + "px"; p.style.top = gm.labelY * k + "px"; p.dataset.maxw = String(Math.floor(gm.c.w * k - 4));
    });
    zones.forEach((z) => z.el.remove()); zones.length = 0;
    for (const z of L.zones) if (z.label) { const el = document.createElement("div"); el.className = "zone"; el.textContent = z.label; el.style.left = (z.x + 4) * k + "px"; el.style.top = (z.y + 3) * k + "px"; labels.append(el); zones.push({ el }); }
    fitPlates();
  }

  function fitPlates() {                         // shrink the text of a plate only if it does not fit its desk cell
    for (const id of DESK_ORDER) {
      const p = plates[id].el, max = Number(p.dataset.maxw || 0);
      p.style.fontSize = ""; if (max && p.scrollWidth > max) p.style.fontSize = Math.max(8, Math.floor(11 * max / p.scrollWidth)) + "px";
    }
  }

  /** Nameplates always show the EVIDENCE (state + age), never the decorative movement. */
  function updatePlates() {
    const { snap, nowSec } = getData();
    for (const id of DESK_ORDER) {
      const a = BY_ID[id], r = resolveAgent(a, snap, nowSec), st = STATE_STYLE[r.state], pl = plates[id];
      pl.l1.textContent = `${a.name} · ${a.role}`;
      pl.tx.textContent = ` ${NAME_STATE(r)}${r.ageSec != null && r.state !== "standby" ? " · " + formatAge(r.ageSec) : ""}`;
      pl.dot.style.background = st.color;
      pl.el.dataset.state = r.state;
    }
    fitPlates();
  }

  function resize() {
    const r = stage.getBoundingClientRect();
    o.dpr = window.devicePixelRatio || 1;
    o.cw = Math.max(1, Math.round(r.width * o.dpr)); o.ch = Math.max(1, Math.round(r.height * o.dpr));
    const next = pickLayout();
    if (next !== o.layout) {
      o.layout = next; view.zoom = 0; view.ox = view.oy = 0; o.geoKey = "";
      canvas.width = LAYOUTS[next].w; canvas.height = LAYOUTS[next].h;
      scene.setLayout(LAYOUTS[next]);
      canvas.dataset.layout = next;
    }
    o.geoKey = "";
    applyGeometry(); updatePlates(); render();
  }

  // ---- drawing --------------------------------------------------------------------------------------
  /** Evidence -> seated pose + face. The face only mirrors the real state (never invents one). */
  function seatedLook(r, cheering) {
    const st = r.state;
    if (st === "unknown") return { pose: "sit", expr: "off", off: true };
    if (st === "working") return { pose: "sit", expr: "focus" };
    if (st === "blocked") return { pose: "blocked", expr: "worried" };
    if (st === "error") return { pose: "sit", expr: "worried" };
    if (st === "completed") return cheering ? { pose: "cheer", expr: "happy" } : { pose: "sit", expr: "smile" };
    return { pose: "sit", expr: "smile" };                                         // idle
  }

  function render() {
    if (!o.cw || !o.layout) return;
    applyGeometry();
    const L = LAYOUTS[o.layout], { snap, nowSec, reduced } = getData();
    const f = o.animate && !reduced ? scene.frame : 0;
    const bg = bgs[o.layout] || (bgs[o.layout] = buildBackground(L));
    g.drawImage(bg, 0, 0);
    const items = [], bubbles = [];
    DESK_ORDER.forEach((id, i) => {
      const a = BY_ID[id], gm = cellGeom(L, i), r = resolveAgent(a, snap, nowSec), ag = scene.agent(id), af = f + ag.phase;
      const deskKey = gm.dy + 9, persona = PERSONA[id] || DEFAULT_PERSONA;
      const cheering = (r.state === "completed" && (ag.cheerUntil > scene.t)) && !reduced;
      if (r.state === "standby") items.push({ k: deskKey - 0.5, d: () => drawChair(g, gm.px, gm.py, true) });
      else if (ag.mode === "seated") {
        const m = ag.micro, lk = seatedLook(r, cheering);
        const opts = { ...lk, frame: r.state === "unknown" ? 0 : af, typing: persona.typing, look: m && m.look, think: m && m.name === "think", sip: m && m.name === "sip", yawn: m && m.name === "yawn", shake: m && m.name === "shake" };
        items.push({ k: deskKey - 0.5, d: () => drawSeated(g, id, gm.dx, gm.dy, opts) });
      } else items.push({ k: deskKey - 0.5, d: () => drawChair(g, gm.px + 1, gm.py + 2, false) });      // empty chair while away
      items.push({ k: deskKey, d: () => { drawDesk(g, gm.dx, gm.dy); drawMonitor(g, gm.dx + 1, gm.dy - 9, r.state, r.state === "unknown" || r.state === "standby" ? 0 : af); if (r.state !== "standby" && ag.mode === "seated") seatedHands(g, id, gm.dx, gm.dy, { pose: r.state === "working" ? "work" : cheering || r.state === "blocked" ? "cheer" : "idle", frame: af, typing: persona.typing, off: r.state === "unknown" }); } });
      if (ag.mode !== "seated" && r.state !== "standby") {
        const step = ag.step || {}, walking = ag.mode === "walking" && ag.pauseLeft <= 0;
        if (step.sit && ag.mode === "doing") items.push({ k: ag.y, d: () => drawSitting(g, id, ag.x, ag.y, { frame: af }) });
        else {
          const arms = ag.mode === "walking" ? "swing" : step.pose === "cheer" || step.pose === "up" ? "up" : step.pose === "look" || step.pose === "talk" || !step.pose ? "down" : step.pose;
          items.push({ k: ag.y + 0.2, d: () => drawStandingChar(g, id, ag.x, ag.y, { dir: ag.dir, frame: walking ? Math.floor(ag.wf) : af >> 1, walk: walking, arms, talk: step.pose === "talk" }) });
        }
        if (step.talk && ag.mode === "doing" && Math.floor(scene.t * 1.4 + ag.phase) % 3 === 0) bubbles.push(() => drawBubble(g, Math.round(ag.x) + 6, Math.round(ag.y) - 37, ".", "#334155"));
        if (step.pose === "cheer" && ag.mode === "doing" && !reduced) bubbles.push(() => drawConfetti(g, Math.round(ag.x), Math.round(ag.y) - 23, af));
      } else if (ag.mode === "seated") {
        if (cheering) bubbles.push(() => drawConfetti(g, gm.dx + 16, gm.dy - 18, af));
        const glyph = r.state === "unknown" ? ["?", "#475569"] : r.state === "blocked" ? ["!", "#d97706"] : r.state === "error" ? ["x", "#dc2626"] : r.state === "completed" && !cheering ? ["v", "#16a34a"] : null;
        if (glyph) bubbles.push(() => drawBubble(g, gm.dx + 24, gm.dy - 21 - (af % 8 < 4 ? 0 : 1), glyph[0], glyph[1]));
      }
    });
    items.sort((p, q) => p.k - q.k).forEach((it) => it.d());
    bubbles.forEach((b) => b());
    canvas.dataset.frames = String(Number(canvas.dataset.frames) + 1);
    canvas.dataset.zoom = String(view.zoom);
    scene.clean();
  }

  /** Mirror of the scene for accessibility / tests (written only when something changed). */
  function describe() {
    const out = {};
    for (const id of DESK_ORDER) { const ag = scene.agent(id); out[id] = { mode: ag.mode, x: Math.round(ag.x), y: Math.round(ag.y), plan: ag.planKind || "", pose: (ag.step && ag.step.pose) || "" }; }
    return out;
  }

  return {
    render, resize, updatePlates, describe, scene,
    update(dt) { scene.update(dt, getData()); if (scene.dirty) render(); },
    busy: () => scene.busy(),
    onData() { const d = getData(); scene.sync(d.snap, d.nowSec); scene.update(0, d); updatePlates(); render(); },
    setAnimate(v) { o.animate = v; },
    zoomBy(delta, fx, fy) {
      const g0 = geometry(), next = Math.max(0, Math.min(MAX_ZOOM, view.zoom + delta));
      if (next === view.zoom) return;
      const mx = (fx - g0.ox) / g0.S, my = (fy - g0.oy) / g0.S;
      view.zoom = next;
      const g1 = geometry();
      view.ox = fx - mx * g1.S; view.oy = fy - my * g1.S;
      render();
    },
    panBy(dx, dy) { const g0 = geometry(); view.ox = g0.ox + dx; view.oy = g0.oy + dy; render(); },
    resetView() { view.zoom = 0; view.ox = 0; view.oy = 0; render(); },
    get dpr() { return o.dpr; },
    get size() { return { w: o.cw, h: o.ch }; },
  };
}
void CELEBRATE_S;
