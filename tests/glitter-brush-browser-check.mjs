import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const app = readFileSync(new URL("../app.js", import.meta.url), "utf8");
const styles = readFileSync(new URL("../styles.css", import.meta.url), "utf8");
const renderSource = app.match(/function seededCanvasRandom[\s\S]*?(?=function compactCanvasHistory)/)?.[0];
assert.ok(renderSource, "metallic canvas renderer source must be readable");

function readConstant(name, opening, closing) {
  const marker = `const ${name} =`;
  const start = app.indexOf(marker);
  assert.notEqual(start, -1);
  const valueStart = app.indexOf(opening, start + marker.length);
  let depth = 0;
  let quote = null;
  for (let index = valueStart; index < app.length; index++) {
    const character = app[index];
    if (quote) {
      if (character === "\\") index++;
      else if (character === quote) quote = null;
    } else if (character === '"' || character === "'") quote = character;
    else if (character === opening) depth++;
    else if (character === closing && --depth === 0) return app.slice(valueStart, index + 1);
  }
  throw new Error(`could not extract ${name}`);
}

const colorsSource = readConstant("DRAWING_COLORS", "[", "]");
const metallicSource = readConstant("METALLIC_BRUSHES", "{", "}");
const chromeCandidates = process.platform === "win32" ? [
  process.env.CHROME_PATH,
  process.env.GOOGLE_CHROME_BIN,
  join(process.env.PROGRAMFILES || "C:\\Program Files", "Google", "Chrome", "Application", "chrome.exe"),
  join(process.env["PROGRAMFILES(X86)"] || "C:\\Program Files (x86)", "Google", "Chrome", "Application", "chrome.exe"),
  join(process.env.LOCALAPPDATA || "", "Google", "Chrome", "Application", "chrome.exe")
] : [process.env.CHROME_PATH, process.env.GOOGLE_CHROME_BIN, "/usr/bin/google-chrome", "/usr/bin/google-chrome-stable", "/usr/bin/chromium"];
const chrome = chromeCandidates.find(candidate => candidate && existsSync(candidate));
if (!chrome) {
  const message = "Glitter brush browser check requires installed Chrome/Chromium.";
  if (process.env.REQUIRE_GLITTER_BROWSER_TEST === "1") throw new Error(message);
  console.log(`${message} Skipped.`);
  process.exit(0);
}

const paletteCss = styles.match(/\.color \{[^}]+\}[\s\S]*?\.color\.metallic-color::after \{[^}]+\}/)?.[0] || "";
const temp = mkdtempSync(join(tmpdir(), "catchgallery-glitter-"));
try {
  const html = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><style>
    body{margin:0;width:320px;overflow-x:auto}canvas{display:none}.colors{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:2px;width:100%;box-sizing:border-box}.color{width:32px;height:32px;justify-self:center}${paletteCss}
  </style><div class="colors" id="colors"></div><canvas id="first" width="720" height="720"></canvas><canvas id="second" width="720" height="720"></canvas><output id="result"></output><script>
    const DRAWING_COLORS = ${colorsSource};
    const METALLIC_BRUSHES = ${metallicSource};
    ${renderSource}
    const defaultIndex = 12;
    colors.innerHTML = DRAWING_COLORS.map(([value,name,brush],index) => '<button class="color '+(brush !== 'solid' ? 'metallic-color ' : '')+(index === defaultIndex ? 'selected' : '')+'" data-color="'+value+'" data-brush="'+brush+'" style="--swatch-color:'+value+'" aria-label="'+name+' '+(brush === 'solid' ? '색연필' : '특수 브러시')+'"></button>').join('');
    const action = (brushKind, seed, points, width=22) => ({ type:'stroke', compositeOperation:'source-over', color:METALLIC_BRUSHES[brushKind].base, brushKind, seed, width, points });
    const gold = action('glitter-gold', 123456, [{x:80,y:120},{x:300,y:260},{x:620,y:160}]);
    const silver = action('glitter-silver', 654321, [{x:80,y:360},{x:310,y:500},{x:620,y:390}]);
    const goldDot = action('glitter-gold', 77, [{x:180,y:620}], 28);
    const silverDot = action('glitter-silver', 78, [{x:540,y:620}], 28);
    const draw = (canvas, actions) => { const context=canvas.getContext('2d'); context.clearRect(0,0,720,720); actions.forEach(value=>applyCanvasAction(context,value)); return canvas.toDataURL('image/png'); };
    const firstHash = draw(first,[gold,silver,goldDot,silverDot]);
    const secondHash = draw(second,[gold,silver,goldDot,silverDot]);
    const goldOnly = draw(second,[gold]);
    const undoHash = draw(first,[gold,silver].slice(0,-1));
    const clearUndoHash = draw(first,[gold,{type:'clear'}].slice(0,-1));
    const pointFirst = draw(first,[goldDot,silverDot]);
    const pointSecond = draw(second,[goldDot,silverDot]);
    const sequence = Array.from({length:17},(_,index)=>action(index%2 ? 'glitter-silver' : 'glitter-gold',1000+index,[{x:30+index*12,y:30+index*20},{x:650-index*8,y:60+index*18}],10));
    const direct = draw(first,sequence);
    const base=document.createElement('canvas'); base.width=base.height=720; const baseContext=base.getContext('2d'); sequence.slice(0,2).forEach(value=>applyCanvasAction(baseContext,value));
    const compressed=document.createElement('canvas'); compressed.width=compressed.height=720; const compressedContext=compressed.getContext('2d'); compressedContext.drawImage(base,0,0); sequence.slice(2).forEach(value=>applyCanvasAction(compressedContext,value));
    const compressedHash=compressed.toDataURL('image/png');
    const bytes=value=>{const data=(value.split(',')[1]||''); return Math.floor(data.length*3/4)-(data.match(/=*$/)||[''])[0].length};
    const representative=document.createElement('canvas'); representative.width=representative.height=720; const representativeContext=representative.getContext('2d'); representativeContext.fillStyle='#fff'; representativeContext.fillRect(0,0,720,720);
    for(let row=0;row<18;row++) applyCanvasAction(representativeContext,action(row%2?'glitter-silver':'glitter-gold',2000+row,[{x:30,y:30+row*39},{x:690,y:30+row*39}],32));
    const png=representative.toDataURL('image/png'); const webp=representative.toDataURL('image/webp',.82); const detail=webp.length<png.length?webp:png;
    const thumb=document.createElement('canvas'); thumb.width=thumb.height=240; thumb.getContext('2d').drawImage(representative,0,0,240,240); const thumbnail=thumb.toDataURL('image/webp',.82);
    const solid=document.createElement('canvas'); solid.width=solid.height=720; const solidContext=solid.getContext('2d'); solidContext.fillStyle='#fff'; solidContext.fillRect(0,0,720,720); solidContext.strokeStyle='#d6a928'; solidContext.lineWidth=32; for(let row=0;row<18;row++){solidContext.beginPath();solidContext.moveTo(30,30+row*39);solidContext.lineTo(690,30+row*39);solidContext.stroke()}; const solidWebp=solid.toDataURL('image/webp',.82);
    const rect=document.querySelector('.colors').getBoundingClientRect();
    result.textContent=JSON.stringify({names:DRAWING_COLORS.map(value=>value[1]),count:document.querySelectorAll('.color').length,defaultName:DRAWING_COLORS[defaultIndex][1],aria:[...document.querySelectorAll('.color')].map(value=>value.getAttribute('aria-label')),overflow:colors.scrollWidth>colors.clientWidth||rect.right>innerWidth+0.5,replay:firstHash===secondHash,undo:goldOnly===undoHash,clearUndo:goldOnly===clearUndoHash,points:pointFirst===pointSecond,compression:direct===compressedHash,goldSilverDifferent:draw(first,[gold])!==draw(second,[silver]),sizes:{detailBytes:bytes(detail),thumbnailBytes:bytes(thumbnail),solidBytes:bytes(solidWebp),ratio:bytes(detail)/Math.max(1,bytes(solidWebp)),format:detail.startsWith('data:image/webp')?'webp':'png'}});
  </script>`;
  const fixture = join(temp, "glitter.html");
  writeFileSync(fixture, html);
  const output = execFileSync(chrome, ["--headless=new", "--disable-gpu", "--no-sandbox", "--no-first-run", "--disable-background-networking", "--window-size=320,568", `--user-data-dir=${join(temp, "profile")}`, "--dump-dom", pathToFileURL(fixture).href], { encoding: "utf8", timeout: 45_000 });
  const encoded = output.match(/<output id="result">([^<]+)<\/output>/)?.[1] || "null";
  const result = JSON.parse(encoded.replaceAll("&quot;", '"').replaceAll("&amp;", "&"));
  assert.deepEqual(result.names, ["빨강", "분홍", "연분홍", "주황", "연주황", "노랑", "연두", "초록", "하늘", "파랑", "연보라", "보라", "검정", "갈색", "금색", "은색"]);
  assert.equal(result.count, 16);
  assert.equal(result.defaultName, "검정");
  assert.equal(result.aria.at(-2), "금색 특수 브러시");
  assert.equal(result.aria.at(-1), "은색 특수 브러시");
  assert.equal(result.overflow, false, "320px palette must not overflow horizontally");
  for (const key of ["replay", "undo", "clearUndo", "points", "compression", "goldSilverDifferent"]) assert.equal(result[key], true, key);
  assert.ok(result.sizes.detailBytes <= 1_850_000);
  assert.ok(result.sizes.thumbnailBytes <= 290_000);
  assert.ok(result.sizes.ratio < 8, "representative metallic drawing must avoid an excessive size multiplier");
  console.log(`Glitter browser: ${chrome}`);
  console.log(JSON.stringify(result));
  console.log("Glitter brush browser checks passed.");
} finally {
  rmSync(temp, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
}
