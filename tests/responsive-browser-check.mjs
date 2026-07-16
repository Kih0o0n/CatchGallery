import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const fixture = new URL("./responsive-fixture.html", import.meta.url).href;
const port = 9331;
const profile = mkdtempSync(join(tmpdir(), "catchgallery-responsive-"));
const process = spawn(chrome, ["--headless=new", "--disable-gpu", "--no-first-run", "--disable-background-networking", "--allow-file-access-from-files", `--remote-debugging-port=${port}`, "--remote-allow-origins=*", `--user-data-dir=${profile}`, "about:blank"], { stdio: "ignore" });
const delay = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

async function target() {
  for (let attempt = 0; attempt < 50; attempt++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      const browserPage = list.find(item => item.type === "page" && item.url === "about:blank");
      if (browserPage?.webSocketDebuggerUrl) return browserPage;
    } catch {}
    await delay(100);
  }
  throw new Error("Chrome debugging target did not start");
}

const page = await target();
const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
let commandId = 0;
const pending = new Map();
socket.addEventListener("message", event => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message)); else resolve(message.result);
  }
});
function command(method, params = {}) {
  const id = ++commandId;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}
await command("Page.enable");
await command("Runtime.enable");

async function render(width, height, query) {
  await command("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false });
  await command("Page.navigate", { url: `${fixture}?${query}` });
  for (let attempt = 0; attempt < 100; attempt++) {
    const result = await command("Runtime.evaluate", { expression: "document.readyState === 'complete' && document.body.dataset.metrics ? decodeURIComponent(document.body.dataset.metrics) : null", returnByValue: true });
    if (result.result.value) return JSON.parse(result.result.value);
    await delay(20);
  }
  const debug = await command("Runtime.evaluate", { expression: "JSON.stringify({href:location.href,ready:document.readyState,body:document.body?.dataset?.metrics || null,title:document.title})", returnByValue: true });
  throw new Error(`fixture did not render for ${width}x${height} ${query}: ${debug.result.value}`);
}

const viewports = [[320,568],[360,640],[375,667],[390,844],[412,915],[568,320],[667,375],[844,390],[768,1024],[820,1180],[1024,768],[1024,600],[1280,720],[1366,768],[1920,1080]];
const results = [];
try {
  for (const [width, height] of viewports) {
    const metrics = await render(width, height, "view=draw");
    assert.deepEqual(metrics.viewport, [width, height], `${width}x${height} viewport must be exact`);
    assert.equal(metrics.horizontalOverflow, false, `${width}x${height} must not overflow horizontally`);
    assert.ok(Math.abs(metrics.canvas[0] - metrics.canvas[1]) <= 1, `${width}x${height} canvas must remain square`);
    assert.ok(metrics.canvas[0] <= 720, `${width}x${height} canvas must not exceed 720 CSS px`);
    if (!metrics.saveVisible) assert.equal(metrics.documentScroll, true, `${width}x${height} must scroll when save is below the fold`);
    results.push({ viewport: `${width}x${height}`, ...metrics });
  }
  for (const [width, expected] of [[320, 3], [390, 3], [768, 4], [1024, 4], [1920, 5]]) {
    assert.equal((await render(width, 900, "view=gallery")).columns, expected, `${width}px gallery columns`);
  }
  for (const [width, height] of [[360,640],[375,667],[390,844],[412,915],[1024,768],[1280,720]]) {
    const normal = await render(width, height, "view=draw");
    assert.equal(normal.saveVisible, true, `${width}x${height} normal drawing view should expose save: ${JSON.stringify(normal)}`);
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
  await command("Browser.close").catch(() => {});
  socket.close();
  await delay(300);
  if (!process.killed) process.kill();
  rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
}

console.log(JSON.stringify(results));
console.log("Responsive browser checks passed.");
