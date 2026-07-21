import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const app = readFileSync(new URL("../app.js", import.meta.url), "utf8");
function pick(name) {
  const token = `function ${name}(`;
  const start = app.indexOf(token);
  assert.notEqual(start, -1, `${name} must exist`);
  let depth = 0, opened = false;
  for (let index = start; index < app.length; index++) {
    if (app[index] === "{") { depth++; opened = true; }
    else if (app[index] === "}" && opened && --depth === 0) return app.slice(start, index + 1);
  }
  throw new Error(`could not extract ${name}`);
}
function objectConstant(name) {
  const marker = `const ${name} =`;
  const start = app.indexOf(marker);
  const valueStart = app.indexOf("{", start + marker.length);
  let depth = 0, quote = null;
  for (let index = valueStart; index < app.length; index++) {
    const character = app[index];
    if (quote) {
      if (character === "\\") index++;
      else if (character === quote) quote = null;
    } else if (character === '"' || character === "'") quote = character;
    else if (character === "{") depth++;
    else if (character === "}" && --depth === 0) return app.slice(valueStart, index + 1);
  }
  throw new Error(`could not extract ${name}`);
}

const functionNames = [
  "releaseCanvasHistory", "initializeCanvasHistory", "seededCanvasRandom", "drawStrokePath", "canvasPathMetrics",
  "pointAlongCanvasPath", "drawMetallicSparkle", "drawMetallicStroke", "applyCanvasAction", "compactCanvasHistory",
  "commitCanvasAction", "redrawCanvasFromHistory", "redrawCanvasWhenIdle", "flushPendingCanvasRedraw", "canvasPoint",
  "clampCanvasZoom", "clampCanvasTransform", "canvasTouchCenter", "canvasTouchDistance", "calculateCanvasGestureTransform",
  "sameCanvasPoint", "canvasContentAfterAction", "canvasHasVisibleContent", "safeSetPointerCapture", "safeReleasePointerCapture",
  "pointerMoveShowsContactEnded", "setupCanvas"
];
const productionSource = functionNames.map(pick).join("\n");
const renderSource = app.match(/function seededCanvasRandom[\s\S]*?(?=function compactCanvasHistory)/)?.[0];
assert.ok(renderSource, "metallic renderer source must be readable");
const metallicSource = objectConstant("METALLIC_BRUSHES");
const chromeCandidates = process.platform === "win32" ? [
  process.env.CHROME_PATH,
  process.env.GOOGLE_CHROME_BIN,
  join(process.env.PROGRAMFILES || "C:\\Program Files", "Google", "Chrome", "Application", "chrome.exe"),
  join(process.env["PROGRAMFILES(X86)"] || "C:\\Program Files (x86)", "Google", "Chrome", "Application", "chrome.exe"),
  join(process.env.LOCALAPPDATA || "", "Google", "Chrome", "Application", "chrome.exe")
] : [process.env.CHROME_PATH, process.env.GOOGLE_CHROME_BIN, "/usr/bin/google-chrome", "/usr/bin/google-chrome-stable", "/usr/bin/chromium"];
const chrome = chromeCandidates.find(candidate => candidate && existsSync(candidate));
if (!chrome) {
  const message = "Metallic preview browser check requires installed Chrome/Chromium.";
  if (process.env.REQUIRE_METALLIC_PREVIEW_BROWSER_TEST === "1") throw new Error(message);
  console.log(`${message} Skipped.`);
  process.exit(0);
}

const temp = mkdtempSync(join(tmpdir(), "catchgallery-metallic-preview-"));
try {
  const html = `<!doctype html><meta charset="utf-8"><style>
    body{margin:0}.canvas-wrap{position:relative;width:720px;height:720px}canvas{position:absolute;inset:0;width:720px;height:720px}#metallicPreviewCanvas{pointer-events:none;background:transparent;z-index:1}
  </style><div class="canvas-wrap"><canvas id="drawingCanvas" width="720" height="720"></canvas><canvas id="metallicPreviewCanvas" width="720" height="720"></canvas></div><input id="brushSize" type="range" value="9"><output id="result">pending</output><script>
    const DRAWING_HISTORY_LIMIT=15, PEN_TOUCH_TAKEOVER_DELAY_MS=1500, METALLIC_BRUSHES=${metallicSource};
    let routeTransitionId=1;
    const state={route:'draw',canvas:null,ctx:null,drawing:false,activePointerId:null,activePointerType:null,activePointerStartedAt:null,activePointerLastEventAt:null,activePointerCaptured:false,dirty:false,history:[],historyBaseCanvas:null,historyBaseContext:null,historyBaseReady:false,historyBaseHasContent:false,historyRedrawPending:false,activeStroke:null,canvasRect:null,brushInput:null,currentBrushKind:'solid',strokeSeedCounter:0,metallicPreviewCanvas:null,metallicPreviewContext:null,metallicPreviewFrame:0,canvasInputCleanup:null,canvasZoomScale:1,canvasZoomX:0,canvasZoomY:0,canvasGestureActive:false,canvasGesturePointers:new Map(),canvasGestureSuppressedPointers:new Set(),editImageRequestId:0};
    const bindDocumentDrawingScrollBlocker=()=>{}, preventIfCancelable=event=>event?.preventDefault?.(), clearCanvasTouchSession=()=>{}, lockCanvasTouchSession=()=>{}, eventTargetsCanvas=(event,canvas)=>event.target===canvas, scheduleCanvasTouchFallbackCleanup=()=>{}, isTransitionCurrent=()=>true;
    ${productionSource}
    const canvas=document.querySelector('#drawingCanvas'), preview=document.querySelector('#metallicPreviewCanvas'), brush=document.querySelector('#brushSize');
    const nextFrame=()=>new Promise(resolve=>setTimeout(resolve,25));
    const pointer=(type,x,y,id=1,pointerType='mouse',extra={})=>canvas.dispatchEvent(new PointerEvent(type,{bubbles:true,cancelable:true,pointerId:id,pointerType,isPrimary:true,button:0,buttons:type==='pointerup'||type==='pointercancel'?0:1,clientX:x,clientY:y,...extra}));
    const alphaBounds=target=>{const data=target.getContext('2d').getImageData(0,0,720,720).data;let count=0,minX=720,minY=720,maxX=-1,maxY=-1;for(let i=3,p=0;i<data.length;i+=4,p++){if(!data[i])continue;count++;const x=p%720,y=Math.floor(p/720);minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y)}return{count,minX,minY,maxX,maxY}};
    const median=values=>values.sort((a,b)=>a-b)[Math.floor(values.length/2)];
    const renderMedian=(action,sparkles=false)=>{const target=document.createElement('canvas');target.width=target.height=720;const context=target.getContext('2d');const values=[];for(let i=0;i<13;i++){context.clearRect(0,0,720,720);const start=performance.now();drawMetallicStroke(context,action,{sparkles});values.push(performance.now()-start)}return median(values.slice(3))};
    const reset=()=>{state.canvasInputCleanup?.();setupCanvas(null);state.history=[];state.historyBaseContext.clearRect(0,0,720,720);state.historyBaseHasContent=false;state.ctx.clearRect(0,0,720,720);state.metallicPreviewContext.clearRect(0,0,720,720);state.dirty=false};
    const path=Array.from({length:81},(_,index)=>({x:30+index*8,y:180+Math.sin(index/5)*80}));
    const testStroke=async(brushKind,width)=>{reset();state.currentBrushKind=brushKind;state.ctx.strokeStyle=METALLIC_BRUSHES[brushKind].base;brush.value=String(width);pointer('pointerdown',path[0].x,path[0].y);const dotAtDown=alphaBounds(preview).count;for(const point of path.slice(1))pointer('pointermove',point.x,point.y);const frameId=state.metallicPreviewFrame;await nextFrame();const active={...state.activeStroke,points:state.activeStroke.points.map(point=>({...point}))};const expected=document.createElement('canvas');expected.width=expected.height=720;drawMetallicStroke(expected.getContext('2d'),active,{sparkles:false});const previewHash=preview.toDataURL(), expectedHash=expected.toDataURL(), before=alphaBounds(preview), mainBefore=alphaBounds(canvas).count;const start=performance.now();pointer('pointerup',path.at(-1).x,path.at(-1).y);const commitMs=performance.now()-start;const after=alphaBounds(canvas), finalHash=canvas.toDataURL();return{brushKind,width,dotAtDown,frameId,previewMatchesCanonicalBase:previewHash===expectedHash,mainBefore,previewAfter:alphaBounds(preview).count,history:state.history.length,boundsEqual:before.minX===after.minX&&before.minY===after.minY&&before.maxX===after.maxX&&before.maxY===after.maxY,sparklesAdded:finalHash!==expectedHash,previewMedianMs:renderMedian(active,false),commitMs}};
    const testSmall=async(kind,move)=>{reset();state.currentBrushKind=kind;state.ctx.strokeStyle=METALLIC_BRUSHES[kind].base;brush.value='20';pointer('pointerdown',200,300,20);const down=alphaBounds(preview).count;if(move)pointer('pointermove',204,300,20);await nextFrame();const before=alphaBounds(preview).count;pointer('pointerup',move?204:200,300,20);return{down,before,after:alphaBounds(canvas).count,previewAfter:alphaBounds(preview).count,points:state.history[0]?.points.length||0}};
    const testPending=async()=>{state.canvasInputCleanup?.();setupCanvas('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL9WQAAAABJRU5ErkJggg==');state.currentBrushKind='glitter-gold';state.ctx.strokeStyle=METALLIC_BRUSHES['glitter-gold'].base;const originalClear=state.ctx.clearRect.bind(state.ctx);let clears=0;state.ctx.clearRect=(...args)=>{clears++;return originalClear(...args)};pointer('pointerdown',100,100,40);pointer('pointermove',240,180,40);await nextFrame();const pendingDuring=state.historyRedrawPending;pointer('pointerup',240,180,40);const pendingAfter=state.historyRedrawPending,clearsAfterMetallic=clears;state.currentBrushKind='solid';state.ctx.strokeStyle='#ff0000';pointer('pointerdown',300,200,41);pointer('pointermove',360,240,41);pointer('pointerup',360,240,41);const clearsAfterSolid=clears;state.currentBrushKind='glitter-silver';state.ctx.strokeStyle=METALLIC_BRUSHES['glitter-silver'].base;pointer('pointerdown',100,300,42,'touch');pointer('pointermove',180,340,42,'touch');const clearsBeforePinch=clears;pointer('pointerdown',400,300,43,'touch',{isPrimary:false});const pinchHistory=state.history.length,previewAfterPinch=alphaBounds(preview).count,clearsAfterPinch=clears;pointer('pointerup',100,300,42,'touch');pointer('pointercancel',400,300,43,'touch',{isPrimary:false});state.ctx.clearRect=originalClear;return{pendingDuring,pendingAfter,clearsAfterMetallic,clearsAfterSolid,clearsBeforePinch,clearsAfterPinch,pinchHistory,previewAfterPinch}};
    const testTransform=()=>{reset();pointer('pointerdown',120,120,50,'touch');pointer('pointermove',140,120,50,'touch');pointer('pointerdown',360,120,51,'touch',{isPrimary:false});pointer('pointermove',600,120,51,'touch',{isPrimary:false});const transformed=canvas.style.transform,match=transformed===preview.style.transform;pointer('pointerup',140,120,50,'touch');pointer('pointerup',600,120,51,'touch',{isPrimary:false});return{transformed,match}};
    const benchmarkHistory=async(count,kind)=>{reset();const actions=Array.from({length:count},(_,index)=>({type:'stroke',compositeOperation:'source-over',color:METALLIC_BRUSHES[index%2?'glitter-silver':'glitter-gold'].base,brushKind:index%2?'glitter-silver':'glitter-gold',seed:1000+index,width:18,points:[{x:40,y:30+index*38},{x:680,y:30+index*38}]}));state.history=actions;redrawCanvasFromHistory();state.currentBrushKind=kind;state.ctx.strokeStyle=METALLIC_BRUSHES[kind].base;brush.value='20';pointer('pointerdown',30,400,30);for(const point of path.slice(1))pointer('pointermove',point.x,400+(point.y-180)*.45,30);await nextFrame();const start=performance.now();pointer('pointerup',670,400,30);return{count,ms:performance.now()-start,remaining:state.history.length,baseHasContent:state.historyBaseHasContent}};
    (async()=>{setupCanvas(null);const strokes=[];for(const kind of ['glitter-gold','glitter-silver'])for(const width of [3,9,20,34])strokes.push(await testStroke(kind,width));const dotGold=await testSmall('glitter-gold',false),dotSilver=await testSmall('glitter-silver',false),shortGold=await testSmall('glitter-gold',true),shortSilver=await testSmall('glitter-silver',true),pending=await testPending(),transform= testTransform();const history=[];for(const count of [5,10,15])history.push(await benchmarkHistory(count,'glitter-gold'));result.textContent=JSON.stringify({strokes,dotGold,dotSilver,shortGold,shortSilver,pending,transform,history,chrome:navigator.userAgent});})().catch(error=>{result.textContent=JSON.stringify({error:error.stack||String(error)})});
  </script>`;
  const fixture = join(temp, "metallic-preview.html");
  writeFileSync(fixture, html);
  const output = execFileSync(chrome, ["--headless=new", "--disable-gpu", "--no-sandbox", "--no-first-run", "--disable-background-networking", "--window-size=900,800", "--virtual-time-budget=10000", `--user-data-dir=${join(temp, "profile")}`, "--dump-dom", pathToFileURL(fixture).href], { encoding: "utf8", timeout: 60_000 });
  const encoded = output.match(/<output id="result">([^<]+)<\/output>/)?.[1] || "null";
  const result = JSON.parse(encoded.replaceAll("&quot;", '"').replaceAll("&amp;", "&"));
  assert.ok(result && !result.error, result?.error || "Chrome did not return metallic preview results");
  const performanceHtml = `<!doctype html><meta charset="utf-8"><canvas id="canvas" width="720" height="720"></canvas><output id="result"></output><script>
    const METALLIC_BRUSHES=${metallicSource};${renderSource}
    const context=canvas.getContext('2d'),points=Array.from({length:81},(_,index)=>({x:30+index*8,y:180+Math.sin(index/5)*80}));
    const action=(kind,seed,width=20,y=0)=>({type:'stroke',compositeOperation:'source-over',color:METALLIC_BRUSHES[kind].base,brushKind:kind,seed,width,points:points.map(point=>({x:point.x,y:point.y+y}))});
    const median=values=>values.sort((a,b)=>a-b)[Math.floor(values.length/2)];
    const measure=(work,repeats=20)=>{const samples=[];for(let sample=0;sample<9;sample++){const start=performance.now();for(let repeat=0;repeat<repeats;repeat++)work();samples.push((performance.now()-start)/repeats)}return median(samples.slice(2))};
    const flush=()=>context.getImageData(0,0,1,1);
    const preview={};for(const kind of ['glitter-gold','glitter-silver'])for(const width of [3,9,20,34]){const value=action(kind,100+width,width);preview[kind+'-'+width]=measure(()=>{context.clearRect(0,0,720,720);drawMetallicStroke(context,value,{sparkles:false});flush()},20)}
    const canonical={};for(const count of [1,6,11,16]){const actions=Array.from({length:count},(_,index)=>action(index%2?'glitter-silver':'glitter-gold',1000+index,20,(index%12)*3));canonical[count]=measure(()=>{context.clearRect(0,0,720,720);actions.forEach(value=>applyCanvasAction(context,value));flush()},8)}
    result.textContent=JSON.stringify({preview,canonical});
  </script>`;
  const performanceFixture = join(temp, "metallic-performance.html");
  writeFileSync(performanceFixture, performanceHtml);
  const performanceOutput = execFileSync(chrome, ["--headless=new", "--disable-gpu", "--no-sandbox", "--no-first-run", "--disable-background-networking", `--user-data-dir=${join(temp, "performance-profile")}`, "--dump-dom", pathToFileURL(performanceFixture).href], { encoding: "utf8", timeout: 60_000 });
  const performanceEncoded = performanceOutput.match(/<output id="result">([^<]+)<\/output>/)?.[1] || "null";
  result.performance = JSON.parse(performanceEncoded.replaceAll("&quot;", '"').replaceAll("&amp;", "&"));
  assert.equal(result.strokes.length, 8);
  for (const stroke of result.strokes) {
    assert.ok(stroke.dotAtDown > 0, `${stroke.brushKind} ${stroke.width}px dot preview`);
    assert.notEqual(stroke.frameId, 0, "moves schedule one preview frame");
    assert.equal(stroke.previewMatchesCanonicalBase, true, `${stroke.brushKind} ${stroke.width}px preview must be one smooth canonical base path`);
    assert.equal(stroke.mainBefore, 0, "active metallic input must not alter the main canvas");
    assert.equal(stroke.previewAfter, 0, "commit clears the preview");
    assert.equal(stroke.history, 1);
    assert.equal(stroke.boundsEqual, true, "preview and final stroke bounds stay stable");
    assert.equal(stroke.sparklesAdded, true, "canonical commit adds deterministic sparkles");
  }
  for (const value of [result.dotGold, result.dotSilver, result.shortGold, result.shortSilver]) {
    assert.ok(value.down > 0 && value.before > 0 && value.after > 0);
    assert.equal(value.previewAfter, 0);
  }
  assert.equal(result.dotGold.points, 1); assert.equal(result.dotSilver.points, 1);
  assert.equal(result.shortGold.points, 2); assert.equal(result.shortSilver.points, 2);
  assert.equal(result.pending.pendingDuring, true);
  assert.equal(result.pending.pendingAfter, false);
  assert.equal(result.pending.clearsAfterSolid, result.pending.clearsAfterMetallic, "ordinary stroke does not consume a stale pending replay");
  assert.equal(result.pending.clearsAfterPinch, result.pending.clearsBeforePinch, "metallic pinch cancellation does not redraw the unchanged main canvas");
  assert.equal(result.pending.pinchHistory, 2);
  assert.equal(result.pending.previewAfterPinch, 0);
  assert.deepEqual(result.history.map(value => value.count), [5, 10, 15]);
  assert.equal(result.history.at(-1).remaining, 15, "the 16th action compresses into the detached base");
  assert.equal(result.history.at(-1).baseHasContent, true);
  assert.match(result.transform.transformed, /^translate\(/);
  assert.equal(result.transform.match, true);
  for (const value of [...Object.values(result.performance.preview), ...Object.values(result.performance.canonical)]) assert.ok(value >= 0 && value < 100, "desktop Chrome metallic rendering remains responsive");
  console.log(`Metallic preview browser: ${chrome}`);
  console.log(JSON.stringify(result));
  console.log("Metallic preview browser checks passed.");
} finally {
  rmSync(temp, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
}
