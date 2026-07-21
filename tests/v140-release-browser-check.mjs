import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const app = readFileSync(new URL("../app.js", import.meta.url), "utf8");
const styles = readFileSync(new URL("../styles.css", import.meta.url), "utf8");
function pick(name) {
  const start = app.indexOf(`function ${name}(`);
  assert.notEqual(start, -1, `${name} must exist`);
  let depth = 0, opened = false;
  for (let index = start; index < app.length; index++) {
    if (app[index] === "{") { depth++; opened = true; }
    else if (app[index] === "}" && opened && --depth === 0) return app.slice(start, index + 1);
  }
  throw new Error(`could not extract ${name}`);
}
const colorsSource = app.match(/const DRAWING_COLORS = (\[[\s\S]*?\]);\r?\nconst DEFAULT_DRAWING_COLOR_INDEX/)?.[1];
const defaultIndex = app.match(/const DEFAULT_DRAWING_COLOR_INDEX = (\d+);/)?.[1];
assert.ok(colorsSource && defaultIndex);

const chromeCandidates = process.platform === "win32" ? [
  process.env.CHROME_PATH,
  process.env.GOOGLE_CHROME_BIN,
  join(process.env.PROGRAMFILES || "C:\\Program Files", "Google", "Chrome", "Application", "chrome.exe"),
  join(process.env["PROGRAMFILES(X86)"] || "C:\\Program Files (x86)", "Google", "Chrome", "Application", "chrome.exe"),
  join(process.env.LOCALAPPDATA || "", "Google", "Chrome", "Application", "chrome.exe")
] : [process.env.CHROME_PATH, process.env.GOOGLE_CHROME_BIN, "/usr/bin/google-chrome", "/usr/bin/google-chrome-stable", "/usr/bin/chromium"];
const chrome = chromeCandidates.find(candidate => candidate && existsSync(candidate));
if (!chrome) {
  const message = "v1.4.0 release browser check requires installed Chrome/Chromium.";
  if (process.env.REQUIRE_V140_BROWSER_TEST === "1") throw new Error(message);
  console.log(`${message} Skipped.`);
  process.exit(0);
}

const temp = mkdtempSync(join(tmpdir(), "catchgallery-v140-"));
try {
  const html = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><style>${styles}</style><main id="app"></main><span id="score"></span><output id="result"></output><script>
    const DRAWING_COLORS=${colorsSource},DEFAULT_DRAWING_COLOR_INDEX=${defaultIndex};
    const state={user:{nickname:'테스터',score:140},word:{category:'동물',word:'고양이',answers:['고양이'],isCustomWord:false},editDrawing:null,dirty:false,ctx:null};
    const appEl=document.querySelector('#app'),scoreEl=document.querySelector('#score');
    const escapeHtml=value=>String(value),randomWord=()=>{},setupCanvas=()=>{state.canvas=document.querySelector('#drawingCanvas');state.ctx=state.canvas.getContext('2d')},selectDrawingColor=()=>{},undoCanvas=()=>{},openClearCanvasModal=()=>{},saveDrawingDraft=()=>{},isValidCategory=()=>true,textLength=value=>value.length,normalizeAnswer=value=>value,showToast=()=>{},signOut=async()=>{},userErrorMessage=()=>'';
    ${pick("renderHome")}
    ${pick("renderDraw")}
    try {
      renderHome();
      const version=document.querySelector('.home-version')?.textContent;
      const versionLabel=document.querySelector('.home-version')?.getAttribute('aria-label');
      renderDraw();
      const colors=[...document.querySelectorAll('.color')];
      const gold=document.querySelector('[data-brush="glitter-gold"]');
      const silver=document.querySelector('[data-brush="glitter-silver"]');
      result.textContent=JSON.stringify({version,versionLabel,colorCount:colors.length,names:colors.map(value=>value.getAttribute('aria-label')),gold:gold?.getAttribute('aria-label'),silver:silver?.getAttribute('aria-label'),canvas:[drawingCanvas.width,drawingCanvas.height],preview:[metallicPreviewCanvas.width,metallicPreviewCanvas.height],booted:!!document.querySelector('.draw-screen')});
    } catch(error) { result.textContent=JSON.stringify({error:error.stack||String(error)}); }
  </script>`;
  const fixture = join(temp, "v140-release.html");
  writeFileSync(fixture, html);
  const output = execFileSync(chrome, ["--headless=new", "--disable-gpu", "--no-sandbox", "--no-first-run", "--disable-background-networking", "--window-size=390,844", `--user-data-dir=${join(temp, "profile")}`, "--dump-dom", pathToFileURL(fixture).href], { encoding: "utf8", timeout: 45_000 });
  const encoded = output.match(/<output id="result">([^<]+)<\/output>/)?.[1] || "null";
  const result = JSON.parse(encoded.replaceAll("&quot;", '"').replaceAll("&amp;", "&"));
  assert.ok(result && !result.error, result?.error || "Chrome did not return v1.4.0 release results");
  assert.equal(result.version, "v1.4.0");
  assert.equal(result.versionLabel, "앱 버전");
  assert.equal(result.booted, true);
  assert.equal(result.colorCount, 16);
  assert.equal(result.gold, "금색 특수 브러시");
  assert.equal(result.silver, "은색 특수 브러시");
  assert.deepEqual(result.canvas, [720, 720]);
  assert.deepEqual(result.preview, [720, 720]);
  console.log(`v1.4.0 release browser: ${chrome}`);
  console.log(JSON.stringify(result));
  console.log("v1.4.0 release browser checks passed.");
} finally {
  rmSync(temp, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
}
