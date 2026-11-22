// Frontend + privacy tests. Run:  node tests/run.mjs   (needs Playwright + Chromium available)
// The public JSON is simulated by intercepting the network, so nothing real is read or written.
import { createRequire } from "node:module";
import http from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DOCS = process.env.AAO_DOCS || path.join(ROOT, "docs");   // AAO_DOCS lets the negative control run against a modified copy
const DATA = "https://raw.githubusercontent.com/ThiagoSGRDev/ai-agent-office-cloud/data/status.json";
const SHOTS = process.env.SHOT_DIR || fs.mkdtempSync(path.join(os.tmpdir(), "aao-shots-"));
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css" };

const server = http.createServer((req, res) => {
  const p = path.join(DOCS, req.url === "/" ? "index.html" : decodeURIComponent(req.url.split("?")[0]));
  if (!p.startsWith(DOCS) || !fs.existsSync(p)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "content-type": TYPES[path.extname(p)] || "application/octet-stream" });
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const BASE = `http://127.0.0.1:${server.address().port}/`;

const results = [];
const check = (name, cond, extra = "") => results.push({ name, ok: !!cond, extra });
const now = () => Math.floor(Date.now() / 1000);
const snap = (agents, over = {}) => JSON.stringify({ schema: 1, generated_at: now(), agents: Object.fromEntries(Object.entries(agents).map(([k, [state, age]]) => [k, { state, updated_at: now() - age, last_event: "Stop" }])), ...over });

const browser = await chromium.launch();

const SEED_SCRIPT = (seed) => `(() => { let s = ${seed}; Math.random = () => { s |= 0; s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; })();`;

async function scenario(name, { body, status = 200, abort = false, ctx = {}, clock = false, seed = 0, netErr = false }, fn) {
  if (process.env.ONLY && !process.env.ONLY.split(",").some((p) => name.startsWith(p))) return;   // ONLY=W4,W10 reruns a subset
  const injectedNetworkFailure = abort || status >= 400 || netErr;   // the browser itself logs "Failed to load resource" for these
  const context = await browser.newContext(ctx);
  const page = await context.newPage();
  const problems = [], hosts = new Set();
  page.on("console", (m) => { if ((m.type() === "error" || m.type() === "warning") && !(injectedNetworkFailure && /Failed to load resource/.test(m.text()))) problems.push("console: " + m.text()); });
  page.on("pageerror", (e) => problems.push("pageerror: " + e.message));
  page.on("request", (r) => { try { hosts.add(new URL(r.url()).host); } catch { /* ignore */ } });
  const ref = { body };
  if (seed) await page.addInitScript(SEED_SCRIPT(seed));
  if (clock) await page.clock.install({ time: Date.now() });
  await page.route(DATA, (route) => abort ? route.abort() : route.fulfill({ status, headers: { "access-control-allow-origin": "*", "content-type": "text/plain" }, body: (typeof ref.body === "function" ? ref.body() : ref.body) ?? "" }));
  await page.goto(BASE);
  await page.waitForSelector("body[data-ready='1']");
  await page.waitForTimeout(250);
  const states = async () => Object.fromEntries(await page.$$eval("#sr li", (els) => els.map((e) => [e.dataset.agent, e.dataset.state + "/" + e.dataset.reason])));
  const banner = async () => (await page.$eval("#banner", (e) => (e.hidden ? "" : e.textContent)));
  const modes = async () => page.$$eval("#sr li", (els) => Object.fromEntries(els.map((e) => [e.dataset.agent, { mode: e.dataset.mode, x: +e.dataset.x, y: +e.dataset.y, plan: e.dataset.plan, pose: e.dataset.pose }])));
  const frames = () => page.$eval("#office", (c) => Number(c.dataset.frames));
  // advance the fake clock in 500 ms steps, sampling the scene each step
  const run = async (ms, onSample) => { for (let t = 0; t < ms; t += 500) { await page.clock.runFor(500); const m = await modes(); if (onSample) onSample(m, t + 500); } };
  const poll = async (newBody) => { if (newBody !== undefined) ref.body = newBody; await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange"))); await page.waitForTimeout(120); await page.clock.runFor(700); };
  await fn({ page, states, banner, name, modes, frames, run, poll, ref });
  check(`${name}: sem erros de console/JS`, problems.length === 0, problems.join(" | "));
  check(`${name}: so contata origem + raw.githubusercontent.com`, [...hosts].every((h) => h.startsWith("127.0.0.1") || h === "raw.githubusercontent.com"), [...hosts].join(","));
  await context.close();
}

const stateIs = (s, id, v) => s[id] === v;

// ---- data / stale-state rules ------------------------------------------------------------------
await scenario("S1 dado fresco", { body: snap({ alex: ["idle", 10], lucas: ["working", 20], sofia: ["completed", 5] }) }, async ({ states, banner, name }) => {
  const s = await states();
  check(`${name}: alex idle`, stateIs(s, "alex", "idle/ok"));
  check(`${name}: lucas working`, stateIs(s, "lucas", "working/ok"));
  check(`${name}: sofia completed`, stateIs(s, "sofia", "completed/ok"));
  check(`${name}: 5 agentes em espera`, ["arthur", "noah", "maya", "ethan", "olivia"].every((id) => stateIs(s, id, "standby/em-espera")));
  check(`${name}: sem faixa de aviso`, (await banner()) === "");
});
await scenario("S2 working antigo expira", { body: snap({ alex: ["idle", 600], lucas: ["working", 600], sofia: ["blocked", 600] }, { generated_at: now() - 30 }) }, async ({ states, name }) => {
  const s = await states();
  check(`${name}: working 10min => desconhecido`, stateIs(s, "lucas", "unknown/dado-antigo"));
  check(`${name}: blocked 10min => desconhecido`, stateIs(s, "sofia", "unknown/dado-antigo"));
  check(`${name}: idle 10min permanece idle`, stateIs(s, "alex", "idle/ok"));
});
await scenario("S3 tudo > 30 min", { body: snap({ alex: ["idle", 2400], lucas: ["working", 2400], sofia: ["completed", 2400] }, { generated_at: now() - 2400 }) }, async ({ states, banner, name }) => {
  const s = await states();
  check(`${name}: tudo desconhecido`, ["alex", "lucas", "sofia"].every((id) => s[id].startsWith("unknown/dado-antigo")), JSON.stringify(s));
  check(`${name}: faixa "Sem dados recentes"`, (await banner()).includes("Sem dados recentes"), await banner());
});
await scenario("S0 faixa de aviso não muda o tamanho do mapa", { body: snap({ alex: ["idle", 10] }), netErr: true, ctx: { viewport: { width: 1280, height: 800 } } }, async ({ page, name }) => {
  const scale = () => page.$eval("#world", (e) => e.dataset.scale);
  const before = await scale();
  await page.route("https://raw.githubusercontent.com/**", (r) => r.abort());
  await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange"))); await page.waitForTimeout(400);
  check(`${name}: faixa de erro apareceu`, await page.$eval("#banner", (e) => !e.hidden));
  check(`${name}: escala do mapa inalterada (${before})`, (await scale()) === before, `${before} -> ${await scale()}`);
});
await scenario("S4 falha de rede", { abort: true }, async ({ states, banner, name }) => {
  const s = await states();
  check(`${name}: todos desconhecidos`, Object.values(s).every((v) => v.startsWith("unknown/")), JSON.stringify(s));
  check(`${name}: faixa de erro`, (await banner()).includes("Sem conexão"));
});
await scenario("S5 HTTP 500", { status: 500, body: "boom" }, async ({ states, banner, name }) => {
  check(`${name}: todos desconhecidos`, Object.values(await states()).every((v) => v.startsWith("unknown/")));
  check(`${name}: faixa de erro`, (await banner()).includes("Sem conexão"));
});
await scenario("S6 JSON invalido", { body: "not json {{{" }, async ({ states, banner, name }) => {
  check(`${name}: todos desconhecidos`, Object.values(await states()).every((v) => v.startsWith("unknown/")));
  check(`${name}: faixa "Dados inválidos"`, (await banner()).includes("Dados inválidos"));
});
await scenario("S7 schema errado", { body: snap({ lucas: ["working", 5] }, { schema: 2 }) }, async ({ states, banner, name }) => {
  check(`${name}: todos desconhecidos`, Object.values(await states()).every((v) => v.startsWith("unknown/")));
  check(`${name}: faixa "Dados inválidos"`, (await banner()).includes("Dados inválidos"));
});
await scenario("S8 payload grande", { body: JSON.stringify({ schema: 1, generated_at: now(), agents: {}, pad: "x".repeat(30000) }) }, async ({ states, name }) => {
  check(`${name}: recusado (todos desconhecidos)`, Object.values(await states()).every((v) => v.startsWith("unknown/")));
});
await scenario("S9 timestamp no futuro", { body: snap({ alex: ["idle", -300], lucas: ["working", -300] }, { generated_at: now() + 300 }) }, async ({ states, banner, name }) => {
  const s = await states();
  check(`${name}: working futuro => desconhecido`, stateIs(s, "lucas", "unknown/relogio"), JSON.stringify(s));
  check(`${name}: faixa de relógio`, (await banner()).includes("relógio"));
});
await scenario("S10 estado inesperado + injecao", { body: JSON.stringify({ schema: 1, generated_at: now(), agents: { lucas: { state: "hacking", updated_at: now() }, alex: { state: "<script>window.__pwned=1</script>", updated_at: now() }, "<img src=x onerror=window.__pwned=1>": { state: "working", updated_at: now() } } }) }, async ({ page, states, name }) => {
  const s = await states();
  check(`${name}: estado desconhecido vira unknown`, stateIs(s, "lucas", "unknown/dado-invalido") && stateIs(s, "alex", "unknown/dado-invalido"), JSON.stringify(s));
  check(`${name}: nenhum script/imagem injetado`, (await page.evaluate(() => window.__pwned === undefined && document.querySelectorAll("#sr img, #sr script, #banner img").length === 0)));
});
await scenario("S11 completed antigo permanece", { body: snap({ sofia: ["completed", 1500] }) }, async ({ states, name }) => {
  check(`${name}: completed 25min permanece (com idade)`, stateIs(await states(), "sofia", "completed/ok"));
});

// ---- layout / mobile / controls --------------------------------------------------------------
const fresh = snap({ alex: ["idle", 10], lucas: ["working", 20], sofia: ["completed", 40] });
for (const [label, ctx, expectLayout] of [
  ["M1 celular 390x844", { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true }, "portrait"],
  ["M2 celular pequeno 320x568", { viewport: { width: 320, height: 568 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, "portrait"],
  ["M3 celular deitado 844x390", { viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, "landscape"],
  ["D1 desktop 1280x800", { viewport: { width: 1280, height: 800 } }, "landscape"],
  ["D2 tablet 1024x768", { viewport: { width: 1024, height: 768 } }, "landscape"],
]) {
  await scenario(label, { body: fresh, ctx }, async ({ page, name }) => {
    check(`${name}: layout ${expectLayout}`, (await page.$eval("#office", (e) => e.dataset.layout)) === expectLayout);
    check(`${name}: sem rolagem horizontal`, await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
    const colors = await page.$eval("#office", (c) => { const d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data; const s = new Set(); for (let i = 0; i < d.length; i += 4 * 97) s.add((d[i] << 16) | (d[i + 1] << 8) | d[i + 2]); return s.size; });
    check(`${name}: canvas desenhado (cores > 20)`, colors > 20, String(colors));
    const small = await page.$$eval("#tools button", (bs) => bs.filter((b) => b.getBoundingClientRect().height < 44 || b.getBoundingClientRect().width < 44).map((b) => b.textContent));
    check(`${name}: botões >= 44px`, small.length === 0, small.join(","));
    await page.screenshot({ path: path.join(SHOTS, label.split(" ")[0] + ".png") });
  });
}

await scenario("C1 controles e animação", { body: fresh, ctx: { viewport: { width: 1280, height: 800 } } }, async ({ page, name }) => {
  const frames = () => page.$eval("#office", (c) => Number(c.dataset.frames));
  const f0 = await frames(); await page.waitForTimeout(2000); const f1 = await frames();
  check(`${name}: animando a ~12 fps (2s => 18..30 quadros)`, f1 - f0 >= 18 && f1 - f0 <= 30, String(f1 - f0));
  await page.click("#btn-pause"); await page.waitForTimeout(300);
  const p0 = await frames(); await page.waitForTimeout(1000); const p1 = await frames();
  check(`${name}: pausar para a animação`, p1 === p0, `${p0}->${p1}`);
  check(`${name}: pausa não interrompe coleta de dados (botão alterna)`, (await page.$eval("#btn-pause", (b) => b.textContent)) === "Retomar");
  await page.click("#btn-pause"); await page.waitForTimeout(1000);
  check(`${name}: retomar volta a animar`, (await frames()) > p1);
  await page.click("#btn-zoom-in"); check(`${name}: zoom +`, (await page.$eval("#office", (c) => c.dataset.zoom)) === "1");
  await page.click("#btn-zoom-out"); check(`${name}: zoom −`, (await page.$eval("#office", (c) => c.dataset.zoom)) === "0");
  await page.mouse.move(640, 400); await page.mouse.wheel(0, -100); await page.waitForTimeout(150);
  check(`${name}: zoom pela roda`, (await page.$eval("#office", (c) => c.dataset.zoom)) === "1");
  await page.click("#btn-fit"); check(`${name}: ajustar`, (await page.$eval("#office", (c) => c.dataset.zoom)) === "0");
});
await scenario("C2 prefers-reduced-motion", { body: fresh, ctx: { viewport: { width: 1280, height: 800 }, reducedMotion: "reduce" } }, async ({ page, name }) => {
  const frames = () => page.$eval("#office", (c) => Number(c.dataset.frames));
  const a = await frames(); await page.waitForTimeout(1200); const b = await frames();
  check(`${name}: sem animação contínua`, a === b, `${a}->${b}`);
  check(`${name}: botão reflete preferência`, (await page.$eval("#btn-reduce", (e) => e.getAttribute("aria-pressed"))) === "true");
});


// ---- movement: decorative layer must never contradict the evidence -------------------------------------
const fresh3 = (a, l, so, age = 20) => snap({ alex: [a, age], lucas: [l, age], sofia: [so, age] });
const bodyWith = (o, over = {}) => JSON.stringify({ schema: 1, generated_at: now(), agents: Object.fromEntries(Object.entries(o).map(([k, [st, age, ev]]) => [k, { state: st, updated_at: now() - age, last_event: ev || "Stop" }])), ...over });
const ACTIVE3 = ["alex", "lucas", "sofia"];

await scenario("W1 trabalhando/bloqueado nunca saem da estação", { body: bodyWith({ alex: ["working", 10], lucas: ["blocked", 10], sofia: ["working", 10] }), clock: true, seed: 11, ctx: { viewport: { width: 1280, height: 800 } } }, async ({ run, modes, name }) => {
  let moved = 0; await run(200000, (m) => { for (const id of ACTIVE3) if (m[id].mode !== "seated") moved++; });
  check(`${name}: 200 s sem nenhum deslocamento`, moved === 0, String(moved));
  const m = await modes(); check(`${name}: 5 agentes em espera continuam sem movimento`, ["arthur", "noah", "maya", "ethan", "olivia"].every((id) => m[id].mode === "seated"));
});
await scenario("W2 desconhecido/obsoleto fica congelado e o laço dorme", { body: bodyWith({ alex: ["idle", 2400], lucas: ["working", 2400], sofia: ["completed", 2400] }, { generated_at: now() - 2400 }), clock: true, seed: 12 }, async ({ run, frames, name }) => {
  await run(2000); const f0 = await frames(); let moved = 0;
  await run(60000, (m) => { for (const id of ACTIVE3) if (m[id].mode !== "seated") moved++; });
  const f1 = await frames();
  check(`${name}: ninguém se move`, moved === 0);
  check(`${name}: sem repintura (0 quadros novos em 60 s)`, f1 - f0 <= 1, String(f1 - f0));
});
await scenario("W3 movimento reduzido: ocioso não passeia", { body: bodyWith({ alex: ["idle", 10], lucas: ["idle", 10], sofia: ["idle", 10] }), clock: true, seed: 13, ctx: { reducedMotion: "reduce" } }, async ({ run, frames, name }) => {
  const f0 = await frames(); let moved = 0;
  await run(300000, (m) => { for (const id of ACTIVE3) if (m[id].mode !== "seated") moved++; });
  check(`${name}: 300 s sem deslocamento`, moved === 0);
  check(`${name}: sem animação contínua (só repinta ao chegar dado: <= 8 em 5 min)`, (await frames()) - f0 <= 8);
});
for (const seed of [21, 22, 23]) {
  await scenario(`W4 passeios de descanso (semente ${seed})`, { body: bodyWith({ alex: ["idle", 10], lucas: ["idle", 10], sofia: ["idle", 10] }), clock: true, seed }, async ({ run, name }) => {
    const seqs = { alex: [], lucas: [], sofia: [] }, cur = {}, away = {}, longest = { alex: 0, lucas: 0, sofia: 0 }; let maxWalkers = 0;
    await run(1500000, (m) => {
      let w = 0;
      for (const id of ACTIVE3) {
        const v = m[id];
        if (v.mode === "walking" && v.plan === "deco") w++;
        if (v.mode === "seated") { if (cur[id] !== undefined) { if (cur[id]) seqs[id].push(cur[id]); cur[id] = undefined; } away[id] = 0; }
        else { if (cur[id] === undefined) cur[id] = ""; if (!cur[id] && v.mode === "doing" && v.pose) cur[id] = v.pose; away[id] = (away[id] || 0) + 500; longest[id] = Math.max(longest[id], away[id]); }
      }
      maxWalkers = Math.max(maxWalkers, w);
    });
    const all = [].concat(...Object.values(seqs));
    check(`${name}: houve passeios (>= 3 e <= 24 em 25 min, 3 agentes ociosos)`, all.length >= 3 && all.length <= 24, JSON.stringify(seqs));
    check(`${name}: no máximo 2 caminhando ao mesmo tempo`, maxWalkers <= 2, String(maxWalkers));
    check(`${name}: variedade (>= 3 atividades distintas)`, new Set(all).size >= 3, JSON.stringify([...new Set(all)]));
    const repeats = Object.values(seqs).some((q) => q.some((p, i) => i && p === q[i - 1]));
    check(`${name}: sem repetir a mesma atividade em seguida`, !repeats, JSON.stringify(seqs));
    check(`${name}: identidade — Lucas não faz ronda/quadro; Sofia não toma café; Alex não rega nem senta`, !seqs.lucas.some((p) => p === "look" || p === "point") && !seqs.sofia.includes("mug") && !seqs.alex.some((p) => p === "water" || p === "sit"), JSON.stringify(seqs));
    check(`${name}: nenhum passeio passa de 90 s`, Math.max(...Object.values(longest)) <= 90000, JSON.stringify(longest));
  });
}
await scenario("W5 a evidência manda: ocioso que passeia volta à mesa quando o dado vira working", { body: bodyWith({ alex: ["idle", 10], lucas: ["idle", 10], sofia: ["idle", 10] }), clock: true, seed: 31 }, async ({ run, modes, poll, name }) => {
  let who = null; await run(60000, (m) => { if (!who) who = ACTIVE3.find((id) => m[id].mode === "walking") || null; });
  check(`${name}: alguém saiu para passear`, !!who);
  if (who) {
    await poll(bodyWith({ alex: ["idle", 5], lucas: ["idle", 5], sofia: ["idle", 5], [who]: ["working", 1, "PreToolUse"] }));
    const m = await modes(); check(`${name}: ${who} sentado de imediato`, m[who].mode === "seated" && m[who].plan === "", JSON.stringify(m[who]));
    let moved = 0; await run(60000, (mm) => { if (mm[who].mode !== "seated") moved++; });
    check(`${name}: e continua na mesa enquanto trabalha`, moved === 0, String(moved));
  }
});
await scenario("W6 nova conclusão: sem replay no carregamento; comemora e entrega ao Alex", { body: bodyWith({ alex: ["working", 10, "PreToolUse"], lucas: ["working", 10, "PreToolUse"], sofia: ["completed", 30, "SubagentStop"] }), clock: true, seed: 41 }, async ({ run, modes, poll, name }) => {
  let replay = 0; await run(40000, (m) => { if (m.sofia.plan === "react" || m.sofia.mode !== "seated") replay++; });
  check(`${name}: conclusão já existente no carregamento NÃO é comemorada`, replay === 0, String(replay));
  await poll(bodyWith({ alex: ["working", 10, "PreToolUse"], lucas: ["working", 10, "PreToolUse"], sofia: ["completed", 3, "SubagentStop"] }));
  let react = false, paper = false, talk = false, lucasMoved = 0, alexMoved = 0;
  await run(30000, (m) => { if (m.sofia.plan === "react") react = true; if (m.sofia.pose === "paper" && m.sofia.mode === "doing") paper = true; if (Object.values(m).some((v) => v.pose === "talk")) talk = true; if (m.lucas.mode !== "seated") lucasMoved++; if (m.alex.mode !== "seated") alexMoved++; });
  const m = await modes();
  check(`${name}: a nova transição dispara a reação`, react);
  check(`${name}: entrega o relatório na mesa do Alex`, paper);
  check(`${name}: e volta à mesa`, m.sofia.mode === "seated" && m.sofia.plan === "");
  check(`${name}: conclusão isolada NÃO vira reunião`, !talk);
  check(`${name}: quem trabalha (Alex, Lucas) não se mexe`, lucasMoved === 0 && alexMoved === 0, `${lucasMoved}/${alexMoved}`);
});
await scenario("W7 reunião só no fim real da execução (e com cooldown)", { body: bodyWith({ alex: ["working", 10, "PreToolUse"], lucas: ["working", 10, "PreToolUse"], sofia: ["working", 10, "PreToolUse"] }), clock: true, seed: 51 }, async ({ run, poll, name }) => {
  await run(20000);
  await poll(bodyWith({ alex: ["idle", 2, "Stop"], lucas: ["completed", 6, "SubagentStop"], sofia: ["completed", 9, "SubagentStop"] }));
  const talkers = new Set(); let pointer = false, away = 0;
  await run(60000, (m) => { for (const id of ACTIVE3) { if (m[id].pose === "talk" && m[id].mode === "doing") talkers.add(id); if (id === "alex" && m[id].pose === "point" && m[id].mode === "doing") pointer = true; } });
  check(`${name}: Lucas e Sofia conversam na sala de reunião`, talkers.has("lucas") && talkers.has("sofia"), JSON.stringify([...talkers]));
  check(`${name}: Alex conduz`, pointer);
  await run(30000, (m) => { for (const id of ACTIVE3) if (m[id].mode !== "seated") away++; });
  check(`${name}: todos voltam às mesas (e ninguém sai de novo logo em seguida)`, away === 0, String(away));
  await poll(bodyWith({ alex: ["working", 5, "PreToolUse"], lucas: ["working", 5, "PreToolUse"], sofia: ["working", 5, "PreToolUse"] })); await run(5000);
  await poll(bodyWith({ alex: ["idle", 2, "Stop"], lucas: ["completed", 6, "SubagentStop"], sofia: ["completed", 9, "SubagentStop"] }));
  let again = false; await run(40000, (m) => { if (Object.values(m).some((v) => v.pose === "talk")) again = true; });
  check(`${name}: segunda reunião em < 5 min é bloqueada (cooldown)`, !again);
});
await scenario("W8 sem reunião se alguém ainda trabalha", { body: bodyWith({ alex: ["working", 10, "PreToolUse"], lucas: ["working", 10, "PreToolUse"], sofia: ["working", 10, "PreToolUse"] }), clock: true, seed: 61 }, async ({ run, poll, name }) => {
  await run(10000);
  await poll(bodyWith({ alex: ["idle", 2, "Stop"], lucas: ["completed", 6, "SubagentStop"], sofia: ["working", 3, "PreToolUse"] }));
  let talk = false, sofiaMoved = 0; await run(40000, (m) => { if (Object.values(m).some((v) => v.pose === "talk")) talk = true; if (m.sofia.mode !== "seated") sofiaMoved++; });
  check(`${name}: nenhuma reunião`, !talk);
  check(`${name}: Sofia (trabalhando) fica na mesa`, sofiaMoved === 0);
});
await scenario("W9 carga: trabalhando repinta ~12 fps, ocioso calmo muito menos", { body: bodyWith({ alex: ["working", 10, "PreToolUse"], lucas: ["working", 10, "PreToolUse"], sofia: ["working", 10, "PreToolUse"] }), clock: true, seed: 71 }, async ({ run, frames, name }) => {
  await run(2000); const a = await frames(); await run(10000); const b = await frames();
  check(`${name}: trabalhando: 10 s => ~100-140 quadros`, b - a >= 90 && b - a <= 150, String(b - a));
});
await scenario("W10 carga: ocioso (passeios + gestos) repinta bem menos que trabalhando", { body: bodyWith({ alex: ["idle", 10], lucas: ["idle", 10], sofia: ["idle", 10] }), clock: true, seed: 81 }, async ({ run, frames, name }) => {
  await run(2000); const a = await frames(); await run(300000); const b = await frames(); const fps = (b - a) / 300;
  console.log(`   [medição] ocioso: ${fps.toFixed(2)} quadros/s em média (trabalhando: ~12)`);
  check(`${name}: média <= 6 quadros/s`, fps <= 6, fps.toFixed(2));
});

// ---- pixel sharpness: nearest-neighbour scaling only (no interpolation) ------------------------------------------
// With integer scaling every map pixel becomes a block of >= 2 device pixels, so a pixel whose colour differs from BOTH
// horizontal (or vertical) neighbours can only come from resampling/blur.
async function isolatedRatio(page, buf) {
  return page.evaluate(async (b64) => {
    const bin = atob(b64), u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    const bmp = await createImageBitmap(new Blob([u8], { type: "image/png" })); const W = bmp.width, H = bmp.height;
    const c = new OffscreenCanvas(W, H), g = c.getContext("2d"); g.drawImage(bmp, 0, 0); const d = g.getImageData(0, 0, W, H).data;
    const same = (i, j) => d[i] === d[j] && d[i + 1] === d[j + 1] && d[i + 2] === d[j + 2];
    let h = 0, v = 0, n = 0;
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { const i = (y * W + x) * 4; n++; if (!same(i, i - 4) && !same(i, i + 4)) h++; if (!same(i, i - W * 4) && !same(i, i + W * 4)) v++; }
    return { h: (100 * h) / n, v: (100 * v) / n, w: W, hgt: H };
  }, buf.toString("base64"));
}
for (const [label, ctx] of [
  ["1281x721 dpr1", { viewport: { width: 1281, height: 721 }, deviceScaleFactor: 1 }],
  ["1367x769 dpr1.25", { viewport: { width: 1367, height: 769 }, deviceScaleFactor: 1.25 }],
  ["1281x721 dpr1.5", { viewport: { width: 1281, height: 721 }, deviceScaleFactor: 1.5 }],
  ["1280x720 dpr2", { viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2 }],
  ["celular 391x845 dpr2.75", { viewport: { width: 391, height: 845 }, deviceScaleFactor: 2.75, isMobile: true, hasTouch: true }],
  ["celular 390x844 dpr3", { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true }],
]) {
  await scenario(`N1 nitidez ${label}`, { body: fresh, ctx }, async ({ page, name }) => {
    await page.evaluate(() => { document.getElementById("labels").style.display = "none"; });         // text is DOM; only the pixel map is measured
    const worst = { h: 0, v: 0 };
    const measure = async () => { const r = await isolatedRatio(page, await page.locator("#stage").screenshot({ type: "png" })); worst.h = Math.max(worst.h, r.h); worst.v = Math.max(worst.v, r.v); };
    await page.waitForTimeout(300); await measure();                                                       // fitted
    await page.click("#btn-zoom-in"); await page.waitForTimeout(250); await measure();                    // zoomed
    const bb = await page.locator("#stage").boundingBox();
    await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await page.mouse.down(); await page.mouse.move(bb.x + bb.width / 2 + 7.3, bb.y + bb.height / 2 + 3.7, { steps: 3 }); await page.mouse.up();
    await page.waitForTimeout(250); await measure();                                                       // zoomed + dragged by a fractional distance
    check(`${name}: sem interpolação (pixels isolados H<=1% e V<=1%)`, worst.h <= 1 && worst.v <= 1, `H ${worst.h.toFixed(2)}% V ${worst.v.toFixed(2)}%`);
  });
}

server.close();
await browser.close();

// ---- privacy scan of repository files ------------------------------------------------------------
const bad = /ghp_[A-Za-z0-9]{10,}|github_pat_|sk-ant-|-----BEGIN [A-Z ]*PRIVATE KEY|AKIA[0-9A-Z]{12,}|\/home\/user|\/root\/|@gmail\.com/;
const files = [];
(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { if (["node_modules", ".git", "status", "sandbox", "tests"].includes(e.name)) continue; const p = path.join(d, e.name); e.isDirectory() ? walk(p) : files.push(p); } })(ROOT);
const leaks = files.filter((f) => bad.test(fs.readFileSync(f, "utf8")));
check("P1 varredura de segredos/dados pessoais nos arquivos publicáveis", leaks.length === 0, leaks.join(","));

const failed = results.filter((r) => !r.ok);
for (const r of results) console.log((r.ok ? "PASS " : "FAIL ") + r.name + (r.ok || !r.extra ? "" : "  <- " + r.extra));
console.log(`\n${results.length - failed.length}/${results.length} aprovados. Capturas: ${SHOTS}`);
process.exit(failed.length ? 1 : 0);
