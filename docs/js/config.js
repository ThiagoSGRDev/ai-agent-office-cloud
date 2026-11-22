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
  { id: "alex",   name: "Alex",   role: "PM",         active: true,  look: { skin: "#f1c27d", hair: "#2b2118", shirt: "#3b82f6", accent: "#e5e7eb", extra: "glasses" } },
  { id: "lucas",  name: "Lucas",  role: "Full Stack", active: true,  look: { skin: "#d9a066", hair: "#6b3f1d", shirt: "#16a34a", accent: "#bbf7d0", extra: "headphones" } },
  { id: "sofia",  name: "Sofia",  role: "QA",         active: true,  look: { skin: "#f5d0b0", hair: "#b91c1c", shirt: "#9333ea", accent: "#f3e8ff", extra: "ponytail" } },
  { id: "arthur", name: "Arthur", role: "Arquiteto",  active: false, look: { skin: "#e0ac69", hair: "#9ca3af", shirt: "#0f766e", accent: "#ccfbf1", extra: "none" } },
  { id: "noah",   name: "Noah",   role: "Segurança",  active: false, look: { skin: "#8d5524", hair: "#111827", shirt: "#374151", accent: "#fca5a5", extra: "none" } },
  { id: "maya",   name: "Maya",   role: "UI/UX",      active: false, look: { skin: "#f1c27d", hair: "#7c3aed", shirt: "#ec4899", accent: "#fce7f3", extra: "ponytail" } },
  { id: "ethan",  name: "Ethan",  role: "DevOps",     active: false, look: { skin: "#c68642", hair: "#451a03", shirt: "#ea580c", accent: "#ffedd5", extra: "headphones" } },
  { id: "olivia", name: "Olivia", role: "Pesquisa",   active: false, look: { skin: "#ffdbac", hair: "#fbbf24", shirt: "#0284c7", accent: "#e0f2fe", extra: "glasses" } },
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
