// Office layouts: zones, props and the walkable graph used by the scene.
// Two purpose-built layouts: landscape (desktop/tablet) and portrait (phones).
import { rect } from "./sprites.js";

export const DESK_ORDER = ["alex", "lucas", "sofia", "arthur", "noah", "maya", "ethan", "olivia"];

function grid(cols, rows, x0, y0, cw, ch) {
  const out = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) out.push({ x: x0 + c * cw, y: y0 + r * ch, w: cw, h: ch });
  return out;
}

export function cellGeom(L, i) {
  const c = L.cells[i];
  const dx = c.x + Math.round((c.w - 32) / 2);
  const py = c.y + L.padTop;
  return { c, dx, dy: py + 14, px: dx + 9, py, cx: c.x + c.w / 2, labelY: py + 14 + 9 + 3, feet: py + 20 };
}

// ---- props ------------------------------------------------------------------------------------
function plant(g, x, y) { rect(g, x + 2, y + 8, 6, 5, "#92400e"); rect(g, x + 1, y + 2, 8, 7, "#16a34a"); rect(g, x + 3, y, 4, 4, "#22c55e"); }
function sofa(g, x, y, w) { rect(g, x, y, w, 5, "#7c3aed"); rect(g, x, y + 5, w, 7, "#8b5cf6"); rect(g, x - 2, y + 3, 3, 9, "#6d28d9"); rect(g, x + w - 1, y + 3, 3, 9, "#6d28d9"); }
function table(g, x, y, w, h) { rect(g, x, y, w, h, "#b08968"); rect(g, x, y + h - 2, w, 2, "#8d6e4f"); }
function stool(g, x, y) { rect(g, x, y, 6, 6, "#475569"); rect(g, x + 1, y + 1, 4, 4, "#64748b"); }
function board(g, x, y, w) { rect(g, x, y, w, 9, "#f8fafc"); rect(g, x, y, w, 1, "#94a3b8"); rect(g, x + 3, y + 3, w - 12, 1, "#38bdf8"); rect(g, x + 3, y + 5, w - 18, 1, "#4ade80"); }
function coffee(g, x, y) { rect(g, x, y, 12, 14, "#334155"); rect(g, x + 2, y + 2, 8, 4, "#0f172a"); rect(g, x + 4, y + 8, 4, 4, "#f8fafc"); }

function graph() {
  const nodes = {}, edges = [];
  return { nodes, edges, add: (id, x, y) => { nodes[id] = [x, y]; }, link: (a, b) => edges.push([a, b]) };
}

function landscape() {
  const L = {
    w: 352, h: 176, padTop: 8, cells: grid(4, 2, 56, 16, 56, 64),
    zones: [
      { label: "RECEPÇÃO", x: 0, y: 12, w: 56, h: 116, floor: "#e7dcc3" },
      { label: "", x: 56, y: 12, w: 224, h: 116, floor: "#e8ecef" },
      { label: "SALA DE REUNIÃO", x: 280, y: 12, w: 72, h: 116, floor: "#cfd8e6" },
      { label: "DESCANSO", x: 0, y: 128, w: 352, h: 48, floor: "#cfe0c8" },
    ],
    props(g) {
      rect(g, 6, 58, 44, 10, "#8d6e4f"); rect(g, 6, 58, 44, 3, "#b08968"); plant(g, 4, 26); plant(g, 40, 26);
      board(g, 290, 20, 56); table(g, 292, 58, 48, 20); stool(g, 296, 82); stool(g, 314, 82); stool(g, 332, 82);
      rect(g, 282, 12, 1, 116, "#9fb3c8");
      sofa(g, 12, 142, 52); table(g, 82, 150, 26, 10); plant(g, 120, 140); coffee(g, 200, 138); plant(g, 296, 140);
    },
  };
  const G = graph(), feetRow = [44, 108];
  for (let k = 0; k <= 4; k++) {                            // vertical aisles between desk columns
    const x = 56 + 56 * k;
    G.add(`A${k}_0`, x, feetRow[0]); G.add(`M${k}`, x, 86); G.add(`A${k}_1`, x, feetRow[1]);
    G.link(`A${k}_0`, `M${k}`); G.link(`M${k}`, `A${k}_1`);
    if (k) G.link(`M${k - 1}`, `M${k}`);                    // corridor between the two desk rows
  }
  for (const k of [1, 2, 3]) { G.add(`C${k}`, 56 + 56 * k, 160); G.link(`A${k}_1`, `C${k}`); }
  G.add("Ls", 64, 160); G.add("Sf1", 46, 154); G.add("Sf0", 26, 154); G.add("Pl0", 106, 160); G.add("Cf0", 206, 160);
  G.link("C1", "Ls"); G.link("Ls", "Sf1"); G.link("Sf1", "Sf0"); G.link("C1", "Pl0"); G.link("C1", "C2"); G.link("C2", "Cf0"); G.link("Cf0", "C3");
  G.add("Mb0", 294, 52); G.add("Mb1", 316, 52); G.add("Mb2", 338, 52);
  G.link("A4_0", "Mb0"); G.link("Mb0", "Mb1"); G.link("Mb1", "Mb2");
  const side = {};
  DESK_ORDER.forEach((id, i) => {
    const gm = cellGeom(L, i), k = i % 4, r = Math.floor(i / 4);
    G.add("S_" + id, gm.cx, feetRow[r]); G.link("S_" + id, `A${k + 1}_${r}`); side[id] = `A${k + 1}_${r}`;
  });
  return Object.assign(L, { nodes: G.nodes, edges: G.edges, side, spots: { coffee: ["Cf0"], sofa: ["Sf1", "Sf0"], plant: ["Pl0"], board: ["Mb1"], meeting: ["Mb1", "Mb0", "Mb2"] }, faces: { Cf0: "up", Pl0: "up", Mb0: "up", Mb1: "up", Mb2: "up", Sf0: "down", Sf1: "down" } });
}

function portrait() {
  const L = {
    w: 176, h: 320, padTop: 4, cells: grid(2, 4, 8, 64, 80, 52),
    zones: [
      { label: "RECEPÇÃO", x: 0, y: 12, w: 88, h: 52, floor: "#e7dcc3" },
      { label: "SALA DE REUNIÃO", x: 88, y: 12, w: 88, h: 52, floor: "#cfd8e6" },
      { label: "", x: 0, y: 64, w: 176, h: 208, floor: "#e8ecef" },
      { label: "DESCANSO", x: 0, y: 272, w: 176, h: 48, floor: "#cfe0c8" },
    ],
    props(g) {
      rect(g, 14, 40, 44, 9, "#8d6e4f"); rect(g, 14, 40, 44, 3, "#b08968"); plant(g, 4, 26); plant(g, 70, 26);
      board(g, 104, 20, 40); table(g, 108, 36, 40, 14); rect(g, 88, 12, 1, 52, "#9fb3c8");
      sofa(g, 14, 284, 60); table(g, 100, 288, 28, 10); plant(g, 134, 276); coffee(g, 152, 280); plant(g, 6, 302);
    },
  };
  const G = graph(), feetRow = [88, 140, 192, 244];
  feetRow.forEach((y, r) => { G.add(`A${r}`, 88, y); if (r) G.link(`A${r - 1}`, `A${r}`); });
  G.add("T", 88, 62); G.link("T", "A0");
  G.add("Mb0", 100, 60); G.add("Mb1", 124, 60); G.add("Mb2", 148, 60); G.link("T", "Mb0"); G.link("Mb0", "Mb1"); G.link("Mb1", "Mb2");
  G.add("D", 88, 268); G.add("LC", 88, 308); G.link("A3", "D"); G.link("D", "LC");
  G.add("Ls", 60, 308); G.add("Sf1", 56, 298); G.add("Sf0", 32, 298); G.link("LC", "Ls"); G.link("Ls", "Sf1"); G.link("Sf1", "Sf0");
  G.add("Pl0", 124, 308); G.add("Cf0", 158, 308); G.link("LC", "Pl0"); G.link("Pl0", "Cf0");
  const side = {};
  DESK_ORDER.forEach((id, i) => {
    const gm = cellGeom(L, i), col = i % 2, r = Math.floor(i / 2), ex = col === 0 ? 72 : 104;
    G.add("S_" + id, gm.cx, feetRow[r]); G.add("E_" + id, ex, feetRow[r]);
    G.link("S_" + id, "E_" + id); G.link("E_" + id, `A${r}`); side[id] = "E_" + id;
  });
  return Object.assign(L, { nodes: G.nodes, edges: G.edges, side, spots: { coffee: ["Cf0"], sofa: ["Sf1", "Sf0"], plant: ["Pl0"], board: ["Mb1"], meeting: ["Mb1", "Mb0", "Mb2"] }, faces: { Cf0: "up", Pl0: "up", Mb0: "up", Mb1: "up", Mb2: "up", Sf0: "down", Sf1: "down" } });
}

export const LAYOUTS = { landscape: landscape(), portrait: portrait() };

/** Pre-render the static background of a layout (floors, walls, props). */
export function buildBackground(L) {
  const cv = document.createElement("canvas"); cv.width = L.w; cv.height = L.h;
  const g = cv.getContext("2d");
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
  return cv;
}
