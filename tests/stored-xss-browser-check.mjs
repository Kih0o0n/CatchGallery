import fs from "node:fs";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const app = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
const categorySource = app.match(/function textLength[\s\S]*?(?=function dataUrlBytes)/)?.[0];
const hintSource = app.match(/function showCategoryHint[\s\S]*?(?=function openDrawingCard)/)?.[0];
const cardSource = app.match(/function openDrawingCard[\s\S]*?(?=function cancelSolveImageLoading)/)?.[0];
assert.ok(categorySource && hintSource && cardSource);
const isValidCategory = Function(`${categorySource}; return isValidCategory;`)();
assert.equal(isValidCategory("운동과 놀이"), true);
for (const unsafe of ['x" onfocus="x=1', "a<b", "a>b", "a'b", "a`b", "a=b"]) assert.equal(isValidCategory(unsafe), false, `${JSON.stringify(unsafe)} must be rejected for a new custom drawing`);
const state = { hintUsed: {} };
const openDrawingCard = Function("state", "isOwnDrawing", "formatTime", "escapeHtml", "solverRewardHtml", `${cardSource}; return openDrawingCard;`)(state, () => false, () => "1시간", value => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;"), () => "");
const drawings = [
  { id: "attack", category: 'x" onfocus="x=1', expiresAt: Date.now() + 1000 },
  { id: "korean", category: "운동과 놀이", expiresAt: Date.now() + 1000 },
  { id: "default", category: "동물", expiresAt: Date.now() + 1000 }
];
const markup = drawings.map(drawing => openDrawingCard(drawing, 0)).join("");
assert.doesNotMatch(markup, /data-category=/);

const candidates = process.platform === "win32" ? [
  join(process.env.PROGRAMFILES || "C:\\Program Files", "Google", "Chrome", "Application", "chrome.exe"),
  join(process.env["PROGRAMFILES(X86)"] || "C:\\Program Files (x86)", "Google", "Chrome", "Application", "chrome.exe"),
  join(process.env.LOCALAPPDATA || "", "Google", "Chrome", "Application", "chrome.exe")
] : ["/usr/bin/google-chrome", "/usr/bin/google-chrome-stable", "/usr/bin/chromium"];
const chrome = [process.env.CHROME_PATH, process.env.GOOGLE_CHROME_BIN, ...candidates].find(candidate => candidate && existsSync(candidate));
if (!chrome) {
  const message = "Stored XSS browser check requires Chrome/Chromium. Set CHROME_PATH or GOOGLE_CHROME_BIN.";
  if (process.env.REQUIRE_SECURITY_BROWSER_TEST === "1") throw new Error(message);
  console.log(`${message} Skipped.`);
  process.exit(0);
}

const temp = mkdtempSync(join(tmpdir(), "catchgallery-xss-"));
try {
  const encodedDrawings = Buffer.from(JSON.stringify(drawings), "utf8").toString("base64");
  const html = `<!doctype html><meta charset="utf-8"><body>${markup}<output id="result"></output><script>
    globalThis.x = undefined;
    const drawings = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob("${encodedDrawings}"), c => c.charCodeAt(0))));
    ${hintSource}
    const drawingsById = new Map(drawings.map(drawing => [drawing.id, drawing]));
    document.querySelectorAll("[data-hint]").forEach(button => button.onclick = () => {
      showCategoryHint(button, drawingsById);
    });
    const attack = document.querySelector('[data-hint="attack"]');
    attack.focus(); attack.click();
    document.querySelector('[data-hint="korean"]').click();
    document.querySelector('[data-hint="default"]').click();
    let seed = 0x12345678; const random = () => { seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; return (seed >>> 0) & 255; };
    const detailCanvas = document.createElement("canvas"); detailCanvas.width = detailCanvas.height = 720;
    const context = detailCanvas.getContext("2d"); const pixels = context.createImageData(720, 720);
    for (let index = 0; index < pixels.data.length; index += 4) { pixels.data[index] = random(); pixels.data[index + 1] = random(); pixels.data[index + 2] = random(); pixels.data[index + 3] = 255; }
    context.putImageData(pixels, 0, 0);
    const png = detailCanvas.toDataURL("image/png"); const webp = detailCanvas.toDataURL("image/webp", 0.82); const detail = webp.length < png.length ? webp : png;
    const thumbnailCanvas = document.createElement("canvas"); thumbnailCanvas.width = thumbnailCanvas.height = 240; thumbnailCanvas.getContext("2d").drawImage(detailCanvas, 0, 0, 240, 240);
    const thumbnail = thumbnailCanvas.toDataURL("image/webp", 0.82);
    const bytes = value => Math.floor((value.split(",")[1] || "").length * 3 / 4) - ((value.match(/=*$/) || [""])[0].length);
    result.textContent = JSON.stringify({ x: globalThis.x ?? null, onfocus: attack.hasAttribute("onfocus"), attributes: [...attack.attributes].map(a => a.name), attack: attack.textContent, korean: document.querySelector('[data-hint="korean"]').textContent, normal: document.querySelector('[data-hint="default"]').textContent, encoder: { detailChars: detail.length, imageBytes: bytes(detail), thumbnailChars: thumbnail.length, thumbnailBytes: bytes(thumbnail) } });
  </script></body>`;
  const fixture = join(temp, "xss.html");
  writeFileSync(fixture, html);
  const output = execFileSync(chrome, ["--headless=new", "--disable-gpu", "--no-sandbox", "--no-first-run", "--disable-background-networking", `--user-data-dir=${join(temp, "profile")}`, "--dump-dom", pathToFileURL(fixture).href], { encoding: "utf8", timeout: 30_000 });
  const result = JSON.parse(output.match(/<output id="result">([^<]+)<\/output>/)?.[1].replaceAll("&quot;", '"') || "null");
  assert.equal(result.x, null);
  assert.equal(result.onfocus, false);
  assert.deepEqual(result.attributes.sort(), ["class", "data-hint", "data-recent-successes"].sort());
  assert.equal(result.attack, '카테고리: x" onfocus="x=1');
  assert.equal(result.korean, "카테고리: 운동과 놀이");
  assert.equal(result.normal, "카테고리: 동물");
  assert.ok(result.encoder.detailChars <= 2_500_000 && result.encoder.imageBytes <= 1_850_000);
  assert.ok(result.encoder.thumbnailChars <= 400_000 && result.encoder.thumbnailBytes <= 290_000);
  console.log(`High-entropy encoder sample: detail ${result.encoder.detailChars} chars/${result.encoder.imageBytes} bytes; thumbnail ${result.encoder.thumbnailChars} chars/${result.encoder.thumbnailBytes} bytes.`);
} finally {
  rmSync(temp, { recursive: true, force: true });
}

console.log("Stored XSS browser checks passed.");
