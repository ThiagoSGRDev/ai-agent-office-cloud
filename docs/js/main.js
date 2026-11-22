import { AGENTS, POLL_MS, STATE_STYLE, FPS_BUSY, IDLE_TICK_MS } from "./config.js";
import { createStore, resolveAgent, resolveBanner, formatAge } from "./state.js";
import { createOffice } from "./office.js";
import { bindInput } from "./input.js";

const $ = (id) => document.getElementById(id);
const stage = $("stage"), canvas = $("office");
const nowSec = () => Math.floor(Date.now() / 1000);

const prefs = { paused: false, reduced: false };
try { prefs.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { /* ignore */ }
try { const s = localStorage.getItem("aao-reduced"); if (s !== null) prefs.reduced = s === "1"; } catch { /* storage may be blocked */ }

const store = createStore(onData);
const office = createOffice(stage, $("world"), canvas, $("labels"), () => ({ snap: store.snap, nowSec: nowSec(), reduced: prefs.reduced }));
bindInput(stage, office);

// ---- legend (static) -------------------------------------------------------------------------
for (const k of ["working", "idle", "completed", "blocked", "unknown", "standby"]) {
  const li = document.createElement("li"), sw = document.createElement("i");
  sw.style.background = STATE_STYLE[k].color;
  li.append(sw, document.createTextNode(STATE_STYLE[k].label));
  $("legend").append(li);
}

// ---- DOM mirror (accessibility + verifiable state); textContent only, never innerHTML ----------
const srItems = {};
for (const a of AGENTS) { const li = document.createElement("li"); li.dataset.agent = a.id; $("sr").append(li); srItems[a.id] = li; }
function updateDom() {
  const t = nowSec(), banner = $("banner"), b = resolveBanner(store, t);
  if (b) { banner.hidden = false; banner.dataset.level = b.level; banner.textContent = b.text; } else { banner.hidden = true; banner.textContent = ""; }
  for (const a of AGENTS) {
    const r = resolveAgent(a, store.snap, t), li = srItems[a.id];
    li.dataset.state = r.state; li.dataset.reason = r.reason;
    li.textContent = `${a.name}, ${a.role}: ${STATE_STYLE[r.state].label}${r.ageSec != null ? ", há " + formatAge(r.ageSec) : ""}`;
  }
  office.updatePlates();
}
let mirrorAt = 0;
function mirror(force) {                                   // where each character is (decorative layer), throttled
  const now = performance.now();
  if (!force && now - mirrorAt < 250) return;
  mirrorAt = now;
  const d = office.describe();
  for (const a of AGENTS) { const li = srItems[a.id], v = d[a.id]; li.dataset.mode = v.mode; li.dataset.x = v.x; li.dataset.y = v.y; li.dataset.plan = v.plan; li.dataset.pose = v.pose; }
}

function onData() { updateDom(); office.onData(); mirror(true); document.body.dataset.ready = "1"; }

// ---- animation loop: ~12 fps while something moves, a cheap 4 Hz scheduler tick otherwise ---------
let raf = 0, timer = 0, last = 0;
const shouldAnimate = () => !prefs.paused && !prefs.reduced && !document.hidden;
function frameLoop(ts) {
  raf = 0;
  if (!shouldAnimate()) return;
  const dt = last ? Math.min(0.25, (ts - last) / 1000) : 0;
  last = ts;
  office.update(dt);
  mirror(false);
  schedule();
}
function schedule() {
  if (!shouldAnimate() || raf || timer) return;
  timer = setTimeout(() => { timer = 0; raf = requestAnimationFrame(frameLoop); }, office.busy() ? Math.round(1000 / FPS_BUSY) - 16 : IDLE_TICK_MS);
}
function syncAnimation() {
  office.setAnimate(shouldAnimate());
  if (timer) { clearTimeout(timer); timer = 0; }
  if (raf) { cancelAnimationFrame(raf); raf = 0; }
  last = 0;
  office.update(0);                                        // applies "reduced motion" (everyone back at the desk)
  office.render(); mirror(true);
  schedule();
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
new ResizeObserver(() => office.resize()).observe(stage);
document.addEventListener("visibilitychange", () => { syncAnimation(); if (!document.hidden) store.refresh(); });
setInterval(() => { updateDom(); }, 15_000);               // keep ages/banners honest even while paused
(function poll() { if (!document.hidden) store.refresh(); setTimeout(poll, POLL_MS); })();
updateDom();
office.resize();
syncAnimation();
