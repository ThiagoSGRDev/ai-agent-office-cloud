// Tests for docs/js/state.js (refresh races, timeout, size limits). Plain Node ESM, no browser.
// Run: node tests/state_test.mjs  (prints PASS/FAIL per test; exit code 1 if any fails)
import assert from "node:assert/strict";
import { createStore, parseSnapshot, resolveBanner } from "../docs/js/state.js";

const realFetch = globalThis.fetch;
const snapText = (gen, extra) => JSON.stringify({ schema: 1, generated_at: gen, agents: {}, ...(extra || {}) });

// Controllable fetch: every call is recorded; the test resolves/rejects it by hand. Respects signal.abort.
function stubFetch() {
  const reqs = [];
  globalThis.fetch = (url, opts = {}) => new Promise((resolve, reject) => {
    const req = { resolve, reject, signal: opts.signal };
    reqs.push(req);
    if (opts.signal) {
      const onAbort = () => reject(new Error("aborted"));
      if (opts.signal.aborted) onAbort(); else opts.signal.addEventListener("abort", onAbort, { once: true });
    }
  });
  return reqs;
}
const okResp = (body, headers = {}) => {
  const state = { textCalls: 0 };
  const r = {
    ok: true, status: 200,
    headers: { get: (k) => (headers[String(k).toLowerCase()] ?? null) },
    text: async () => { state.textCalls++; return body; },
  };
  return { r, state };
};
const tick = () => new Promise((res) => setImmediate(res));

const tests = [];
const test = (name, fn) => tests.push([name, fn]);

function newStore() {
  let calls = 0;
  const store = createStore(() => { calls++; });
  return { store, calls: () => calls };
}

test("R1a refresh antigo lento nao sobrescreve o mais novo", async () => {
  const reqs = stubFetch(); const { store } = newStore();
  const A = store.refresh(); const B = store.refresh();
  assert.equal(reqs.length, 2);
  reqs[1].resolve(okResp(snapText(200)).r); await B;
  reqs[0].resolve(okResp(snapText(100)).r); await A;
  assert.equal(store.snap && store.snap.generatedAt, 200);
  assert.equal(store.status, "ok");
});

test("R1b rejeicao tardia do refresh antigo preserva o snapshot novo", async () => {
  const reqs = stubFetch(); const { store } = newStore();
  const A = store.refresh(); const B = store.refresh();
  reqs[1].resolve(okResp(snapText(200)).r); await B;
  reqs[0].reject(new Error("network")); await A;
  assert.equal(store.snap && store.snap.generatedAt, 200);
  assert.equal(store.status, "ok");
});

test("R1c erro do mais novo nao e mascarado por resposta ok antiga", async () => {
  const reqs = stubFetch(); const { store } = newStore();
  const A = store.refresh(); const B = store.refresh();
  reqs[1].reject(new Error("network")); await B;
  reqs[0].resolve(okResp(snapText(100)).r); await A;
  assert.equal(store.status, "error");
  assert.equal(store.snap, null);
});

test("R1d onChange so e chamado pela chamada mais nova", async () => {
  let reqs = stubFetch(); let { store, calls } = newStore();
  let A = store.refresh(); let B = store.refresh();
  reqs[1].resolve(okResp(snapText(200)).r); await B;
  reqs[0].resolve(okResp(snapText(100)).r); await A;
  assert.equal(calls(), 1, "cenario resolve/resolve");
  reqs = stubFetch(); ({ store, calls } = newStore());
  A = store.refresh(); B = store.refresh();
  reqs[1].resolve(okResp(snapText(200)).r); await B;
  reqs[0].reject(new Error("x")); await A;
  assert.equal(calls(), 1, "cenario resolve/rejeita");
  reqs = stubFetch(); ({ store, calls } = newStore());
  A = store.refresh(); B = store.refresh();
  reqs[0].resolve(okResp(snapText(100)).r); await A;
  assert.equal(calls(), 0, "antigo resolvendo primeiro (descartado) nao notifica");
  reqs[1].resolve(okResp(snapText(200)).r); await B;
  assert.equal(calls(), 1);
});

test("R1e timeout continua valendo (status error, sem timer pendente)", async () => {
  const reqs = stubFetch(); const { store } = newStore();
  const realSet = globalThis.setTimeout, realClear = globalThis.clearTimeout;
  const pending = new Set();
  globalThis.setTimeout = (fn, ms, ...a) => {
    const d = (typeof ms === "number" && ms >= 10000) ? 50 : ms;
    const t = realSet(() => { pending.delete(t); fn(...a); }, d);
    if (typeof ms === "number" && ms >= 10000) pending.add(t);
    return t;
  };
  globalThis.clearTimeout = (t) => { pending.delete(t); return realClear(t); };
  try {
    await store.refresh();
    assert.equal(reqs.length, 1);
    assert.equal(reqs[0].signal.aborted, true);
    assert.equal(store.status, "error");
    assert.equal(store.snap, null);
    assert.equal(pending.size, 0, "timer pendente");
  } finally {
    globalThis.setTimeout = realSet; globalThis.clearTimeout = realClear;
  }
});

test("R3a parseSnapshot rejeita > 20000 bytes mesmo com length ~7000 (multibyte)", () => {
  const text = snapText(1, { pad: "€".repeat(7000) });
  assert.ok(text.length < 20000 && Buffer.byteLength(text) > 20000);
  assert.equal(parseSnapshot(text), null);
});

test("R3b parseSnapshot aceita ASCII de ~19900 bytes", () => {
  const base = Buffer.byteLength(snapText(1, { pad: "" }));
  const text = snapText(1, { pad: "a".repeat(19900 - base) });
  assert.ok(Buffer.byteLength(text) >= 19890 && Buffer.byteLength(text) <= 20000);
  assert.notEqual(parseSnapshot(text), null);
});

test("R3c content-length 25000 -> invalid (nao error) e sem ler o corpo", async () => {
  const reqs = stubFetch(); const { store } = newStore();
  const { r, state } = okResp(snapText(5), { "content-length": "25000" });
  const p = store.refresh(); reqs[0].resolve(r); await p;
  assert.equal(store.status, "invalid");
  assert.equal(state.textCalls, 0);
});

test("R3d content-length 'abc', ausente e '0' com corpo valido -> ok", async () => {
  for (const cl of ["abc", undefined, "0"]) {
    const reqs = stubFetch(); const { store } = newStore();
    const { r } = okResp(snapText(5), cl === undefined ? {} : { "content-length": cl });
    const p = store.refresh(); reqs[0].resolve(r); await p;
    assert.equal(store.status, "ok", "content-length=" + cl);
  }
});

test("R3e resolveBanner com status invalid menciona 'inválid'", () => {
  const b = resolveBanner({ status: "invalid", snap: null }, 1000);
  assert.ok(b && /inv[aá]lid/i.test(b.text), JSON.stringify(b));
});

let failed = 0;
for (const [name, fn] of tests) {
  try { await fn(); console.log("PASS " + name); }
  catch (e) { failed = 1; console.log("FAIL " + name + "\n  " + (e && e.message)); }
  finally { globalThis.fetch = realFetch; }
  await tick();
}
process.exit(failed);
