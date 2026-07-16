import assert from "node:assert/strict";
import { execFileSync, spawn } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, join } from "node:path";
import { createServer } from "node:net";

const delay = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
const fixture = new URL("./responsive-fixture.html", import.meta.url).href;
const app = readFileSync(new URL("../app.js", import.meta.url), "utf8");

function readArrayConstant(name) {
  const marker = `const ${name} =`;
  const start = app.indexOf(marker);
  assert.notEqual(start, -1, `${name} must exist`);
  const arrayStart = app.indexOf("[", start + marker.length);
  let depth = 0;
  let quote = null;
  for (let index = arrayStart; index < app.length; index++) {
    const character = app[index];
    if (quote) {
      if (character === "\\") index++;
      else if (character === quote) quote = null;
    } else if (character === '"' || character === "'") quote = character;
    else if (character === "[") depth++;
    else if (character === "]" && --depth === 0) return Function(`return (${app.slice(arrayStart, index + 1)})`)();
  }
  throw new Error(`could not extract ${name}`);
}

function executableFromPath(names) {
  const command = process.platform === "win32" ? "where.exe" : "which";
  for (const name of names) {
    try {
      const found = execFileSync(command, [name], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] })
        .split(/\r?\n/).map(value => value.trim()).find(Boolean);
      if (found && existsSync(found)) return found;
    } catch {}
  }
  return null;
}

function findChrome() {
  const requested = [process.env.CHROME_PATH, process.env.GOOGLE_CHROME_BIN].filter(Boolean);
  for (const candidate of requested) if (existsSync(candidate)) return candidate;

  const platformCandidates = process.platform === "win32" ? [
    join(process.env.PROGRAMFILES || "C:\\Program Files", "Google", "Chrome", "Application", "chrome.exe"),
    join(process.env["PROGRAMFILES(X86)"] || "C:\\Program Files (x86)", "Google", "Chrome", "Application", "chrome.exe"),
    join(process.env.LOCALAPPDATA || "", "Google", "Chrome", "Application", "chrome.exe"),
    join(process.env.PROGRAMFILES || "C:\\Program Files", "Chromium", "Application", "chrome.exe")
  ] : process.platform === "darwin" ? [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium"
  ] : [
    "/usr/bin/google-chrome", "/usr/bin/google-chrome-stable", "/usr/bin/chromium", "/usr/bin/chromium-browser"
  ];
  for (const candidate of platformCandidates) if (candidate && existsSync(candidate)) return candidate;
  return executableFromPath(process.platform === "win32" ? ["chrome", "chromium"] : ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser"]);
}

const chrome = findChrome();
if (!chrome) {
  const message = `Responsive browser checks skipped: Chrome/Chromium was not found. Set CHROME_PATH or GOOGLE_CHROME_BIN (PATH separator: ${delimiter}).`;
  if (process.env.REQUIRE_RESPONSIVE_BROWSER_TEST === "1") throw new Error(message);
  console.log(message);
  process.exit(0);
}

const drawingColors = readArrayConstant("DRAWING_COLORS");
assert.equal(drawingColors.length, 15, "browser fixture must use the real 15 drawing colors");
const colorQuery = `colors=${encodeURIComponent(JSON.stringify(drawingColors))}`;
const profile = mkdtempSync(join(tmpdir(), "catchgallery-responsive-"));
let chromeProcess;
let socket;
let exited = false;
let spawnFailure = null;
let shuttingDown = false;

function withTimeout(promise, milliseconds, label) {
  let timer;
  return Promise.race([
    promise,
    new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(`${label} timed out after ${milliseconds}ms`)), milliseconds); })
  ]).finally(() => clearTimeout(timer));
}

async function reservePort() {
  const server = createServer();
  await new Promise((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve); });
  const port = server.address().port;
  await new Promise(resolve => server.close(resolve));
  return port;
}

async function pageTarget(port) {
  for (let attempt = 0; attempt < 100; attempt++) {
    if (spawnFailure) throw spawnFailure;
    if (exited) throw new Error("Chrome exited before exposing a page target");
    try {
      const response = await withTimeout(fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: "PUT" }), 1000, "DevTools target request");
      const page = await response.json();
      if (page?.webSocketDebuggerUrl) return page;
    } catch {}
    await delay(50);
  }
  throw new Error("Chrome debugging page target did not start");
}

let commandId = 0;
const pending = new Map();
function command(method, params = {}) {
  if (!socket || socket.readyState !== WebSocket.OPEN) return Promise.reject(new Error(`DevTools socket is not open for ${method}`));
  const id = ++commandId;
  const response = new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
  socket.send(JSON.stringify({ id, method, params }));
  return withTimeout(response, 5000, method)
    .finally(() => pending.delete(id));
}

async function render(width, height, query) {
  await command("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false });
  await command("Page.navigate", { url: `${fixture}?${query}&${colorQuery}` });
  for (let attempt = 0; attempt < 100; attempt++) {
    const result = await command("Runtime.evaluate", { expression: "document.readyState === 'complete' && document.body.dataset.metrics ? decodeURIComponent(document.body.dataset.metrics) : null", returnByValue: true });
    if (result.result.value) return JSON.parse(result.result.value);
    await delay(20);
  }
  throw new Error(`fixture did not render for ${width}x${height} ${query}`);
}

const viewports = [[320,568],[360,640],[375,667],[390,844],[412,915],[568,320],[667,375],[844,390],[768,1024],[820,1180],[1024,768],[1024,600],[1280,720],[1366,768],[1920,1080]];
const boundaryHeights = [619,620,621,622,699,700,701,702];
const results = [];
const boundaryResults = [];

try {
  const port = await reservePort();
  chromeProcess = spawn(chrome, ["--headless=new", "--disable-gpu", "--no-sandbox", "--no-first-run", "--disable-background-networking", "--allow-file-access-from-files", `--remote-debugging-port=${port}`, "--remote-allow-origins=*", `--user-data-dir=${profile}`, "about:blank"], { stdio: "ignore" });
  chromeProcess.once("error", error => { spawnFailure = new Error(`Chrome failed to start: ${error.message}`); });
  chromeProcess.once("exit", () => { exited = true; });
  const page = await withTimeout(pageTarget(port), 7000, "Chrome page target");
  socket = new WebSocket(page.webSocketDebuggerUrl);
  await withTimeout(new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", () => reject(new Error("DevTools WebSocket connection failed")), { once: true });
  }), 5000, "DevTools WebSocket connection");
  socket.addEventListener("message", event => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      if (message.error) reject(new Error(message.error.message)); else resolve(message.result);
    }
  });
  socket.addEventListener("close", () => {
    if (!shuttingDown) {
      spawnFailure = new Error("DevTools WebSocket closed unexpectedly");
    }
  });
  await command("Page.enable");
  await command("Runtime.enable");

  for (const [width, height] of viewports) {
    const metrics = await render(width, height, "view=draw");
    assert.deepEqual(metrics.viewport, [width, height], `${width}x${height} viewport must be exact`);
    assert.equal(metrics.colorCount, drawingColors.length, `${width}x${height} fixture color count`);
    assert.equal(metrics.horizontalOverflow, false, `${width}x${height} must not overflow horizontally`);
    assert.ok(Math.abs(metrics.canvas[0] - metrics.canvas[1]) <= 1, `${width}x${height} canvas must remain square`);
    assert.ok(metrics.canvas[0] <= 720, `${width}x${height} canvas must not exceed 720 CSS px`);
    if (!metrics.saveVisible) assert.equal(metrics.documentScroll, true, `${width}x${height} must scroll when save is below the fold`);
    results.push({ viewport: `${width}x${height}`, ...metrics });
  }
  for (const height of boundaryHeights) {
    const metrics = await render(360, height, "view=draw");
    assert.equal(metrics.horizontalOverflow, false, `360x${height} must not overflow horizontally`);
    assert.ok(Math.abs(metrics.canvas[0] - metrics.canvas[1]) <= 1, `360x${height} canvas must remain square`);
    assert.ok(metrics.canvas[0] <= 720, `360x${height} canvas must not exceed 720 CSS px`);
    boundaryResults.push({ height, canvas: metrics.canvas[0] });
  }
  for (let index = 1; index < boundaryResults.length; index++) {
    const delta = boundaryResults[index].canvas - boundaryResults[index - 1].canvas;
    const heightDelta = boundaryResults[index].height - boundaryResults[index - 1].height;
    assert.ok(delta >= 0, `canvas must not shrink as height increases: ${JSON.stringify(boundaryResults)}`);
    assert.ok(delta <= heightDelta + 1, `canvas growth may not exceed viewport growth plus 1 CSS px rounding: ${JSON.stringify(boundaryResults)}`);
  }
  for (const [width, expected] of [[320, 3], [390, 3], [768, 4], [1024, 4], [1920, 5]]) {
    assert.equal((await render(width, 900, "view=gallery")).columns, expected, `${width}px gallery columns`);
  }
  for (const [width, height] of [[360,640],[375,667],[390,844],[412,915],[1024,768],[1280,720]]) {
    assert.equal((await render(width, height, "view=draw")).saveVisible, true, `${width}x${height} normal drawing view should expose save`);
  }
  const longWord = await render(360, 640, "view=draw&long=1");
  assert.equal(longWord.horizontalOverflow, false, "long word must not overflow horizontally");
  if (!longWord.saveVisible) assert.equal(longWord.documentScroll, true, "long word must fall back to document scrolling");
  assert.equal((await render(1024, 768, "view=detail")).columns, 2, "wide gallery detail must use two columns");
  const customWord = await render(390, 844, "view=draw&custom=1");
  assert.equal(customWord.horizontalOverflow, false, "custom word form must not overflow horizontally");
  assert.equal(customWord.documentScroll, true, "custom word form must enable document scrolling");
  const modal = (await render(568, 320, "view=draw&modal=1")).modal;
  assert.ok(modal.clientHeight < modal.scrollHeight, "short-screen modal must scroll internally");
} finally {
  shuttingDown = true;
  if (socket && socket.readyState < WebSocket.CLOSING) socket.close();
  if (chromeProcess && !exited && !chromeProcess.killed) chromeProcess.kill();
  await delay(200);
  rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
}

console.log(`Responsive browser: ${chrome}`);
console.log(JSON.stringify(results));
console.log(`Boundary tolerance: nondecreasing; 1px-adjacent heights may grow by at most 2 CSS px including rounding. ${JSON.stringify(boundaryResults)}`);
console.log("Responsive browser checks passed.");
