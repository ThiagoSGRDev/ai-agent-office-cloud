// Rendering. The pixel map lives in a SMALL logical canvas (176x320 / 352x176) that the browser scales
// with CSS (image-rendering: pixelated); nameplates are DOM elements (crisp text, updated only when needed).
import { AGENTS, CELEBRATE_S, STATE_STYLE, PERSONA, DEFAULT_PERSONA } from "./config.js";
import { resolveAgent, formatAge } from "./state.js";
import { rect, drawPerson, drawStanding, drawChair, drawDesk, drawMonitor, drawBubble, drawConfetti } from "./sprites.js";
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
    const ox = mw <= o.cw ? (o.cw - mw) / 2 : Math.min(0, Math.max(o.cw - mw, view.ox));
    const oy = mh <= o.ch ? (o.ch - mh) / 2 : Math.min(0, Math.max(o.ch - mh, view.oy));
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
  function seatedPose(r, ag, cheering) {
    const s = r.state;
    return s === "working" ? "work" : s === "idle" ? "idle" : s === "completed" ? (cheering ? "cheer" : "idle") : s === "blocked" ? "blocked" : s === "error" ? "error" : "off";
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
        const m = ag.micro, opts = { look: m && m.look, think: m && m.name === "think", sip: m && m.name === "sip", yawn: m && m.name === "yawn", shake: m && m.name === "shake", typing: persona.typing };
        items.push({ k: deskKey - 0.5, d: () => drawPerson(g, gm.px, gm.py, a.look, seatedPose(r, ag, cheering), r.state === "unknown" ? 0 : af, r.state === "completed", opts) });
      } else items.push({ k: deskKey - 0.5, d: () => drawChair(g, gm.px + 1, gm.py + 2, false) });      // empty chair while away
      items.push({ k: deskKey, d: () => { drawDesk(g, gm.dx, gm.dy); drawMonitor(g, gm.dx + 1, gm.dy - 9, r.state, r.state === "unknown" || r.state === "standby" ? 0 : af); } });
      if (ag.mode !== "seated" && r.state !== "standby") {
        const step = ag.step || {}, walking = ag.mode === "walking" && ag.pauseLeft <= 0;
        if (step.sit && ag.mode === "doing") items.push({ k: ag.y, d: () => drawPerson(g, Math.round(ag.x) - 7, Math.round(ag.y) - 18, a.look, "idle", af, false, { noChair: true, typing: 2 }) });
        else {
          const pose = ag.mode === "walking" ? "swing" : step.pose === "cheer" ? "up" : step.pose === "look" || step.pose === "talk" ? "down" : (step.pose || "down");
          items.push({ k: ag.y + 0.2, d: () => drawStanding(g, ag.x, ag.y, a.look, { dir: ag.dir, frame: walking ? Math.floor(ag.wf) : af >> 1, walk: walking, arms: pose, talk: step.pose === "talk" }) });
        }
        if (step.talk && ag.mode === "doing" && Math.floor(scene.t * 1.4 + ag.phase) % 3 === 0) bubbles.push(() => drawBubble(g, Math.round(ag.x) + 5, Math.round(ag.y) - 34, ".", "#334155"));
        if (step.pose === "cheer" && ag.mode === "doing" && !reduced) bubbles.push(() => drawConfetti(g, Math.round(ag.x), Math.round(ag.y) - 20, af));
      } else if (ag.mode === "seated") {
        if (cheering) bubbles.push(() => drawConfetti(g, gm.px + 7, gm.py, af));
        const glyph = r.state === "unknown" ? ["?", "#475569"] : r.state === "blocked" ? ["!", "#d97706"] : r.state === "error" ? ["x", "#dc2626"] : r.state === "completed" && !cheering ? ["v", "#16a34a"] : null;
        if (glyph) bubbles.push(() => drawBubble(g, gm.px + 15, gm.py + 1 - (af % 8 < 4 ? 0 : 1), glyph[0], glyph[1]));
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
void rect; void CELEBRATE_S;
