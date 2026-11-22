import { AGENTS, POLL_MS, STATE_STYLE } from "./config.js";
import { createStore, resolveAgent, resolveBanner, formatAge } from "./state.js";
import { createOffice } from "./office.js";
import { bindInput } from "./input.js";

const $ = (id) => document.getElementById(id);
const canvas = $("office");
const nowSec = () => Math.floor(Date.now() / 1000);

const prefs = { paused: false, reduced: false };
try { prefs.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { /* ignore */ }
try { const s = localStorage.getItem("aao-reduced"); if (s !== null) prefs.reduced = s === "1"; } catch { /* storage may be blocked */ }

const store = createStore(onData);
const office = createOffice(canvas, () => ({ snap: store.snap, nowSec: nowSec(), reduced: prefs.reduced }));
bindInput(canvas, office);

// ---- legend (static) -------------------------------------------------------------------------
for (const k of ["working", "idle", "completed", "blocked", "unknown", "standby"]) {
  const li = document.createElement("li"), sw = document.createElement("i");
  sw.style.background = STATE_STYLE[k].color;
  li.append(sw, document.createTextNode(STATE_STYLE[k].label));
  $("legend").append(li);
}

// ---- DOM mirror (accessibility + verifiable state); textContent only, never innerHTML ----------
function updateDom() {
  const t = nowSec(), banner = $("banner"), b = resolveBanner(store, t);
  if (b) { banner.hidden = false; banner.dataset.level = b.level; banner.textContent = b.text; } else { banner.hidden = true; banner.textContent = ""; }
  const sr = $("sr");
  sr.replaceChildren();
  for (const a of AGENTS) {
    const r = resolveAgent(a, store.snap, t), li = document.createElement("li");
    li.dataset.agent = a.id; li.dataset.state = r.state; li.dataset.reason = r.reason;
    li.textContent = `${a.name}, ${a.role}: ${STATE_STYLE[r.state].label}${r.ageSec != null ? ", há " + formatAge(r.ageSec) : ""}`;
    sr.append(li);
  }
}

function onData() { updateDom(); office.render(); document.body.dataset.ready = "1"; }

// ---- animation loop: 8 fps, stops when paused / reduced / tab hidden ---------------------------
let raf = 0, last = 0;
const shouldAnimate = () => !prefs.paused && !prefs.reduced && !document.hidden;
function loop(ts) {
  raf = requestAnimationFrame(loop);
  if (ts - last < 125) return;
  last = ts;
  office.step();
}
function syncAnimation() {
  office.setAnimate(shouldAnimate());
  if (shouldAnimate() && !raf) raf = requestAnimationFrame(loop);
  if (!shouldAnimate() && raf) { cancelAnimationFrame(raf); raf = 0; }
  office.render();
}

// ---- controls ---------------------------------------------------------------------------------
function toggle(btn, key, onLabel, offLabel, persist) {
  const sync = () => { btn.setAttribute("aria-pressed", String(prefs[key])); btn.textContent = prefs[key] ? onLabel : offLabel; };
  btn.addEventListener("click", () => {
    prefs[key] = !prefs[key];
    if (persist) { try { localStorage.setItem(persist, prefs[key] ? "1" : "0"); } catch { /* ignore */ } }
    sync(); syncAnimation();
  });
  sync();
}
toggle($("btn-pause"), "paused", "Retomar", "Pausar");
toggle($("btn-reduce"), "reduced", "Animações reduzidas", "Reduzir animações", "aao-reduced");
const center = () => ({ x: office.size.w / 2, y: office.size.h / 2 });
$("btn-zoom-in").addEventListener("click", () => { const c = center(); office.zoomBy(1, c.x, c.y); });
$("btn-zoom-out").addEventListener("click", () => { const c = center(); office.zoomBy(-1, c.x, c.y); });
$("btn-fit").addEventListener("click", () => office.resetView());

// ---- lifecycle ----------------------------------------------------------------------------------
new ResizeObserver(() => office.resize()).observe(canvas);
document.addEventListener("visibilitychange", () => { syncAnimation(); if (!document.hidden) store.refresh(); });
setInterval(() => { updateDom(); if (!raf) office.render(); }, 15_000);   // keep ages/banners honest while paused
(function poll() { if (!document.hidden) store.refresh(); setTimeout(poll, POLL_MS); })();
updateDom();
office.resize();
syncAnimation();
