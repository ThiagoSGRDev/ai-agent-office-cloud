// Procedural pixel-art sprites (no external assets, no licenses). All coordinates are in map pixels.
export function rect(g, x, y, w, h, c) { g.fillStyle = c; g.fillRect(x, y, w, h); }

function gray(hex) {
  const n = parseInt(hex.slice(1), 16);
  const y = Math.round(0.3 * (n >> 16) + 0.59 * ((n >> 8) & 255) + 0.11 * (n & 255));
  const v = Math.min(235, Math.round(y * 0.75 + 60));
  return `rgb(${v},${v},${v})`;
}

export function drawChair(g, x, y, off) {
  const c = off ? "#6b7280" : "#475569";
  rect(g, x + 1, y + 8, 12, 10, c);
  rect(g, x + 1, y + 8, 12, 1, off ? "#9ca3af" : "#64748b");
}

/**
 * pose: work | idle | cheer | blocked | error | off.   smile: show a smile (completed).
 * f: animation frame counter (0 when animations are reduced).
 */
export function drawPerson(g, x, y, look, pose, f, smile) {
  const off = pose === "off";
  const c = (col) => (off ? gray(col) : col);
  const jump = pose === "cheer" ? -(f % 2) * 2 : 0;
  const breathe = pose === "idle" ? ((f % 8) < 4 ? 0 : 1) : 0;
  const dy = jump + breathe;
  drawChair(g, x, y, off);
  const shirt = c(look.shirt), skin = c(look.skin), hair = c(look.hair), dark = c("#111827");
  rect(g, x + 2, y + 6 + dy, 10, 8, shirt);                     // torso
  rect(g, x + 5, y + 6 + dy, 4, 2, c(look.accent));             // collar
  // arms
  if (pose === "cheer" || pose === "blocked") {
    rect(g, x, y + dy, 2, 8, shirt); rect(g, x, y + dy - 2, 2, 2, skin);
    rect(g, x + 12, y + dy, 2, 8, shirt); rect(g, x + 12, y + dy - 2, 2, 2, skin);
  } else if (pose === "work") {
    rect(g, x, y + 8, 2, 4, shirt); rect(g, x, y + 12 + (f % 2), 2, 2, skin);
    rect(g, x + 12, y + 8, 2, 4, shirt); rect(g, x + 12, y + 12 + ((f + 1) % 2), 2, 2, skin);
  } else {
    rect(g, x, y + 8 + dy, 2, 5, shirt); rect(g, x, y + 13 + dy, 2, 1, skin);
    rect(g, x + 12, y + 8 + dy, 2, 5, shirt); rect(g, x + 12, y + 13 + dy, 2, 1, skin);
  }
  // head
  rect(g, x + 4, y + dy, 6, 6, skin);
  rect(g, x + 4, y + dy - 1, 6, 2, hair);
  rect(g, x + 3, y + dy, 1, 3, hair); rect(g, x + 10, y + dy, 1, 3, hair);
  if (look.extra === "ponytail") { rect(g, x + 10, y + dy + 1, 2, 5, hair); rect(g, x + 11, y + dy + 5, 1, 2, hair); }
  if (look.extra === "headphones") {
    const hp = c("#334155"); rect(g, x + 3, y + dy - 2, 8, 1, hp); rect(g, x + 2, y + dy + 1, 2, 3, hp); rect(g, x + 10, y + dy + 1, 2, 3, hp);
  }
  // eyes / mouth
  if (pose === "error") {
    for (const ex of [5, 8]) { rect(g, x + ex, y + dy + 2, 1, 1, dark); rect(g, x + ex + 1, y + dy + 3, 1, 1, dark); rect(g, x + ex + 1, y + dy + 2, 1, 1, dark); rect(g, x + ex, y + dy + 3, 1, 1, dark); }
  } else if (off) {
    rect(g, x + 5, y + dy + 3, 2, 1, dark); rect(g, x + 8, y + dy + 3, 2, 1, dark);
  } else {
    rect(g, x + 5, y + dy + 3, 1, 1, dark); rect(g, x + 9, y + dy + 3, 1, 1, dark);
  }
  if (look.extra === "glasses") {
    const gl = c("#0f172a");
    rect(g, x + 4, y + dy + 2, 3, 1, gl); rect(g, x + 8, y + dy + 2, 3, 1, gl); rect(g, x + 7, y + dy + 2, 1, 1, gl);
    rect(g, x + 4, y + dy + 4, 3, 1, gl); rect(g, x + 8, y + dy + 4, 3, 1, gl);
  }
  if (smile) rect(g, x + 6, y + dy + 5, 3, 1, dark);
}

export function drawMonitor(g, x, y, state, f) {
  rect(g, x, y, 10, 8, "#1f2937");                              // bezel
  rect(g, x + 4, y + 8, 2, 1, "#374151"); rect(g, x + 3, y + 9, 4, 1, "#374151");
  const sx = x + 1, sy = y + 1;
  if (state === "working") {
    rect(g, sx, sy, 8, 6, "#0f172a");
    for (let i = 0; i < 4; i++) rect(g, sx + 1, sy + 1 + i + ((f + i) % 2 ? 0 : 0), 2 + ((f + i * 2) % 5), 1, i % 2 ? "#4ade80" : "#38bdf8");
  } else if (state === "idle") {
    rect(g, sx, sy, 8, 6, "#1e3a5f"); rect(g, sx + 1 + ((f >> 2) % 6), sy + 2 + ((f >> 3) % 2), 1, 1, "#93c5fd");
  } else if (state === "completed") {
    rect(g, sx, sy, 8, 6, "#14532d");
    for (const [px, py] of [[2, 3], [3, 4], [4, 3], [5, 2], [6, 1]]) rect(g, sx + px, sy + py, 1, 1, "#ffffff");
  } else if (state === "blocked") {
    rect(g, sx, sy, 8, 6, "#7c2d12"); rect(g, sx + 3, sy + 1, 2, 3, "#fed7aa"); rect(g, sx + 3, sy + 5, 2, 1, "#fed7aa");
  } else if (state === "error") {
    rect(g, sx, sy, 8, 6, "#7f1d1d");
    for (let i = 0; i < 4; i++) { rect(g, sx + 2 + i, sy + 1 + i, 1, 1, "#fecaca"); rect(g, sx + 5 - i, sy + 1 + i, 1, 1, "#fecaca"); }
  } else {
    rect(g, sx, sy, 8, 6, "#111827");                           // off
  }
}

const GLYPH = {
  "!": ["..#..", "..#..", "..#..", ".....", "..#.."],
  "?": [".###.", "#...#", "..##.", ".....", "..#.."],
  "v": [".....", "....#", "#..#.", "#.#..", ".#..."],
  "x": ["#...#", ".#.#.", "..#..", ".#.#.", "#...#"],
};
export function drawBubble(g, x, y, glyph, color) {
  rect(g, x, y, 9, 8, "#0f172a"); rect(g, x + 1, y + 1, 7, 6, "#ffffff"); rect(g, x + 3, y + 8, 2, 1, "#0f172a");
  GLYPH[glyph].forEach((row, j) => { for (let i = 0; i < 5; i++) if (row[i] === "#") rect(g, x + 2 + i, y + 1 + j, 1, 1, color); });
}

export function drawConfetti(g, x, y, f) {
  const cols = ["#f43f5e", "#facc15", "#38bdf8", "#4ade80"];
  for (let i = 0; i < 8; i++) rect(g, x + ((i * 7 + f * 3) % 22) - 8, y - 4 + ((f * 2 + i * 5) % 12), 1, 1, cols[i % 4]);
}
