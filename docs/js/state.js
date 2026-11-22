// Pure data logic: validation and the stale-state protection. No DOM access here.
import { AGENTS, KNOWN_STATES, MAX_BYTES, FRESH_S, STALE_S, FUTURE_TOLERANCE_S, DATA_URL, FETCH_TIMEOUT_MS } from "./config.js";

/** Parse and validate the public status.json (schema 1). Returns null when invalid. */
export function parseSnapshot(text) {
  if (typeof text !== "string" || text.length > MAX_BYTES) return null;
  let j;
  try { j = JSON.parse(text); } catch { return null; }
  if (!j || typeof j !== "object" || j.schema !== 1) return null;
  if (!Number.isInteger(j.generated_at)) return null;
  if (!j.agents || typeof j.agents !== "object" || Array.isArray(j.agents)) return null;
  const agents = {};
  for (const a of AGENTS) {                       // only known agent ids are ever read
    if (!Object.prototype.hasOwnProperty.call(j.agents, a.id)) continue;
    const v = j.agents[a.id];
    if (!v || typeof v !== "object") continue;
    agents[a.id] = {
      state: KNOWN_STATES.includes(v.state) ? v.state : null,      // anything else => unknown later
      updatedAt: Number.isInteger(v.updated_at) ? v.updated_at : null,
    };
  }
  return { generatedAt: j.generated_at, agents };
}

/**
 * Decide what may be SHOWN for one agent. Never claims activity without fresh evidence.
 * Returns {state, reason, ageSec}. state: idle|working|completed|blocked|error|unknown|standby
 */
export function resolveAgent(agent, snap, nowSec) {
  if (!snap) return { state: "unknown", reason: "sem-dados" };
  const d = snap.agents[agent.id];
  if (!d) return agent.active ? { state: "unknown", reason: "sem-dados" } : { state: "standby", reason: "em-espera" };
  if (d.state === null || d.updatedAt === null) return { state: "unknown", reason: "dado-invalido" };
  const age = nowSec - d.updatedAt;
  if (age < -FUTURE_TOLERANCE_S) return { state: "unknown", reason: "relogio", ageSec: 0 };
  const a = Math.max(0, age);
  if (a > STALE_S) return { state: "unknown", reason: "dado-antigo", ageSec: a };
  const perishable = d.state === "working" || d.state === "blocked" || d.state === "error";
  if (a > FRESH_S && perishable) return { state: "unknown", reason: "dado-antigo", ageSec: a };
  return { state: d.state, reason: "ok", ageSec: a };
}

export function formatAge(sec) {
  if (sec == null) return "";
  if (sec < 60) return "<1 min";
  if (sec < 3600) return Math.floor(sec / 60) + " min";
  return Math.floor(sec / 3600) + " h";
}

/** Banner for the data source as a whole. Returns {level, text} or null. */
export function resolveBanner(store, nowSec) {
  if (store.status === "loading") return { level: "info", text: "Carregando dados…" };
  if (store.status === "error") return { level: "error", text: "Sem conexão com os dados. Todos os estados estão desconhecidos." };
  if (store.status === "invalid") return { level: "error", text: "Dados inválidos. Todos os estados estão desconhecidos." };
  const age = nowSec - store.snap.generatedAt;
  if (age < -FUTURE_TOLERANCE_S) return { level: "warn", text: "O relógio deste dispositivo parece incorreto. Estados com data futura ficam desconhecidos." };
  if (age > STALE_S) return { level: "warn", text: "Sem dados recentes. Última atualização há " + formatAge(age) + "." };
  if (age > FRESH_S) return { level: "info", text: "Dados com atraso: última atualização há " + formatAge(age) + "." };
  return null;
}

/** Polls the public JSON. On ANY failure the previous snapshot is dropped (never shown as live). */
export function createStore(onChange) {
  const store = { status: "loading", snap: null };
  store.refresh = async function refresh() {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
    try {
      const r = await fetch(DATA_URL, { cache: "no-store", signal: ctrl.signal, credentials: "omit", referrerPolicy: "no-referrer" });
      if (!r.ok) throw new Error("http " + r.status);
      const snap = parseSnapshot(await r.text());
      store.snap = snap;
      store.status = snap ? "ok" : "invalid";
    } catch {
      store.snap = null;
      store.status = "error";
    } finally {
      clearTimeout(timer);
      onChange();
    }
  };
  return store;
}
