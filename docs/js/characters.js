// Characters: original "toy-block people" art direction (big round heads, compact bodies, mitten hands).
// Everything is drawn with integer coordinates (pixel snapping) - fractional values would anti-alias.
// PROTOTYPE art direction: "toy-block people" (original design inspired by building-toy figures).
// Big round heads, compact bodies, chunky arms with mitten hands, simple friendly faces,
// 1px dark outline + light/shadow shading. Sprite box = 16 x 26 map pixels (feet on the last row).
export const OUT = "#1e2233";
const hv = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mix = (a, b, t) => { const A = hv(a), B = hv(b); return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join(""); };
const ol = (c) => mix(c, OUT, 0.66);
const lt = (c, t = 0.25) => mix(c, "#ffffff", t), dk = (c, t = 0.25) => mix(c, "#000000", t);
const gray = (c) => { const [r, g, b] = hv(c); const y = Math.round(0.3 * r + 0.59 * g + 0.11 * b); const v = Math.min(225, Math.round(y * 0.7 + 62)); const s = v.toString(16).padStart(2, "0"); return "#" + s + s + s; };
function R(g, x, y, w, h, c) { g.fillStyle = c; g.fillRect(x, y, w, h); }
// rows = [[x0,x1], ...] inclusive; draws outline then fill
function shape(g, x, y, rows, fill, edge) {
  edge = edge || ol(fill);
  rows.forEach(([a, b], i) => { R(g, x + a - 1, y + i, b - a + 3, 1, edge); });
  R(g, x + rows[0][0], y - 1, rows[0][1] - rows[0][0] + 1, 1, edge);
  const l = rows[rows.length - 1]; R(g, x + l[0], y + rows.length, l[1] - l[0] + 1, 1, edge);
  rows.forEach(([a, b], i) => { R(g, x + a, y + i, b - a + 1, 1, fill); });
}

// ---- the eight characters -----------------------------------------------------------------------
export const CHARS = {
  alex:   { name: "Alex",   role: "Gerente",      skin: "#f2c29b", hair: "#3b2a20", hairStyle: "slick",  top: "#263a7a", outfit: "suit",     accent: "#d63a3a", pants: "#2b2f45", shoes: "#15161f", glasses: "round", glassCol: "#c3c9de" },
  arthur: { name: "Arthur", role: "Arquiteto",    skin: "#e9b98a", hair: "#b9bec9", hairStyle: "short",  top: "#1f8a8a", outfit: "vest",     accent: "#f3ead2", pants: "#4a4f66", shoes: "#2a2320", glasses: "square", glassCol: "#6b4a2b", mustache: true, pencil: true },
  lucas:  { name: "Lucas",  role: "Dev",          skin: "#d49a6a", hair: "#5b3a1e", hairStyle: "messy",  top: "#2e9e5b", outfit: "hoodie",   accent: "#e8e8e8", pants: "#3a5a8c", shoes: "#f1f1f1", phones: "#2b3040", phonesHi: "#58d68d" },
  sofia:  { name: "Sofia",  role: "QA",           skin: "#f5d0b0", hair: "#b0321c", hairStyle: "ponytail", top: "#7b3fb5", outfit: "blazer",  accent: "#ffffff", pants: "#2c2a40", shoes: "#1b1b28", badge: true },
  noah:   { name: "Noah",   role: "Segurança",    skin: "#8d5a3b", hair: "#15171f", hairStyle: "beanie", top: "#3a4150", outfit: "tactical", accent: "#f2c94c", pants: "#23262f", shoes: "#14151b", beanie: "#1b1f2a", earpiece: true },
  maya:   { name: "Maya",   role: "Design",       skin: "#ffd9b8", hair: "#8b3fd9", hairStyle: "bob",    top: "#e0408c", outfit: "creative", accent: "#ffd23f", pants: "#2e3a63", shoes: "#f3f3f3", beret: "#e63b3b", streak: "#ff77b7" },
  ethan:  { name: "Ethan",  role: "DevOps",       skin: "#c58a5e", hair: "#2a1a12", hairStyle: "cap",    top: "#e8782a", outfit: "tech",     accent: "#36d6ff", pants: "#2a2f3d", shoes: "#14151b", cap: "#1b2a4a", glasses: "square", glassCol: "#36d6ff" },
  olivia: { name: "Olivia", role: "Pesquisa",     skin: "#fbd9b5", hair: "#e6b53a", hairStyle: "bun",    band: "#5aa0d8", top: "#5aa0d8", outfit: "cardigan", accent: "#ffffff", pants: "#44506a", shoes: "#3b2a22", glasses: "round", glassCol: "#c99a2b", book: true },
};
export const ORDER = ["alex", "arthur", "lucas", "sofia", "noah", "maya", "ethan", "olivia"];

function palette(c, off) {
  if (!off) return c;
  const o = { ...c };
  for (const k of ["skin", "hair", "top", "accent", "pants", "shoes", "glassCol", "phones", "phonesHi", "beanie", "beret", "streak", "cap", "band"]) if (o[k]) o[k] = gray(o[k]);
  return o;
}

// ---- legs --------------------------------------------------------------------------------------
function legsFront(g, c, ox, oy, f, walk) {
  const lift = walk ? [[0, 2], [0, 0], [2, 0], [0, 0]][f % 4] : [0, 0];
  for (let s = 0; s < 2; s++) {
    const x = ox + (s ? 8 : 3), l = lift[s], h = 6 - l, top = oy + 20;
    R(g, x, top, 5, h, ol(c.pants)); R(g, x + 1, top, 3, h - 1, c.pants);
    R(g, x + 1, top, 1, h - 1, lt(c.pants, 0.14)); R(g, x + 3, top, 1, h - 1, dk(c.pants, 0.18));
    R(g, x + 1, top + h - 3, 3, 2, c.shoes);                       // shoes
    R(g, x + 1, top + h - 3, 3, 1, lt(c.shoes, 0.18));
  }
  R(g, ox + 7, oy + 20, 2, 1, ol(c.pants));
  R(g, ox + 3, oy + 20, 10, 1, dk(c.pants, 0.35));                // belt line
}
function legsSide(g, c, ox, oy, f, walk) {
  const sw = walk ? [0, 2, 0, -2][f % 4] : 0, back = ox + 4 - sw, front = ox + 8 + sw;
  for (const [x, shade] of [[back, true], [front, false]]) {
    const top = oy + 20, col = shade ? dk(c.pants, 0.22) : c.pants;
    R(g, x, top, 5, 6, ol(col)); R(g, x + 1, top, 3, 5, col);
    R(g, x + 1, top + 3, 3, 2, c.shoes); R(g, x + 4, top + 4, 1, 2, ol(c.shoes)); R(g, x + 4, top + 4, 1, 1, c.shoes);   // toe forward
  }
  R(g, ox + 5, oy + 20, 6, 1, dk(c.pants, 0.35));
}

// ---- torso + outfit ---------------------------------------------------------------------------
function torsoFront(g, c, ox, oy, back) {
  const x = ox + 3, y = oy + 13;
  R(g, x, y, 10, 7, ol(c.top)); R(g, x + 1, y, 8, 6, c.top);
  R(g, x + 1, y, 1, 6, lt(c.top, 0.16)); R(g, x + 8, y, 1, 6, dk(c.top, 0.2)); R(g, x + 1, y + 5, 8, 1, dk(c.top, 0.18));
  const o = c.outfit;
  if (back) {
    if (o === "hoodie" || o === "tech") { R(g, x + 2, y, 6, 2, dk(c.top, 0.22)); R(g, x + 3, y, 4, 1, dk(c.top, 0.35)); }   // hood
    if (o === "suit" || o === "blazer") R(g, x + 4, y + 1, 1, 4, dk(c.top, 0.3));                                        // seam
    if (o === "tactical") { R(g, x + 1, y + 3, 8, 1, "#d9dde5"); R(g, x + 3, y + 1, 4, 2, "#f2c94c"); }
    if (o === "creative") R(g, x + 1, y, 8, 1, c.accent);
    if (o === "cardigan") R(g, x + 4, y + 1, 1, 4, dk(c.top, 0.25));
    if (o === "vest") R(g, x + 4, y + 1, 1, 4, dk(c.top, 0.3));
    return;
  }
  if (o === "suit") {
    R(g, x + 3, y, 4, 2, "#f6f6fa"); R(g, x + 4, y + 2, 2, 1, "#f6f6fa");               // white shirt V
    R(g, x + 4, y, 2, 1, c.accent); R(g, x + 4, y + 1, 2, 4, c.accent); R(g, x + 4, y + 1, 1, 4, lt(c.accent, 0.2)); // tie
    R(g, x + 2, y, 1, 3, dk(c.top, 0.4)); R(g, x + 7, y, 1, 3, dk(c.top, 0.4));          // lapels
    R(g, x + 1, y + 3, 2, 1, "#f2c94c");                                                 // name badge
  } else if (o === "vest") {
    R(g, x + 3, y, 4, 3, c.accent); R(g, x + 4, y + 3, 2, 1, c.accent);                 // cream shirt
    R(g, x + 4, y + 1, 1, 1, dk(c.accent, 0.3)); R(g, x + 4, y + 3, 1, 1, dk(c.accent, 0.3));
    R(g, x + 2, y, 1, 4, dk(c.top, 0.3)); R(g, x + 7, y, 1, 4, dk(c.top, 0.3));
    R(g, x + 1, y + 4, 2, 1, dk(c.top, 0.3));                                           // pocket
  } else if (o === "hoodie") {
    R(g, x + 2, y, 6, 1, dk(c.top, 0.25));                                              // hood ring
    R(g, x + 3, y + 1, 1, 3, c.accent); R(g, x + 6, y + 1, 1, 3, c.accent);            // strings
    R(g, x + 2, y + 4, 6, 1, dk(c.top, 0.28));                                          // pocket
  } else if (o === "blazer") {
    R(g, x + 3, y, 4, 2, "#f6f6fa"); R(g, x + 4, y + 2, 2, 1, "#f6f6fa");
    R(g, x + 2, y, 1, 3, dk(c.top, 0.4)); R(g, x + 7, y, 1, 3, dk(c.top, 0.4));
    R(g, x + 2, y, 1, 4, "#38bdf8");                                                    // lanyard
    R(g, x + 6, y + 3, 3, 2, "#ffffff"); R(g, x + 7, y + 4, 1, 1, "#22c55e"); R(g, x + 6, y + 3, 3, 1, "#e5e7eb"); // badge with check
  } else if (o === "tactical") {
    R(g, x + 4, y, 1, 6, dk(c.top, 0.35));                                              // zipper
    R(g, x + 1, y + 3, 8, 1, "#d9dde5");                                                // reflective stripe
    R(g, x + 2, y + 1, 2, 2, c.accent); R(g, x + 2, y + 1, 1, 1, lt(c.accent, 0.4));   // shield
    R(g, x + 6, y + 1, 2, 1, dk(c.top, 0.3));
  } else if (o === "creative") {
    R(g, x + 1, y, 8, 2, c.accent); R(g, x + 2, y, 1, 2, "#36d6ff"); R(g, x + 5, y, 1, 2, "#ff5a8a"); R(g, x + 7, y, 1, 2, "#4ade80"); // scarf
    R(g, x + 2, y + 3, 1, 1, "#36d6ff"); R(g, x + 6, y + 4, 1, 1, "#ffd23f"); R(g, x + 7, y + 3, 1, 1, "#ffffff"); // paint dots
  } else if (o === "tech") {
    R(g, x + 1, y + 1, 1, 3, c.accent); R(g, x + 1, y + 1, 3, 1, c.accent); R(g, x + 6, y + 4, 3, 1, c.accent); R(g, x + 8, y + 2, 1, 3, c.accent); // circuit lines
    R(g, x + 4, y + 2, 2, 2, "#1b2a4a"); R(g, x + 4, y + 2, 1, 1, c.accent);                                                                    // gear patch
  } else if (o === "cardigan") {
    R(g, x + 3, y, 4, 3, "#f6f6fa"); R(g, x + 4, y + 3, 2, 1, "#f6f6fa");
    R(g, x + 4, y, 1, 6, dk(c.top, 0.2)); R(g, x + 4, y + 1, 1, 1, "#f6f6fa"); R(g, x + 4, y + 3, 1, 1, "#f6f6fa");
    R(g, x + 1, y + 3, 2, 2, "#fde68a"); R(g, x + 1, y + 3, 2, 1, "#facc15");           // book pin
  }
}
function torsoSide(g, c, ox, oy) {
  const x = ox + 5, y = oy + 13;
  R(g, x, y, 7, 7, ol(c.top)); R(g, x + 1, y, 5, 6, c.top);
  R(g, x + 1, y, 1, 6, lt(c.top, 0.14)); R(g, x + 5, y, 1, 6, dk(c.top, 0.2)); R(g, x + 1, y + 5, 5, 1, dk(c.top, 0.18));
  const o = c.outfit;
  if (o === "suit") { R(g, x + 4, y, 1, 4, c.accent); R(g, x + 3, y, 1, 2, "#f6f6fa"); }
  if (o === "blazer") { R(g, x + 4, y, 1, 4, "#38bdf8"); R(g, x + 3, y, 1, 2, "#f6f6fa"); }
  if (o === "hoodie") { R(g, x + 1, y + 4, 4, 1, dk(c.top, 0.28)); R(g, x + 4, y, 1, 2, dk(c.top, 0.25)); }
  if (o === "tactical") R(g, x + 1, y + 3, 5, 1, "#d9dde5");
  if (o === "tech") { R(g, x + 1, y + 1, 1, 3, c.accent); R(g, x + 3, y + 4, 3, 1, c.accent); }
  if (o === "creative") R(g, x + 1, y, 5, 2, c.accent);
  if (o === "cardigan") { R(g, x + 4, y, 1, 4, "#f6f6fa"); }
  if (o === "vest") { R(g, x + 4, y, 1, 3, c.accent); }
}

// ---- arms ---------------------------------------------------------------------------------------
function armFront(g, c, ox, oy, side, dy, up, noHand) {
  const x = ox + (side < 0 ? 0 : 13), y = oy + 14 + dy, fx = side < 0 ? x + 1 : x, sleeve = c.outfit === "vest" ? c.accent : c.top;
  if (up) {                                                         // arm raised, clear of the head
    const hx = side < 0 ? ox - 2 : ox + 14, hy = oy + 3 + dy;
    R(g, hx, hy, 4, 13, ol(sleeve)); R(g, hx + 1, hy + 3, 2, 10, sleeve); R(g, hx + 1, hy + 3, 1, 10, lt(sleeve, 0.14));
    R(g, hx, hy - 1, 4, 5, ol(c.skin)); R(g, hx + 1, hy, 2, 3, c.skin); R(g, hx + 1, hy, 2, 1, lt(c.skin, 0.12));    // raised mitten hand
    R(g, side < 0 ? ox : ox + 12, oy + 13, 4, 3, ol(sleeve)); R(g, side < 0 ? ox + 1 : ox + 12, oy + 13, 3, 2, sleeve);                 // shoulder joint
    return;
  }
  if (noHand) { R(g, x, y, 3, 7, ol(sleeve)); R(g, fx, y, 2, 7, sleeve); R(g, fx, y, 1, 7, lt(sleeve, 0.14)); return; }
  R(g, x, y, 3, 8, ol(sleeve)); R(g, fx, y, 2, 5, sleeve); R(g, fx, y, 1, 5, lt(sleeve, 0.14));
  R(g, x, y + 5, 3, 3, ol(c.skin)); R(g, fx, y + 5, 2, 2, c.skin); R(g, fx, y + 5, 2, 1, lt(c.skin, 0.12)); R(g, side < 0 ? fx : fx + 1, y + 6, 1, 1, dk(c.skin, 0.18));   // mitten hand with thumb shade
  R(g, fx, y + 4, 2, 1, dk(sleeve, 0.2));                                                      // cuff
}
function armSide(g, c, ox, oy, dx, dy) {
  const x = ox + 6 + dx, y = oy + 14 + dy, sleeve = c.outfit === "vest" ? c.accent : c.top;
  R(g, x, y, 5, 8, ol(sleeve)); R(g, x + 1, y, 3, 5, sleeve); R(g, x + 1, y, 1, 5, lt(sleeve, 0.14)); R(g, x + 3, y, 1, 5, dk(sleeve, 0.2));
  R(g, x + 1, y + 5, 3, 2, c.skin); R(g, x + 3, y + 6, 1, 1, dk(c.skin, 0.18)); R(g, x + 1, y + 4, 3, 1, dk(sleeve, 0.2));
}

// ---- heads / faces ------------------------------------------------------------------------------
const HEAD = [[1, 10], [0, 11], [0, 11], [0, 11], [0, 11], [0, 11], [0, 11], [0, 11], [0, 11], [1, 10]];
const EYE = "#1a1d2b", WH = "#ffffff", MOUTH = "#8c3a3a", MOUTH2 = "#6f2430";
function faceFront(g, c, x, y, expr) {
  shape(g, x, y, HEAD, c.skin);
  R(g, x + 10, y + 2, 1, 7, dk(c.skin, 0.12)); R(g, x + 1, y + 8, 10, 1, dk(c.skin, 0.08));        // side + chin shade
  R(g, x + 1, y + 1, 3, 1, lt(c.skin, 0.2));                                                          // forehead light
  const gl = !!c.glasses, blush = mix(c.skin, "#ff6f86", 0.34), tint = "#eef5ff", darkSkin = (() => { const [r, g2, b] = hv(c.skin); return 0.3 * r + 0.59 * g2 + 0.11 * b < 160; })();
  // eyes: 2 wide x 3 tall, one highlight pixel. With glasses: white lens + 1px pupil looking forward.
  const eye = (ex, left) => {
    if (gl) { const wx = left ? ex : ex + 1, px = left ? ex + 1 : ex; R(g, x + wx, y + 3, 1, 3, tint); R(g, x + px, y + 3, 1, 3, EYE); R(g, x + px, y + 3, 1, 1, "#5b6275"); }
    else if (darkSkin) { const wx = left ? ex : ex + 1, px = left ? ex + 1 : ex; R(g, x + wx, y + 3, 1, 3, "#f4f8ff"); R(g, x + px, y + 3, 1, 3, EYE); }
    else { R(g, x + ex, y + 3, 2, 3, EYE); R(g, x + ex, y + 3, 1, 1, WH); }
  };
  if (expr === "off") {
    R(g, x + 2, y + 4, 2, 1, EYE); R(g, x + 8, y + 4, 2, 1, EYE); R(g, x + 5, y + 8, 2, 1, EYE); return;
  }
  if (expr === "yawn") {                                                                                // closed eyes + wide open mouth
    R(g, x + 2, y + 4, 2, 1, EYE); R(g, x + 8, y + 4, 2, 1, EYE); R(g, x + 5, y + 6, 2, 3, MOUTH2); return;
  }
  if (expr === "happy" && gl) {
    eye(2, true); eye(8, false); R(g, x + 4, y + 7, 4, 2, MOUTH2); R(g, x + 5, y + 8, 2, 1, "#ff8fa3"); R(g, x + 1, y + 6, 1, 1, blush); R(g, x + 10, y + 6, 1, 1, blush); return;
  }
  if (expr === "happy") {
    for (const ex of [1, 8]) { R(g, x + ex, y + 4, 1, 1, EYE); R(g, x + ex + 1, y + 3, 1, 1, EYE); R(g, x + ex + 2, y + 4, 1, 1, EYE); }   // ^ ^
    R(g, x + 4, y + 7, 4, 2, MOUTH2); R(g, x + 5, y + 8, 2, 1, "#ff8fa3");                           // open smile + tongue
    R(g, x + 1, y + 6, 1, 1, blush); R(g, x + 10, y + 6, 1, 1, blush); return;
  }
  eye(2, true); eye(8, false);
  if (expr === "talk") {
    R(g, x + 5, y + 7, 2, 2, MOUTH2); R(g, x + 1, y + 6, 1, 1, blush); R(g, x + 10, y + 6, 1, 1, blush);
  } else if (expr === "worried") {
    R(g, x + 4, y + 7, 4, 1, MOUTH); R(g, x + 3, y + 8, 1, 1, MOUTH); R(g, x + 8, y + 8, 1, 1, MOUTH);   // frown
    R(g, x + 12, y + 1, 1, 2, "#7dd3fc"); R(g, x + 12, y + 1, 1, 1, WH);                                // sweat drop
  } else if (expr === "focus") {
    R(g, x + 5, y + 8, 2, 1, MOUTH);                                                                    // small, calm mouth
  } else {
    R(g, x + 4, y + 7, 1, 1, MOUTH); R(g, x + 7, y + 7, 1, 1, MOUTH); R(g, x + 5, y + 8, 2, 1, MOUTH); // smile
    R(g, x + 1, y + 6, 1, 1, blush); R(g, x + 10, y + 6, 1, 1, blush);
  }
}
function faceSide(g, c, x, y, expr) {
  const rows = [[1, 8], [0, 9], [0, 9], [0, 9], [0, 9], [0, 9], [0, 9], [0, 9], [0, 9], [1, 8]];
  shape(g, x, y, rows, c.skin);
  R(g, x + 9, y + 5, 2, 2, ol(c.skin)); R(g, x + 9, y + 5, 1, 2, c.skin);                            // nose
  R(g, x + 2, y + 4, 1, 3, dk(c.skin, 0.18)); R(g, x, y + 2, 1, 7, dk(c.skin, 0.1));                 // ear + back shade
  if (expr === "off") { R(g, x + 6, y + 4, 2, 1, EYE); R(g, x + 7, y + 8, 2, 1, EYE); return; }
  if (!c.glasses) { R(g, x + 6, y + 3, 2, 3, EYE); R(g, x + 6, y + 3, 1, 1, WH); }
  R(g, x + 6, y + 6, 1, 1, mix(c.skin, "#ff6f86", 0.34));
  R(g, x + 7, y + 7, 3, 1, MOUTH); R(g, x + 9, y + 6, 1, 1, MOUTH);                                  // small smile
}

function hairFront(g, c, x, y) {
  // RULE: hair/hat shapes end at row y+1 (outline at y+2) so nothing touches the eye rows (y+3..y+5).
  const h = c.hairStyle === "x" ? "" : c.hair, hi = lt(h, 0.22), s = c.hairStyle, burn = (col) => { R(g, x, y + 2, 2, 2, col); R(g, x + 10, y + 2, 2, 2, col); };
  if (s === "slick") {
    shape(g, x, y - 2, [[2, 9], [1, 10], [0, 11], [0, 11]], h);
    R(g, x + 2, y - 2, 6, 1, hi); R(g, x + 3, y - 1, 1, 2, dk(h, 0.25)); R(g, x + 4, y + 2, 5, 1, h); burn(h);
  } else if (s === "short") {
    shape(g, x, y - 2, [[3, 8], [1, 10], [0, 11], [0, 11]], h);
    R(g, x + 3, y - 2, 4, 1, hi); burn(h);
  } else if (s === "messy") {
    shape(g, x, y - 3, [[1, 3], [5, 6], [8, 10]], h); R(g, x + 1, y - 2, 10, 1, h);
    shape(g, x, y - 2, [[1, 10], [0, 11], [0, 11], [0, 11]], h);
    R(g, x + 2, y - 2, 3, 1, hi); R(g, x + 3, y + 2, 2, 1, h); R(g, x + 6, y + 2, 3, 1, h); burn(h);
  } else if (s === "ponytail") {
    shape(g, x, y - 2, [[2, 9], [1, 10], [0, 11], [0, 11]], h);
    R(g, x + 2, y - 2, 5, 1, hi); R(g, x + 1, y + 2, 4, 1, h); R(g, x + 7, y + 2, 4, 1, h); R(g, x, y + 2, 2, 3, h); R(g, x + 10, y + 2, 2, 5, h);
  } else if (s === "beanie") {
    shape(g, x, y - 2, [[1, 10], [0, 11], [0, 11], [0, 11]], c.beanie);
    R(g, x, y, 12, 2, dk(c.beanie, 0.2)); R(g, x + 1, y, 10, 1, c.accent); R(g, x + 2, y - 2, 4, 1, lt(c.beanie, 0.2)); burn(h);
  } else if (s === "bob") {
    shape(g, x, y - 2, [[2, 9], [1, 10], [0, 11], [0, 11]], h);
    R(g, x + 2, y + 2, 8, 1, h); R(g, x + 3, y + 2, 2, 1, c.streak); R(g, x, y + 2, 2, 7, h); R(g, x + 10, y + 2, 2, 7, h); R(g, x + 2, y - 1, 3, 1, hi);
    R(g, x, y + 8, 2, 1, dk(h, 0.2)); R(g, x + 10, y + 8, 2, 1, dk(h, 0.2));
    shape(g, x + 1, y - 3, [[1, 8], [0, 9]], c.beret);
    R(g, x + 2, y - 3, 4, 1, lt(c.beret, 0.25)); R(g, x + 5, y - 4, 2, 1, dk(c.beret, 0.3));
  } else if (s === "cap") {
    shape(g, x, y - 2, [[2, 9], [1, 10], [0, 11], [0, 11]], c.cap);
    R(g, x + 2, y - 2, 5, 1, lt(c.cap, 0.25)); R(g, x + 4, y - 1, 4, 2, c.accent); R(g, x + 5, y - 1, 2, 1, "#ffffff");   // logo
    shape(g, x + 1, y + 1, [[0, 9]], dk(c.cap, 0.15)); burn(c.hair);                                                    // brim sits ABOVE the eyes
  } else if (s === "bun") {
    shape(g, x + 2, y - 6, [[2, 5], [1, 6], [0, 7], [0, 7]], h);                                      // round bun: 8px dome, as wide as the hair top
    shape(g, x, y - 2, [[2, 9], [1, 10], [0, 11], [0, 11]], h);
    R(g, x + 2, y - 2, 6, 1, hi); R(g, x + 1, y + 2, 3, 1, h); R(g, x + 8, y + 2, 3, 1, h); R(g, x, y + 2, 2, 5, h); R(g, x + 10, y + 2, 2, 5, h);
    R(g, x + 2, y - 3, 8, 1, h); R(g, x + 2, y - 2, 8, 1, c.band);                                      // joins bun to head, ribbon at its base
    R(g, x + 4, y - 6, 2, 1, hi); R(g, x + 3, y - 5, 2, 1, hi); R(g, x + 3, y - 4, 1, 1, hi); R(g, x + 6, y - 5, 2, 1, dk(h, 0.14)); R(g, x + 6, y - 4, 1, 1, dk(h, 0.14)); // highlight + swirl
  }
}
function hairBack(g, c, x, y) {
  const h = c.hair, hi = lt(h, 0.2), s = c.hairStyle;
  if (s === "beanie") { shape(g, x, y - 2, HEAD.map(([a, b]) => [a, b]).concat([]), c.beanie); R(g, x, y + 4, 12, 4, h); R(g, x, y + 1, 12, 2, dk(c.beanie, 0.2)); R(g, x + 1, y + 1, 10, 1, c.accent); return; }
  const base = s === "cap" ? c.cap : h;
  shape(g, x, y - 2, [[2, 9], [1, 10], ...Array(10).fill([0, 11]).slice(0, 7), [1, 10]], base);
  R(g, x + 2, y - 2, 6, 1, lt(base, 0.2));
  if (s === "cap") { R(g, x, y + 4, 12, 5, c.hair); R(g, x + 4, y + 2, 4, 1, dk(c.cap, 0.3)); }
  if (s === "bob") { R(g, x + 5, y + 2, 2, 7, c.streak); shape(g, x + 1, y - 3, [[1, 8], [0, 9]], c.beret); R(g, x + 2, y - 3, 4, 1, lt(c.beret, 0.25)); R(g, x + 5, y - 4, 2, 1, dk(c.beret, 0.3)); }
  if (s === "bun") {
    shape(g, x + 2, y - 6, [[2, 5], [1, 6], [0, 7], [0, 7]], h); R(g, x + 2, y - 3, 8, 1, h); R(g, x + 2, y - 2, 8, 1, c.band);
    R(g, x + 4, y - 6, 2, 1, hi); R(g, x + 3, y - 5, 2, 1, hi); R(g, x + 3, y - 4, 1, 1, hi); R(g, x + 6, y - 5, 2, 1, dk(h, 0.14)); R(g, x + 6, y - 4, 1, 1, dk(h, 0.14));
    R(g, x + 3, y + 2, 1, 6, dk(h, 0.12)); R(g, x + 8, y + 2, 1, 6, dk(h, 0.12)); R(g, x + 5, y + 6, 2, 1, dk(h, 0.2));
  }
  if (s === "ponytail") { shape(g, x + 4, y + 7, [[0, 3], [0, 3], [0, 3], [0, 3], [1, 2]], h); R(g, x + 5, y + 7, 1, 4, hi); R(g, x + 4, y + 6, 4, 1, "#ffd23f"); }
  if (s === "messy") { shape(g, x, y - 3, [[1, 3], [5, 6], [8, 10]], h); }
  if (s === "short" || s === "slick") R(g, x + 1, y + 6, 10, 1, dk(h, 0.2));
}
function hairSide(g, c, x, y) {
  const h = c.hair, hi = lt(h, 0.2), s = c.hairStyle;
  if (s === "beanie") { shape(g, x, y - 2, [[1, 8], [0, 9], [0, 9], [0, 9]], c.beanie); R(g, x, y, 10, 2, dk(c.beanie, 0.2)); R(g, x, y, 10, 1, c.accent); R(g, x, y + 2, 3, 6, h); return; }
  const base = s === "cap" ? c.cap : h;
  shape(g, x, y - 2, [[1, 8], [0, 9], [0, 9], [0, 9]], base);
  R(g, x + 1, y - 2, 5, 1, lt(base, 0.2)); R(g, x, y + 2, 3, 7, s === "cap" ? c.hair : h);
  if (s === "slick" || s === "short") { R(g, x + 6, y + 3, 3, 1, h); }
  if (s === "messy") { shape(g, x, y - 3, [[1, 3], [5, 6]], h); R(g, x + 6, y + 2, 3, 1, h); }
  if (s === "ponytail") { shape(g, x - 3, y + 2, [[0, 3], [0, 3], [0, 3], [0, 3], [1, 2]], h); R(g, x - 3, y + 1, 4, 1, "#ffd23f"); R(g, x + 6, y + 2, 3, 1, h); }
  if (s === "bob") { R(g, x, y + 2, 4, 8, h); R(g, x + 6, y + 2, 3, 1, h); R(g, x + 2, y + 3, 1, 5, c.streak); shape(g, x, y - 3, [[1, 8], [0, 9]], c.beret); R(g, x + 1, y - 3, 4, 1, lt(c.beret, 0.25)); }
  if (s === "cap") { shape(g, x + 7, y + 1, [[0, 5]], dk(c.cap, 0.15)); R(g, x + 4, y - 1, 2, 1, c.accent); }
  if (s === "bun") {
    shape(g, x + 1, y - 6, [[2, 5], [1, 6], [0, 7], [0, 7]], h); R(g, x + 1, y - 3, 8, 1, h); R(g, x + 1, y - 2, 8, 1, c.band);
    R(g, x + 3, y - 6, 2, 1, hi); R(g, x + 2, y - 5, 2, 1, hi); R(g, x + 2, y - 4, 1, 1, hi); R(g, x + 5, y - 5, 2, 1, dk(h, 0.14)); R(g, x + 6, y + 2, 3, 1, h);
  }
}

function extrasFront(g, c, x, y, expr) {
  if (c.glasses && expr !== "off") {                                  // 4x5 lens rings around the 2x3 eye area, 2px bridge, temple arms
    const gc = c.glassCol, round = c.glasses === "round";
    for (const lx of [1, 7]) {
      R(g, x + lx, y + 3, 1, 3, gc); R(g, x + lx + 3, y + 3, 1, 3, gc);
      if (round) { R(g, x + lx + 1, y + 2, 2, 1, gc); R(g, x + lx + 1, y + 6, 2, 1, gc); } else { R(g, x + lx, y + 2, 4, 1, gc); R(g, x + lx, y + 6, 4, 1, gc); }
    }
    R(g, x + 5, y + 3, 2, 1, gc); R(g, x, y + 3, 1, 1, gc); R(g, x + 11, y + 3, 1, 1, gc);
  }
  if (c.mustache) { const mc = dk(c.hair, 0.2); R(g, x + 3, y + 7, 6, 1, mc); R(g, x + 2, y + 8, 1, 1, mc); R(g, x + 9, y + 8, 1, 1, mc); }
  if (c.phones) { R(g, x - 1, y + 3, 3, 5, ol(c.phones)); R(g, x, y + 3, 2, 4, c.phones); R(g, x, y + 3, 1, 4, c.phonesHi); R(g, x + 10, y + 3, 3, 5, ol(c.phones)); R(g, x + 10, y + 3, 2, 4, c.phones); R(g, x + 11, y + 3, 1, 4, c.phonesHi); R(g, x + 1, y - 3, 10, 1, c.phones); R(g, x + 1, y - 4, 10, 1, ol(c.phones)); }
  if (c.earpiece) { R(g, x + 11, y + 5, 2, 2, "#e5e7eb"); R(g, x + 12, y + 7, 1, 4, "#e5e7eb"); R(g, x + 12, y + 10, 1, 2, dk("#e5e7eb", 0.3)); }
  if (c.pencil) { R(g, x - 1, y + 2, 1, 4, "#facc15"); R(g, x - 1, y + 2, 1, 1, "#f87171"); }
}
const lx0 = () => 3;
function extrasSide(g, c, x, y, expr) {
  if (c.glasses && expr !== "off") {
    const gc = c.glassCol;
    R(g, x + 5, y + 3, 1, 3, gc); R(g, x + 8, y + 3, 1, 3, gc); R(g, x + 6, y + 2, 2, 1, gc); R(g, x + 6, y + 6, 2, 1, gc);        // lens ring
    R(g, x + 6, y + 3, 2, 3, "#eef5ff"); R(g, x + 7, y + 3, 1, 3, EYE); R(g, x + 1, y + 3, 4, 1, gc);                                // lens + pupil + arm
  }
  if (c.mustache) R(g, x + 7, y + 7, 3, 1, dk(c.hair, 0.2));
  if (c.phones) { R(g, x + 1, y + 3, 4, 6, ol(c.phones)); R(g, x + 2, y + 3, 3, 5, c.phones); R(g, x + 2, y + 3, 1, 5, c.phonesHi); R(g, x, y - 3, 8, 1, c.phones); R(g, x, y - 4, 8, 1, ol(c.phones)); }
  if (c.earpiece) { R(g, x + 2, y + 7, 2, 2, "#e5e7eb"); R(g, x + 2, y + 9, 1, 3, "#e5e7eb"); }
  if (c.pencil) R(g, x + 3, y + 1, 3, 1, "#facc15");
}
function extrasBack(g, c, x, y) {
  if (c.phones) { R(g, x - 1, y + 3, 3, 5, OUT); R(g, x, y + 3, 2, 4, c.phones); R(g, x + 10, y + 3, 3, 5, OUT); R(g, x + 10, y + 3, 2, 4, c.phones); R(g, x + 1, y - 3, 10, 1, c.phones); R(g, x + 1, y - 4, 10, 1, OUT); }
  if (c.earpiece) R(g, x + 11, y + 5, 2, 5, "#e5e7eb");
}


// ---- gestures and pose-specific arms ----------------------------------------------------------------------
const sleeveOf = (c) => (c.outfit === "vest" ? c.accent : c.top);
function raisedForearm(g, c, ox, y0) {                       // right forearm bent up towards the face
  const sl = sleeveOf(c);
  R(g, ox + 12, y0 + 11, 3, 4, ol(sl)); R(g, ox + 13, y0 + 11, 2, 3, sl);
}
function gestureThink(g, c, ox, y0) { raisedForearm(g, c, ox, y0); R(g, ox + 11, y0 + 9, 3, 3, ol(c.skin)); R(g, ox + 12, y0 + 9, 2, 2, c.skin); }
function gestureSip(g, c, ox, y0) {
  raisedForearm(g, c, ox, y0);
  R(g, ox + 9, y0 + 10, 4, 5, ol("#f8fafc")); R(g, ox + 10, y0 + 10, 2, 4, "#f8fafc"); R(g, ox + 10, y0 + 10, 2, 1, "#cbd5e1");     // mug
  R(g, ox + 12, y0 + 11, 2, 3, ol("#f8fafc")); R(g, ox + 13, y0 + 12, 1, 1, c.skin);                                                // handle + fingers
}
function gestureYawn(g, c, ox, y0) { raisedForearm(g, c, ox, y0); R(g, ox + 10, y0 + 10, 3, 3, ol(c.skin)); R(g, ox + 11, y0 + 10, 2, 2, c.skin); }
function armWater(g, c, ox, y0, f) {
  const sl = sleeveOf(c);
  R(g, ox + 13, y0 + 15, 6, 4, ol(sl)); R(g, ox + 13, y0 + 16, 6, 2, sl);
  R(g, ox + 18, y0 + 13, 6, 6, ol("#60a5fa")); R(g, ox + 19, y0 + 14, 4, 4, "#60a5fa"); R(g, ox + 19, y0 + 14, 4, 1, "#93c5fd");
  R(g, ox + 23, y0 + 16, 3, 1, "#93c5fd"); if (f % 2) R(g, ox + 26, y0 + 18 + (f % 3), 1, 1, "#bfdbfe");
}
function armPaper(g, c, ox, y0) {                            // side view: arm stretched forward handing over a report
  const sl = sleeveOf(c);
  R(g, ox + 8, y0 + 15, 8, 4, ol(sl)); R(g, ox + 8, y0 + 16, 7, 2, sl);
  R(g, ox + 15, y0 + 15, 3, 3, ol(c.skin)); R(g, ox + 15, y0 + 15, 2, 2, c.skin);
  R(g, ox + 17, y0 + 11, 7, 9, "#cfd6e4"); R(g, ox + 18, y0 + 12, 5, 7, "#ffffff"); R(g, ox + 19, y0 + 14, 3, 1, "#94a3b8"); R(g, ox + 19, y0 + 16, 3, 1, "#94a3b8");
}

// ---- public API -----------------------------------------------------------------------------------------------
export const BOX = { w: 16, h: 26 };                          // sprite box; the feet are on the last row
/**
 * o: view 'front'|'side'|'back', mirror, pose 'stand'|'walk'|'sit'|'cheer'|'blocked', frame, expr, off,
 *    arms 'down'|'swing'|'up'|'point'|'mug'|'water'|'paper', talk, look(-1|0|1), shake, think, sip, yawn, noLegs
 */
export function drawChar(g, id, ox, oy, o = {}) {
  ox = Math.round(ox); oy = Math.round(oy);
  const c = palette(CHARS[id], o.off), view = o.view || "front", f = o.frame || 0, walk = o.pose === "walk";
  const seated = o.pose === "sit" || o.pose === "cheer" || o.pose === "blocked";
  let expr = o.off ? "off" : o.expr || (o.pose === "cheer" ? "happy" : o.pose === "blocked" ? "worried" : o.pose === "sit" ? "focus" : "smile");
  if (!o.off && o.yawn) expr = "yawn";
  if (!o.off && o.talk && (f % 2)) expr = "talk";
  g.save();
  if (o.mirror) { g.translate(ox * 2 + BOX.w, 0); g.scale(-1, 1); }
  const bob = walk && (f % 2) ? -1 : 0, y0 = oy + bob, sw = walk ? [0, 1, 0, -1][f % 4] : 0;
  const hx = o.shake ? (f % 2 ? 1 : -1) : (o.look || 0);
  const arms = o.arms || (walk ? "swing" : "down");
  if (!seated && !o.noLegs) (view === "side" ? legsSide : legsFront)(g, c, ox, oy, f, walk);
  if (view === "side") {
    torsoSide(g, c, ox, y0);
    if (arms === "paper") armPaper(g, c, ox, y0); else armSide(g, c, ox, y0, walk ? sw * 2 : 0, 0);
    faceSide(g, c, ox + 3, y0 + 3, expr); hairSide(g, c, ox + 3, y0 + 3); extrasSide(g, c, ox + 3, y0 + 3, expr);
  } else {
    const back = view === "back";
    torsoFront(g, c, ox, y0, back);
    if (o.pose === "cheer") { armFront(g, c, ox, y0, -1, -(f % 2), true); armFront(g, c, ox, y0, 1, -(f % 2), true); }
    else if (o.pose === "blocked") { armFront(g, c, ox, y0, -1, 0, false, true); armFront(g, c, ox, y0, 1, -(f % 2), true); }
    else if (seated) { armFront(g, c, ox, y0, -1, 0, false, true); armFront(g, c, ox, y0, 1, 0, false, true); }
    else if (arms === "up") { armFront(g, c, ox, y0, -1, -(f % 2), true); armFront(g, c, ox, y0, 1, -(f % 2), true); }
    else if (arms === "point") { armFront(g, c, ox, y0, -1, 0, false); armFront(g, c, ox, y0, 1, ((f >> 2) % 2) ? -1 : 0, true); }
    else if (arms === "mug") { armFront(g, c, ox, y0, -1, 0, false); armFront(g, c, ox, y0, 1, 0, false, true); }
    else if (arms === "water") { armFront(g, c, ox, y0, -1, 0, false); }
    else { armFront(g, c, ox, y0, -1, sw, false); armFront(g, c, ox, y0, 1, -sw, false); }
    if (back) { hairBack(g, c, ox + 2, y0 + 3); extrasBack(g, c, ox + 2, y0 + 3); }
    else { faceFront(g, c, ox + 2 + hx, y0 + 3, expr); hairFront(g, c, ox + 2 + hx, y0 + 3); extrasFront(g, c, ox + 2 + hx, y0 + 3, expr); }
    if (!back && o.think) gestureThink(g, c, ox, y0);
    if (!back && (o.sip || (arms === "mug" && ((f >> 2) % 2) === 0))) gestureSip(g, c, ox, y0);
    if (!back && o.yawn) gestureYawn(g, c, ox, y0);
    if (arms === "mug" && back) { R(g, ox + 12, y0 + 12, 3, 5, ol(sleeveOf(c))); R(g, ox + 13, y0 + 12, 2, 4, sleeveOf(c)); }
    if (arms === "water") armWater(g, c, ox, y0, f);
  }
  g.restore();
}

/** Person seated behind a desk. dx,dy = desk top-left (game layout convention). Call BEFORE drawing the desk. */
export function drawSeated(g, id, dx, dy, o = {}) { drawChar(g, id, dx + 8, dy - 19, { ...o, view: "front", pose: o.pose || "sit" }); }

/** Hands on the keyboard (typing when pose === 'work'). Call AFTER drawing the desk. */
export function seatedHands(g, id, dx, dy, o = {}) {
  const c = palette(CHARS[id], o.off), f = o.frame || 0, t = Math.floor(f / (o.typing || 2));
  if (o.pose === "cheer" || o.pose === "blocked" || o.hidden) return;
  const lh = o.pose === "work" ? (t % 2) : 0, rh = o.pose === "work" ? ((t + 1) % 2) : 0;
  const hand = (x, y) => { R(g, x, y, 4, 3, ol(c.skin)); R(g, x + 1, y, 2, 2, c.skin); R(g, x + 2, y + 1, 1, 1, dk(c.skin, 0.18)); };
  R(g, dx + 10, dy + 3, 12, 1, "#cbd5e1"); R(g, dx + 10, dy + 4, 12, 1, "#94a3b8");     // keyboard
  hand(dx + 10, dy + 1 - lh); hand(dx + 18, dy + 1 - rh);
}

/** Standing / walking character. (cx, feet) = bottom-centre of the feet. dir: down|up|left|right. */
export function drawStandingChar(g, id, cx, feet, o = {}) {
  const dir = o.dir || "down", view = dir === "left" || dir === "right" ? "side" : dir === "up" ? "back" : "front";
  drawChar(g, id, Math.round(cx) - 8, Math.round(feet) - BOX.h, { view, mirror: dir === "left", pose: o.walk ? "walk" : "stand", frame: o.frame || 0, arms: o.arms, talk: o.talk, expr: o.expr, off: o.off });
}

/** Person sitting on a sofa / seat (no chair, no desk). */
export function drawSitting(g, id, cx, seatY, o = {}) { drawChar(g, id, Math.round(cx) - 8, Math.round(seatY) - 23, { view: "front", pose: "sit", expr: o.expr || "smile", frame: o.frame || 0, off: o.off, look: o.look }); }
