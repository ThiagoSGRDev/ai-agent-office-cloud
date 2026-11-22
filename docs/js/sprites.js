// Furniture and UI sprites (desk, monitor, chair, bubbles, confetti). Characters live in characters.js.
// Procedural pixel art, no external assets or licenses. All coordinates are integers in map pixels.
export function rect(g, x, y, w, h, c) { g.fillStyle = c; g.fillRect(x, y, w, h); }

export function drawChair(g, x, y, off) {
  const c = off ? "#6b7280" : "#475569";
  rect(g, x + 1, y + 8, 12, 10, c);
  rect(g, x + 1, y + 8, 12, 1, off ? "#9ca3af" : "#64748b");
}

export function drawDesk(g, dx, dy) {
  rect(g, dx, dy, 32, 5, "#a97142"); rect(g, dx, dy, 32, 1, "#c58b57"); rect(g, dx, dy + 5, 32, 4, "#8a5a2e");
  rect(g, dx + 1, dy + 9, 2, 2, "#5b3a1b"); rect(g, dx + 29, dy + 9, 2, 2, "#5b3a1b");
  rect(g, dx + 26, dy + 1, 3, 3, "#f8fafc"); rect(g, dx + 27, dy + 1, 1, 1, "#92400e");   // mug
}

export function drawMonitor(g, x, y, state, f) {
  rect(g, x, y, 10, 8, "#1f2937");
  rect(g, x + 4, y + 8, 2, 1, "#374151"); rect(g, x + 3, y + 9, 4, 1, "#374151");
  const sx = x + 1, sy = y + 1;
  if (state === "working") {
    rect(g, sx, sy, 8, 6, "#0f172a");
    for (let i = 0; i < 4; i++) rect(g, sx + 1, sy + 1 + i, 2 + ((f + i * 2) % 5), 1, i % 2 ? "#4ade80" : "#38bdf8");
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
    rect(g, sx, sy, 8, 6, "#111827");
  }
}

const GLYPH = {
  "!": ["..#..", "..#..", "..#..", ".....", "..#.."],
  "?": [".###.", "#...#", "..##.", ".....", "..#.."],
  "v": [".....", "....#", "#..#.", "#.#..", ".#..."],
  "x": ["#...#", ".#.#.", "..#..", ".#.#.", "#...#"],
  ".": [".....", ".....", "#.#.#", ".....", "....."],
};
export function drawBubble(g, x, y, glyph, color) {
  rect(g, x, y, 9, 8, "#0f172a"); rect(g, x + 1, y + 1, 7, 6, "#ffffff"); rect(g, x + 3, y + 8, 2, 1, "#0f172a");
  GLYPH[glyph].forEach((row, j) => { for (let i = 0; i < 5; i++) if (row[i] === "#") rect(g, x + 2 + i, y + 1 + j, 1, 1, color); });
}

export function drawConfetti(g, x, y, f) {
  const cols = ["#f43f5e", "#facc15", "#38bdf8", "#4ade80"];
  for (let i = 0; i < 8; i++) rect(g, x + ((i * 7 + f * 3) % 22) - 8, y - 4 + ((f * 2 + i * 5) % 12), 1, 1, cols[i % 4]);
}
