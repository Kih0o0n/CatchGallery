import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const app = readFileSync(new URL("../app.js", import.meta.url), "utf8");
const styles = readFileSync(new URL("../styles.css", import.meta.url), "utf8");
const setup = app.match(/function setupBrushSizeControl[\s\S]*?(?=function setupCanvas)/)?.[0];
assert.ok(setup, "brush size setup source must be readable");

const candidates = process.platform === "win32" ? [
  process.env.CHROME_PATH, process.env.GOOGLE_CHROME_BIN,
  join(process.env.PROGRAMFILES || "C:\\Program Files", "Google", "Chrome", "Application", "chrome.exe"),
  join(process.env["PROGRAMFILES(X86)"] || "C:\\Program Files (x86)", "Google", "Chrome", "Application", "chrome.exe"),
  join(process.env.LOCALAPPDATA || "", "Google", "Chrome", "Application", "chrome.exe")
] : [process.env.CHROME_PATH, process.env.GOOGLE_CHROME_BIN, "/usr/bin/google-chrome", "/usr/bin/google-chrome-stable", "/usr/bin/chromium"];
const chrome = candidates.find(candidate => candidate && existsSync(candidate));
if (!chrome) {
  const message = "Brush size slider browser check skipped: Chrome/Chromium was not found.";
  if (process.env.REQUIRE_BRUSH_SIZE_SLIDER_BROWSER_TEST === "1") throw new Error(message);
  console.log(message);
  process.exit(0);
}

const directory = mkdtempSync(join(tmpdir(), "catchgallery-brush-slider-"));
const file = join(directory, "check.html");
const html = `<!doctype html><meta charset="utf-8"><style>${styles}</style>
<main style="width:280px"><div class="tool-grid"><div class="brush-size-control"><output id="brushSizeValue" class="brush-size-value" for="brushSize" aria-hidden="true">9(기본)</output><input id="brushSize" type="range" min="3" max="34" value="9" aria-label="붓 굵기" aria-valuetext="9, 기본 굵기"></div><button></button><button></button></div></main><pre id="result"></pre>
<script>${setup}
const input=document.querySelector('#brushSize'),wrapper=input.closest('.brush-size-control'),output=document.querySelector('#brushSizeValue');
const release=setupBrushSizeControl(input), snapshots=[];
const snap=label=>snapshots.push({label,value:input.value,text:output.value,aria:input.getAttribute('aria-valuetext'),progress:wrapper.style.getPropertyValue('--brush-progress'),active:wrapper.classList.contains('is-active'),wrapper:[wrapper.getBoundingClientRect().left,wrapper.getBoundingClientRect().right],bubble:[output.getBoundingClientRect().left,output.getBoundingClientRect().right],overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,background:getComputedStyle(input).backgroundImage});
snap('initial'); input.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerId:1})); snap('down'); input.value='34'; input.dispatchEvent(new Event('input',{bubbles:true})); snap('max'); window.dispatchEvent(new PointerEvent('pointerup',{pointerId:1})); snap('up');
input.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerId:2})); window.dispatchEvent(new PointerEvent('pointercancel',{pointerId:2})); snap('cancel');
input.focus(); input.value='9'; input.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true})); input.dispatchEvent(new Event('input',{bubbles:true})); snap('keyboard-default'); input.value='3'; input.dispatchEvent(new KeyboardEvent('keydown',{key:'Home',bubbles:true})); input.dispatchEvent(new Event('input',{bubbles:true})); snap('min'); input.value='34'; input.dispatchEvent(new KeyboardEvent('keydown',{key:'End',bubbles:true})); input.dispatchEvent(new Event('input',{bubbles:true})); snap('keyboard-end'); input.blur(); snap('blur');
release(); input.value='34'; const releaseAgain=setupBrushSizeControl(input); snap('reentry'); releaseAgain(); document.querySelector('#result').textContent=encodeURIComponent(JSON.stringify(snapshots));</script>`;
writeFileSync(file, html);
try {
  const dom = execFileSync(chrome, ["--headless=new", "--disable-gpu", "--no-sandbox", "--no-first-run", "--disable-background-networking", "--allow-file-access-from-files", "--window-size=320,568", "--dump-dom", pathToFileURL(file).href], { encoding: "utf8", timeout: 30000 });
  const encoded = dom.match(/<pre id="result">([^<]+)<\/pre>/)?.[1];
  assert.ok(encoded, "browser result must be present");
  const rows = JSON.parse(decodeURIComponent(encoded));
  const by = label => rows.find(row => row.label === label);
  assert.deepEqual([by("initial").value, by("initial").text, by("initial").aria], ["9", "9(기본)", "9, 기본 굵기"]);
  assert.ok(Math.abs(parseFloat(by("initial").progress) - (6 / 31 * 100)) < 0.001);
  assert.equal(by("down").active, true);
  assert.deepEqual([by("max").value, by("max").text, by("max").progress], ["34", "34", "100%"]);
  assert.equal(by("max").aria, "34");
  assert.equal(by("up").active, false);
  assert.equal(by("cancel").active, false);
  assert.equal(by("keyboard-default").active, true);
  assert.deepEqual([by("min").value, by("min").text, by("min").progress], ["3", "3", "0%"]);
  assert.deepEqual([by("keyboard-end").value, by("keyboard-end").text, by("keyboard-end").progress], ["34", "34", "100%"]);
  assert.equal(by("blur").active, false);
  assert.deepEqual([by("reentry").value, by("reentry").text, by("reentry").active], ["9", "9(기본)", false]);
  for (const row of rows) {
    assert.equal(row.overflow, false, `${row.label} must not overflow at 320px`);
    assert.ok(row.bubble[0] >= row.wrapper[0] - 1 && row.bubble[1] <= row.wrapper[1] + 1, `${row.label} bubble stays in wrapper`);
    assert.match(row.background, /linear-gradient/i);
    assert.doesNotMatch(row.background, /rgb\(0, 0, 0\)/);
  }
  console.log("Brush size slider Chrome checks passed.");
} finally {
  rmSync(directory, { recursive: true, force: true });
}
