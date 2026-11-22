// Office rendering: two purpose-built layouts (landscape for desktop, portrait for phones),
// a pre-rendered static layer, animated characters, and a crisp device-resolution text layer.
import { AGENTS, CELEBRATE_S, STATE_STYLE } from "./config.js";
import { resolveAgent, formatAge } from "./state.js";
import { rect, drawPerson, drawChair, drawMonitor, drawBubble, drawConfetti } from "./sprites.js";

const DESK_ORDER = ["alex", "lucas", "sofia", "arthur", "noah", "maya", "ethan", "olivia"];
const BY_ID = Object.fromEntries(AGENTS.map((a) => [a.id, a]));
const MAX_ZOOM = 4;

function grid(cols, rows, x0, y0, cw, ch) {
  const out = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) out.push({ x: x0 + c * cw, y: y0 + r * ch, w: cw, h: ch });
  return out;
}

// ---- props -----------------------------------------------------------------------------------
function plant(g, x, y) { rect(g, x + 2, y + 8, 6, 5, "#92400e"); rect(g, x + 1, y + 2, 8, 7, "#16a34a"); rect(g, x + 3, y, 4, 4, "#22c55e"); }
function sofa(g, x, y, w) { rect(g, x, y, w, 5, "#7c3aed"); rect(g, x, y + 5, w, 7, "#8b5cf6"); rect(g, x - 2, y + 3, 3, 9, "#6d28d9"); rect(g, x + w - 1, y + 3, 3, 9, "#6d28d9"); }
function table(g, x, y, w, h) { rect(g, x, y, w, h, "#b08968"); rect(g, x, y + h - 2, w, 2, "#8d6e4f"); }
function seat(g, x, y) { rect(g, x, y, 6, 6, "#475569"); rect(g, x + 1, y + 1, 4, 4, "#64748b"); }
function board(g, x, y, w) { rect(g, x, y, w, 9, "#f8fafc"); rect(g, x, y, w, 1, "#94a3b8"); rect(g, x + 3, y + 3, w - 12, 1, "#38bdf8"); rect(g, x + 3, y + 5, w - 18, 1, "#4ade80"); }
function coffee(g, x, y) { rect(g, x, y, 12, 14, "#334155"); rect(g, x + 2, y + 2, 8, 4, "#0f172a"); rect(g, x + 4, y + 8, 4, 4, "#f8fafc"); }

const LAYOUTS = {
  landscape: {
    w: 320, h: 176, padTop: 8, cells: grid(4, 2, 56, 16, 48, 56),
    zones: [
      { label: "RECEPÇÃO", x: 0, y: 12, w: 56, h: 116, floor: "#e7dcc3" },
      { label: "", x: 56, y: 12, w: 192, h: 116, floor: "#e8ecef" },
      { label: "SALA DE REUNIÃO", x: 248, y: 12, w: 72, h: 116, floor: "#cfd8e6" },
      { label: "DESCANSO", x: 0, y: 128, w: 320, h: 48, floor: "#cfe0c8" },
    ],
    props(g) {
      rect(g, 6, 58, 44, 10, "#8d6e4f"); rect(g, 6, 58, 44, 3, "#b08968"); plant(g, 4, 26); plant(g, 40, 26);
      board(g, 256, 20, 56); table(g, 258, 52, 52, 24); seat(g, 262, 44); seat(g, 292, 44); seat(g, 262, 78); seat(g, 292, 78);
      rect(g, 250, 12, 1, 116, "#9fb3c8");
      sofa(g, 16, 142, 52); table(g, 82, 150, 26, 10); plant(g, 120, 140); coffee(g, 200, 138); plant(g, 290, 140);
    },
  },
  portrait: {
    w: 176, h: 320, padTop: 4, cells: grid(2, 4, 8, 64, 80, 48),
    zones: [
      { label: "RECEPÇÃO", x: 0, y: 12, w: 88, h: 52, floor: "#e7dcc3" },
      { label: "SALA DE REUNIÃO", x: 88, y: 12, w: 88, h: 52, floor: "#cfd8e6" },
      { label: "", x: 0, y: 64, w: 176, h: 192, floor: "#e8ecef" },
      { label: "DESCANSO", x: 0, y: 256, w: 176, h: 64, floor: "#cfe0c8" },
    ],
    props(g) {
      rect(g, 14, 40, 44, 9, "#8d6e4f"); rect(g, 14, 40, 44, 3, "#b08968"); plant(g, 4, 26); plant(g, 70, 26);
      board(g, 104, 20, 40); table(g, 108, 36, 40, 14); seat(g, 100, 34); seat(g, 150, 34);
      rect(g, 88, 12, 1, 52, "#9fb3c8");
      sofa(g, 14, 274, 60); table(g, 90, 280, 28, 10, "#b08968"); plant(g, 130, 270); coffee(g, 150, 272); plant(g, 6, 300);
    },
  },
};

function cellGeom(L, i) {
  const c = L.cells[i];
  const dx = c.x + Math.round((c.w - 32) / 2);
  const py = c.y + L.padTop;
  return { c, dx, dy: py + 14, px: dx + 9, py, cx: c.x + c.w / 2, labelY: py + 14 + 9 + 3 };
}

function buildLayers(L) {
  const mk = () => { const cv = document.createElement("canvas"); cv.width = L.w; cv.height = L.h; return cv; };
  const bg = mk(), front = mk();
  const g = bg.getContext("2d");
  rect(g, 0, 0, L.w, L.h, "#e8ecef");
  for (const z of L.zones) {
    rect(g, z.x, z.y, z.w, z.h, z.floor);
    g.fillStyle = "rgba(0,0,0,.05)";
    for (let x = z.x; x < z.x + z.w; x += 16) g.fillRect(x, z.y, 1, z.h);
    for (let y = z.y; y < z.y + z.h; y += 16) g.fillRect(z.x, y, z.w, 1);
  }
  rect(g, 0, 0, L.w, 12, "#455a64"); rect(g, 0, 12, L.w, 1, "#37474f");
  for (let x = 8; x < L.w - 20; x += 40) { rect(g, x, 2, 24, 7, "#90caf9"); rect(g, x, 2, 24, 1, "#bbdefb"); }
  L.props(g);
  const f = front.getContext("2d");              // desks are drawn IN FRONT of the seated characters
  for (let i = 0; i < L.cells.length; i++) {
    const { dx, dy } = cellGeom(L, i);
    rect(f, dx, dy, 32, 5, "#a97142"); rect(f, dx, dy, 32, 1, "#c58b57"); rect(f, dx, dy + 5, 32, 4, "#8a5a2e");
    rect(f, dx + 1, dy + 9, 2, 2, "#5b3a1b"); rect(f, dx + 29, dy + 9, 2, 2, "#5b3a1b");
    rect(f, dx + 26, dy + 1, 3, 3, "#f8fafc"); rect(f, dx + 27, dy + 1, 1, 1, "#92400e");   // mug
  }
  return { bg, front };
}

// ---- factory ---------------------------------------------------------------------------------
export function createOffice(canvas, getData) {
  const ctx = canvas.getContext("2d");
  const mapCv = document.createElement("canvas");
  const mg = mapCv.getContext("2d");
  const layers = {};
  const view = { zoom: 0, ox: 0, oy: 0 };
  const o = { layout: "landscape", tick: 0, animate: true, dpr: 1, cw: 0, ch: 0 };
  canvas.dataset.frames = "0";

  function pickLayout() { return o.cw / Math.max(1, o.ch) < 0.9 ? "portrait" : "landscape"; }

  function geometry() {
    const L = LAYOUTS[o.layout];
    const fit = Math.max(1, Math.floor(Math.min(o.cw / L.w, o.ch / L.h)));
    const S = fit + view.zoom;
    const mw = L.w * S, mh = L.h * S;
    const ox = mw <= o.cw ? (o.cw - mw) / 2 : Math.min(0, Math.max(o.cw - mw, view.ox));
    const oy = mh <= o.ch ? (o.ch - mh) / 2 : Math.min(0, Math.max(o.ch - mh, view.oy));
    return { L, S, fit, ox, oy, mw, mh };
  }

  function resize() {
    const r = canvas.getBoundingClientRect();
    o.dpr = window.devicePixelRatio || 1;
    o.cw = Math.max(1, Math.round(r.width * o.dpr));
    o.ch = Math.max(1, Math.round(r.height * o.dpr));
    canvas.width = o.cw; canvas.height = o.ch;
    const next = pickLayout();
    if (next !== o.layout) { o.layout = next; view.zoom = 0; }
    canvas.dataset.layout = o.layout;
    render();
  }

  function text(g, S, ox, oy, L) {
    const { snap, nowSec } = getData();
    const fs = 11 * o.dpr;
    g.textBaseline = "top"; g.textAlign = "center";
    for (const z of L.zones) {
      if (!z.label) continue;
      g.font = `700 ${Math.max(8, 9 * o.dpr)}px system-ui, sans-serif`; g.textAlign = "left";
      g.fillStyle = "rgba(51,65,85,.75)"; g.fillText(z.label, ox + (z.x + 4) * S, oy + (z.y + 3) * S);
    }
    g.textAlign = "center";
    DESK_ORDER.forEach((id, i) => {
      const a = BY_ID[id], gm = cellGeom(L, i), r = resolveAgent(a, snap, nowSec);
      const st = STATE_STYLE[r.state];
      const label = r.state === "unknown" ? (r.reason === "dado-antigo" ? "Dado antigo" : r.reason === "relogio" ? "Relógio?" : "Sem dados") : st.label;
      const age = r.ageSec != null && r.state !== "standby" ? " · " + formatAge(r.ageSec) : "";
      const l1 = `${a.name} · ${a.role}`, l2 = `● ${label}${age}`;
      const maxW = gm.c.w * S - 6 * o.dpr;
      let px = fs;
      g.font = `600 ${px}px system-ui, sans-serif`;
      const w = Math.max(g.measureText(l1).width, g.measureText(l2).width);
      if (w > maxW) { px = Math.max(8 * o.dpr, px * maxW / w); g.font = `600 ${px}px system-ui, sans-serif`; }
      const w1 = g.measureText(l1).width, w2 = g.measureText(l2).width, bw = Math.max(w1, w2) + 10 * o.dpr, bh = px * 2 + 9 * o.dpr;
      const x = ox + gm.cx * S, y = oy + gm.labelY * S;
      g.fillStyle = "rgba(15,23,42,.9)"; g.beginPath(); g.roundRect(x - bw / 2, y, bw, bh, 4 * o.dpr); g.fill();
      g.fillStyle = "#f8fafc"; g.fillText(l1, x, y + 3 * o.dpr);
      g.fillStyle = "#cbd5e1"; g.fillText(l2, x, y + 5 * o.dpr + px);
      g.fillStyle = st.color; g.textAlign = "left"; g.fillText("●", x - w2 / 2, y + 5 * o.dpr + px); g.textAlign = "center";
    });
  }

  function render() {
    if (!o.cw) return;
    const { L, S, ox, oy, mw, mh } = geometry();
    const lay = layers[o.layout] || (layers[o.layout] = buildLayers(L));
    const { snap, nowSec, reduced } = getData();
    const f = o.animate && !reduced ? o.tick : 0;
    mapCv.width = L.w; mapCv.height = L.h;
    mg.drawImage(lay.bg, 0, 0);
    const parts = [];
    DESK_ORDER.forEach((id, i) => {
      const a = BY_ID[id], gm = cellGeom(L, i), r = resolveAgent(a, snap, nowSec);
      const cheer = r.state === "completed" && r.ageSec <= CELEBRATE_S;
      if (r.state === "standby") drawChair(mg, gm.px, gm.py, true);
      else {
        const pose = r.state === "working" ? "work" : r.state === "idle" ? "idle" : r.state === "completed" ? (cheer ? "cheer" : "idle")
          : r.state === "blocked" ? "blocked" : r.state === "error" ? "error" : "off";
        drawPerson(mg, gm.px, gm.py, a.look, pose, f, r.state === "completed");
      }
      parts.push(() => {
        drawMonitor(mg, gm.dx + 1, gm.dy - 9, r.state, f);
        if (cheer && !reduced) drawConfetti(mg, gm.px + 7, gm.py, f);
        const glyph = r.state === "unknown" ? ["?", "#475569"] : r.state === "blocked" ? ["!", "#d97706"] : r.state === "error" ? ["x", "#dc2626"]
          : r.state === "completed" && !cheer ? ["v", "#16a34a"] : null;
        if (glyph) drawBubble(mg, gm.px + 15, gm.py + 1 - (f % 8 < 4 ? 0 : 1), glyph[0], glyph[1]);
      });
    });
    mg.drawImage(lay.front, 0, 0);
    parts.forEach((p) => p());
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#0b1220"; ctx.fillRect(0, 0, o.cw, o.ch);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(mapCv, ox, oy, mw, mh);
    text(ctx, S, ox, oy, L);
    canvas.dataset.frames = String(Number(canvas.dataset.frames) + 1);
    canvas.dataset.zoom = String(view.zoom);
  }

  return {
    render, resize,
    step() { o.tick++; render(); },
    setAnimate(v) { o.animate = v; },
    zoomBy(delta, fx, fy) {
      const g0 = geometry();
      const next = Math.max(0, Math.min(MAX_ZOOM, view.zoom + delta));
      if (next === view.zoom) return;
      const mx = (fx - g0.ox) / g0.S, my = (fy - g0.oy) / g0.S;
      view.zoom = next;
      const g1 = geometry();
      view.ox = fx - mx * g1.S; view.oy = fy - my * g1.S;
      render();
    },
    panBy(dx, dy) {
      const g = geometry();
      view.ox = g.ox + dx; view.oy = g.oy + dy;
      render();
    },
    resetView() { view.zoom = 0; view.ox = 0; view.oy = 0; render(); },
    get dpr() { return o.dpr; },
    get size() { return { w: o.cw, h: o.ch }; },
  };
}
