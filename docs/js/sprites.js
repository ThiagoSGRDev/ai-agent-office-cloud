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
 * Seated character (14x18 footprint at x,y = top-left).
 * pose: work | idle | cheer | blocked | error | off.   smile: show a smile.
 * f: animation frame (0 when animations are reduced).
 * o: { look:-1|0|1, think, sip, yawn, shake, noChair, typing }  (small gestures; never move the character)
 */
export function drawPerson(g, x, y, look, pose, f, smile, o = {}) {
  const off = pose === "off";
  const c = (col) => (off ? gray(col) : col);
  const dy = pose === "cheer" ? -(f % 2) * 2 : 0;
  const hx = o.shake ? (f % 2 ? 1 : -1) : (o.look || 0);
  if (!o.noChair) drawChair(g, x, y, off);
  const shirt = c(look.shirt), skin = c(look.skin), hair = c(look.hair), dark = c("#111827");
  rect(g, x + 2, y + 6 + dy, 10, 8, shirt);                         // torso
  rect(g, x + 5, y + 6 + dy, 4, 2, c(look.accent));                 // collar
  // arms
  const tf = Math.floor(f / (o.typing || 2));
  if (pose === "cheer") {
    rect(g, x, y + dy, 2, 8, shirt); rect(g, x, y + dy - 2, 2, 2, skin);
    rect(g, x + 12, y + dy, 2, 8, shirt); rect(g, x + 12, y + dy - 2, 2, 2, skin);
  } else if (pose === "blocked") {                                  // head in hands
    rect(g, x + 1, y + 5, 2, 7, shirt); rect(g, x + 11, y + 5, 2, 7, shirt);
    rect(g, x + 2, y + 1, 2, 4, skin); rect(g, x + 10, y + 1, 2, 4, skin);
  } else {
    const typing = pose === "work";
    rect(g, x, y + 8, 2, typing ? 4 : 5, shirt);                    // left arm
    if (typing) rect(g, x, y + 12 + (tf % 2), 2, 2, skin); else rect(g, x, y + 13, 2, 1, skin);
    if (o.think || o.sip) {                                         // right arm raised
      rect(g, x + 11, y + 7, 2, 4, shirt); rect(g, x + 10, y + 4, 2, 3, skin);
      if (o.sip) rect(g, x + 9, y + 3, 3, 3, "#f8fafc");
    } else {
      rect(g, x + 12, y + 8, 2, typing ? 4 : 5, shirt);
      if (typing) rect(g, x + 12, y + 12 + ((tf + 1) % 2), 2, 2, skin); else rect(g, x + 12, y + 13, 2, 1, skin);
    }
  }
  // head
  const hy = y + dy;
  rect(g, x + 4 + hx, hy, 6, 6, skin);
  rect(g, x + 4 + hx, hy - 1, 6, 2, hair); rect(g, x + 3 + hx, hy, 1, 3, hair); rect(g, x + 10 + hx, hy, 1, 3, hair);
  if (look_extra(look) === "ponytail") { rect(g, x + 10 + hx, hy + 1, 2, 5, hair); rect(g, x + 11 + hx, hy + 5, 1, 2, hair); }
  if (look_extra(look) === "headphones") { const hp = c("#334155"); rect(g, x + 3 + hx, hy - 2, 8, 1, hp); rect(g, x + 2 + hx, hy + 1, 2, 3, hp); rect(g, x + 10 + hx, hy + 1, 2, 3, hp); }
  if (pose === "error") {
    for (const ex of [5, 8]) { rect(g, x + ex + hx, hy + 2, 2, 2, dark); }
  } else if (off) {
    rect(g, x + 5 + hx, hy + 3, 2, 1, dark); rect(g, x + 8 + hx, hy + 3, 2, 1, dark);
  } else {
    const ex = hx > 0 ? 1 : 0;
    rect(g, x + 5 + hx + ex, hy + 3, 1, 1, dark); rect(g, x + 9 + hx + ex, hy + 3, 1, 1, dark);
  }
  if (look_extra(look) === "glasses") {
    const gl = c("#0f172a");
    rect(g, x + 4 + hx, hy + 2, 3, 1, gl); rect(g, x + 8 + hx, hy + 2, 3, 1, gl); rect(g, x + 7 + hx, hy + 2, 1, 1, gl);
    rect(g, x + 4 + hx, hy + 4, 3, 1, gl); rect(g, x + 8 + hx, hy + 4, 3, 1, gl);
  }
  if (o.yawn) { rect(g, x + 6 + hx, hy + 4, 3, 2, dark); rect(g, x + 10 + hx, hy + 3, 2, 3, skin); }
  else if (smile) rect(g, x + 6 + hx, hy + 5, 3, 1, dark);
}
function look_extra(look) { return look.extra; }

/**
 * Standing / walking character. (cx, feet) = bottom-center of the feet; the sprite is 14 wide, 23 tall.
 * o: { dir:'down'|'up'|'left'|'right', frame, walk, arms:'down'|'swing'|'up'|'mug'|'paper'|'point'|'water'|'look', talk }
 */
export function drawStanding(g, cx, feet, look, o) {
  const dir = o.dir || "down", f = o.frame || 0, arms = o.arms || "down";
  const x = Math.round(cx) - 7, base = Math.round(feet);
  const lift = o.walk && (f % 2) ? 1 : 0;
  const Y = base - 23 - lift;                                        // body top
  const skin = look.skin, hair = look.hair, shirt = look.shirt, pants = "#1e293b", shoe = "#0f172a", dark = "#111827";
  const side = dir === "left" || dir === "right";
  const sgn = dir === "left" ? -1 : 1;
  // legs
  const phase = f % 4, legTop = base - 9;
  if (!side) {
    const lifts = o.walk ? [[0, 2], [0, 0], [2, 0], [0, 0]][phase] : [0, 0];
    rect(g, x + 3, legTop, 3, 9 - lifts[0], pants); rect(g, x + 3, base - 1 - lifts[0], 3, 1, shoe);
    rect(g, x + 8, legTop, 3, 9 - lifts[1], pants); rect(g, x + 8, base - 1 - lifts[1], 3, 1, shoe);
  } else {
    const sw = o.walk ? [0, 2, 0, -2][phase] : 0;
    rect(g, x + 5 - sw, legTop, 3, 9, "#0f172a"); rect(g, x + 5 - sw, base - 1, 3 + (sgn > 0 ? 1 : 0), 1, shoe);
    rect(g, x + 6 + sw, legTop, 3, 9, pants); rect(g, x + 6 + sw, base - 1, 3 + (sgn > 0 ? 1 : 0), 1, shoe);
  }
  // torso
  if (!side) { rect(g, x + 2, Y + 6, 10, 8, shirt); if (dir === "down") rect(g, x + 5, Y + 6, 4, 2, look.accent); }
  else rect(g, x + 4, Y + 6, 6, 8, shirt);
  // arms
  const sw2 = o.walk ? [0, 1, 0, -1][phase] : 0;
  const armsTop = Y + 7;
  if (!side) {
    const aL = (arms === "swing" ? sw2 : 0), aR = (arms === "swing" ? -sw2 : 0);
    if (arms === "up") {
      rect(g, x, Y + (f % 2), 2, 8, shirt); rect(g, x, Y - 2 + (f % 2), 2, 2, skin); rect(g, x + 12, Y + (f % 2), 2, 8, shirt); rect(g, x + 12, Y - 2 + (f % 2), 2, 2, skin);
    } else {
      rect(g, x, armsTop + aL, 2, 6, shirt); rect(g, x, armsTop + 6 + aL, 2, 1, skin);
      if (arms === "mug") {
        const up = ((f >> 2) % 2) === 0;
        rect(g, x + 11, armsTop - 1 + (up ? 0 : 3), 2, 4, shirt); rect(g, x + 10, armsTop - 3 + (up ? 0 : 3), 3, 3, "#f8fafc"); rect(g, x + 11, armsTop + 2, 2, 1, skin);
      } else if (arms === "point") {
        const p = (f >> 2) % 2;
        rect(g, x + 12, Y + 1 + p, 2, 8, shirt); rect(g, x + 12, Y - 1 + p, 2, 2, skin);
      } else if (arms === "water") {
        rect(g, x + 12, armsTop, 5, 2, shirt); rect(g, x + 16, armsTop - 1, 4, 4, "#60a5fa"); rect(g, x + 19, armsTop + 1, 3, 1, "#93c5fd");
        if (f % 2) rect(g, x + 22, armsTop + 3 + (f % 3), 1, 1, "#bfdbfe");
      } else {
        rect(g, x + 12, armsTop + aR, 2, 6, shirt); rect(g, x + 12, armsTop + 6 + aR, 2, 1, skin);
      }
    }
  } else {
    const ax = sgn > 0 ? x + 8 : x + 4;
    if (arms === "paper") {
      const px = sgn > 0 ? x + 9 : x - 4;
      rect(g, sgn > 0 ? x + 8 : x - 1, armsTop + 1, 7, 2, shirt); rect(g, px + (sgn > 0 ? 6 : 0), armsTop - 3, 5, 7, "#ffffff"); rect(g, px + (sgn > 0 ? 7 : 1), armsTop - 1, 3, 1, "#94a3b8"); rect(g, px + (sgn > 0 ? 7 : 1), armsTop + 1, 3, 1, "#94a3b8");
    } else if (arms === "look") {
      rect(g, ax, armsTop, 2, 6, shirt);
    } else {
      rect(g, ax, armsTop + (arms === "swing" ? sw2 : 0), 2, 6, shirt); rect(g, ax, armsTop + 6 + (arms === "swing" ? sw2 : 0), 2, 1, skin);
    }
  }
  // head
  if (dir === "up") {
    rect(g, x + 4, Y, 6, 6, hair); rect(g, x + 3, Y + 1, 1, 3, hair); rect(g, x + 10, Y + 1, 1, 3, hair);
    if (look.extra === "ponytail") { rect(g, x + 6, Y + 5, 2, 5, hair); }
    if (look.extra === "headphones") rect(g, x + 3, Y - 1, 8, 1, "#334155");
  } else if (dir === "down") {
    rect(g, x + 4, Y, 6, 6, skin); rect(g, x + 4, Y - 1, 6, 2, hair); rect(g, x + 3, Y, 1, 3, hair); rect(g, x + 10, Y, 1, 3, hair);
    rect(g, x + 5, Y + 3, 1, 1, dark); rect(g, x + 9, Y + 3, 1, 1, dark);
    if (look.extra === "glasses") { rect(g, x + 4, Y + 2, 3, 1, "#0f172a"); rect(g, x + 8, Y + 2, 3, 1, "#0f172a"); rect(g, x + 7, Y + 2, 1, 1, "#0f172a"); }
    if (look.extra === "headphones") { rect(g, x + 3, Y - 2, 8, 1, "#334155"); rect(g, x + 2, Y + 1, 2, 3, "#334155"); rect(g, x + 10, Y + 1, 2, 3, "#334155"); }
    if (look.extra === "ponytail") { rect(g, x + 10, Y + 1, 2, 5, hair); }
    if (o.talk && (f % 2)) rect(g, x + 6, Y + 5, 3, 1, dark);
  } else {
    const fx = sgn > 0 ? 1 : -1;
    rect(g, x + 4, Y, 6, 6, skin);
    rect(g, sgn > 0 ? x + 4 : x + 7, Y - 1, 3, 7, hair); rect(g, x + 4, Y - 1, 6, 2, hair);
    rect(g, sgn > 0 ? x + 8 : x + 5, Y + 3, 1, 1, dark); rect(g, sgn > 0 ? x + 10 : x + 3, Y + 4, 1, 1, skin);
    if (look.extra === "glasses") rect(g, sgn > 0 ? x + 8 : x + 5, Y + 2, 2, 1, "#0f172a");
    if (look.extra === "headphones") { rect(g, x + 3, Y - 2, 8, 1, "#334155"); rect(g, x + 5, Y + 1, 3, 3, "#334155"); }
    if (look.extra === "ponytail") { rect(g, sgn > 0 ? x + 2 : x + 10, Y + 1, 2, 6, hair); }
    if (o.talk && (f % 2)) rect(g, sgn > 0 ? x + 9 : x + 4, Y + 5, 2, 1, dark);
    void fx;
  }
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
