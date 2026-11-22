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
const DOCS = path.join(ROOT, "docs");
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

async function scenario(name, { body, status = 200, abort = false, ctx = {} }, fn) {
  const injectedNetworkFailure = abort || status >= 400;   // the browser itself logs "Failed to load resource" for these
  const context = await browser.newContext(ctx);
  const page = await context.newPage();
  const problems = [], hosts = new Set();
  page.on("console", (m) => { if ((m.type() === "error" || m.type() === "warning") && !(injectedNetworkFailure && /Failed to load resource/.test(m.text()))) problems.push("console: " + m.text()); });
  page.on("pageerror", (e) => problems.push("pageerror: " + e.message));
  page.on("request", (r) => { try { hosts.add(new URL(r.url()).host); } catch { /* ignore */ } });
  await page.route(DATA, (route) => abort ? route.abort() : route.fulfill({ status, headers: { "access-control-allow-origin": "*", "content-type": "text/plain" }, body: body ?? "" }));
  await page.goto(BASE);
  await page.waitForSelector("body[data-ready='1']");
  await page.waitForTimeout(250);
  const states = async () => Object.fromEntries(await page.$$eval("#sr li", (els) => els.map((e) => [e.dataset.agent, e.dataset.state + "/" + e.dataset.reason])));
  const banner = async () => (await page.$eval("#banner", (e) => (e.hidden ? "" : e.textContent)));
  await fn({ page, states, banner, name });
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
  check(`${name}: animando a ~8 fps (2s => 10..22 quadros)`, f1 - f0 >= 10 && f1 - f0 <= 22, String(f1 - f0));
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
