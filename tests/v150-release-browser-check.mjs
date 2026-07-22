import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const chromeCandidates = process.platform === "win32" ? [
  process.env.CHROME_PATH,
  join(process.env.PROGRAMFILES || "C:\\Program Files", "Google", "Chrome", "Application", "chrome.exe"),
  join(process.env["PROGRAMFILES(X86)"] || "C:\\Program Files (x86)", "Google", "Chrome", "Application", "chrome.exe"),
  join(process.env.LOCALAPPDATA || "", "Google", "Chrome", "Application", "chrome.exe")
] : [process.env.CHROME_PATH, "/usr/bin/google-chrome", "/usr/bin/chromium"];
const chrome = chromeCandidates.find(value => value && existsSync(value));
if (!chrome) {
  const message = "v1.5.0 release browser check requires installed Chrome/Chromium.";
  if (process.env.REQUIRE_V150_RELEASE_BROWSER_TEST === "1") throw new Error(message);
  console.log(`${message} Skipped.`);
  process.exit(0);
}

const app = readFileSync(new URL("../app.js", import.meta.url), "utf8");
const renderHome = app.match(/function renderHome\(\) \{[\s\S]*?\n\}/)?.[0];
assert.ok(renderHome);
const directory = mkdtempSync(join(tmpdir(), "catchgallery-v150-"));
try {
  const fixture = join(directory, "version.html");
  writeFileSync(fixture, `<!doctype html><meta charset="utf-8"><main id="app"></main><span id="score"></span><output id="result"></output><script>const appEl=document.querySelector('#app'),scoreEl=document.querySelector('#score'),state={user:{nickname:'테스터',score:0}},escapeHtml=String,signOut=async()=>{},showToast=()=>{},userErrorMessage=String;${renderHome};renderHome();result.textContent=document.querySelector('.home-version').textContent;</script>`);
  const dom = execFileSync(chrome, ["--headless=new", "--disable-gpu", "--no-sandbox", "--no-first-run", "--disable-background-networking", `--user-data-dir=${join(directory, "profile")}`, "--dump-dom", pathToFileURL(fixture).href], { encoding: "utf8", timeout: 45_000 });
  assert.match(dom, /<output id="result">v1\.5\.0<\/output>/);
} finally {
  rmSync(directory, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
}

const checks = [
  ["brush-size-slider-browser-check.mjs", "REQUIRE_BRUSH_SIZE_SLIDER_BROWSER_TEST"],
  ["gallery-artist-view-browser-check.mjs", "REQUIRE_GALLERY_ARTIST_BROWSER_TEST"],
  ["answer-success-like-browser-check.mjs", "REQUIRE_ANSWER_SUCCESS_LIKE_BROWSER_TEST"]
];
for (const [script, required] of checks) {
  execFileSync(process.execPath, [fileURLToPath(new URL(script, import.meta.url))], {
    stdio: "inherit",
    env: { ...process.env, CHROME_PATH: chrome, [required]: "1" },
    timeout: 120_000
  });
}
console.log("v1.5.0 release browser checks passed: version smoke, brush UI, artist gallery, success likes, six responsive viewports, overflow, and fatal-console checks.");
