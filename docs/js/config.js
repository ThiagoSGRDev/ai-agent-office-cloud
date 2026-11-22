// Central configuration. No secrets here: the frontend only READS a public JSON file.
export const DATA_URL = "https://raw.githubusercontent.com/ThiagoSGRDev/ai-agent-office-cloud/data/status.json";
export const POLL_MS = 60_000;          // data refresh (raw.githubusercontent caches for ~5 min anyway)
export const FETCH_TIMEOUT_MS = 10_000;
export const MAX_BYTES = 20_000;        // refuse unexpectedly large payloads

// Staleness rules (seconds). FRESH covers the ~5 min CDN cache plus margin.
export const FRESH_S = 6 * 60;
export const STALE_S = 30 * 60;
export const FUTURE_TOLERANCE_S = 60;   // device clock ahead of the data by more than this => unknown
export const CELEBRATE_S = 15;          // how long the "completed" celebration lasts

export const KNOWN_STATES = ["idle", "working", "completed", "blocked", "error"];

// Desk order (row-major). `active` = has a real configured agent in .claude/agents/.
export const AGENTS = [
  { id: "alex",   name: "Alex",   role: "PM",         active: true },
  { id: "lucas",  name: "Lucas",  role: "Full Stack", active: true },
  { id: "sofia",  name: "Sofia",  role: "QA",         active: true },
  { id: "arthur", name: "Arthur", role: "Arquiteto",  active: false },
  { id: "noah",   name: "Noah",   role: "Segurança",  active: false },
  { id: "maya",   name: "Maya",   role: "UI/UX",      active: false },
  { id: "ethan",  name: "Ethan",  role: "DevOps",     active: false },
  { id: "olivia", name: "Olivia", role: "Pesquisa",   active: false },
];

export const STATE_STYLE = {
  working:   { label: "Trabalhando", color: "#22c55e" },
  idle:      { label: "Ocioso",      color: "#94a3b8" },
  completed: { label: "Concluído",   color: "#38bdf8" },
  blocked:   { label: "Bloqueado",   color: "#f59e0b" },
  error:     { label: "Erro",        color: "#ef4444" },
  unknown:   { label: "Desconhecido", color: "#64748b" },
  standby:   { label: "Em espera",   color: "#475569" },
};

// ---- movement / behaviour (decorative layer; never changes the evidence shown on the nameplates) ----
export const WALK_SPEED = 24;            // map px per second
export const FPS_BUSY = 12;              // frames per second while something animates
export const IDLE_TICK_MS = 250;         // scheduler tick when nothing animates (no repaint)
export const MAX_WALKERS = 2;            // decorative walkers at the same time
export const MEETING_COOLDOWN_S = 300;   // at most one end-of-run meeting per 5 min

// Per-agent identity. interval = seconds between decorative outings (idle only);
// acts = weights of the outings; typing = frame divisor of the typing hands (1 = fastest).
export const PERSONA = {
  alex:  { interval: [150, 280], acts: { rounds: 3, whiteboard: 2, coffee: 2, stretch: 1 }, typing: 2 },
  lucas: { interval: [100, 200], acts: { coffee: 4, sofa: 2, stretch: 2, plant: 1 },        typing: 1 },
  sofia: { interval: [180, 320], acts: { whiteboard: 3, plant: 2, sofa: 2, stretch: 1 },    typing: 2 },
};
export const DEFAULT_PERSONA = { interval: [180, 320], acts: { coffee: 2, stretch: 2, sofa: 1, plant: 1 }, typing: 2 };
