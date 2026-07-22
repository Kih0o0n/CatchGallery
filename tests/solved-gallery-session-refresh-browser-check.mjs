import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const app = readFileSync(new URL("../app.js", import.meta.url), "utf8");
const styles = readFileSync(new URL("../styles.css", import.meta.url), "utf8");
function pick(name) {
  const markers = [`async function ${name}(`, `function ${name}(`];
  const start = markers.map(marker => app.indexOf(marker)).find(index => index >= 0);
  assert.notEqual(start, undefined, `${name} must exist`);
  const bodyStart = app.indexOf("{", start); let depth = 0;
  for (let index = bodyStart; index < app.length; index++) {
    if (app[index] === "{") depth++;
    else if (app[index] === "}" && --depth === 0) return app.slice(start, index + 1);
  }
  throw new Error(`could not extract ${name}`);
}
const names = [
  "drawingOwnerId", "isOwnDrawing", "normalizedArtistName", "hasViewableArtist", "galleryArtistIdentity", "isDrawingByArtist",
  "galleryDisplayTime", "sortGalleryDrawings", "finalizedDrawingFreshness", "currentRecentFinalizedDrawing", "applyCachedLikeToDrawing",
  "mergeRecentFinalizedDrawings", "cacheRecentFinalizedDrawing", "removeRecentFinalizedDrawing", "invalidateGalleryListsByStatus",
  "loadGalleryMetadata", "loadGalleryDrawings", "loadGalleryArtistDrawings", "loadOpenDrawings", "likeAccessibilityLabel",
  "galleryArtistButton", "galleryThumbs", "renderGalleryContent", "submitAnswer", "toggleLike", "resetUserSessionCaches", "setCacheSession", "isCacheSessionCurrent"
];
const sources = names.map(pick).join("\n");
const chromeCandidates = process.platform === "win32" ? [
  process.env.CHROME_PATH,
  join(process.env.PROGRAMFILES || "C:\\Program Files", "Google", "Chrome", "Application", "chrome.exe"),
  join(process.env["PROGRAMFILES(X86)"] || "C:\\Program Files (x86)", "Google", "Chrome", "Application", "chrome.exe"),
  join(process.env.LOCALAPPDATA || "", "Google", "Chrome", "Application", "chrome.exe")
] : [process.env.CHROME_PATH, "/usr/bin/google-chrome", "/usr/bin/chromium"];
const chrome = chromeCandidates.find(value => value && existsSync(value));
if (!chrome) {
  const message = "Solved gallery session refresh browser check requires installed Chrome/Chromium.";
  if (process.env.REQUIRE_SOLVED_GALLERY_SESSION_BROWSER_TEST === "1") throw new Error(message);
  console.log(`${message} Skipped.`); process.exit(0);
}

const directory = mkdtempSync(join(tmpdir(), "catchgallery-solved-session-"));
try {
  const fixture = join(directory, "fixture.html");
  writeFileSync(fixture, `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><style>${styles}</style><body><output id="result"></output><script>
const failures=[];addEventListener('error',event=>failures.push(String(event.error||event.message)));addEventListener('unhandledrejection',event=>failures.push(String(event.reason)));
const RECENT_FINALIZED_DRAWING_TTL_MS=600000,RECENT_FINALIZED_DRAWING_MARKER=Symbol('recent-finalized-drawing'),nowRef={value:2000};
const safeObject=value=>value&&typeof value==='object'?value:{},isSafeRecordId=value=>typeof value==='string'&&/^[A-Za-z0-9_-]{1,80}$/.test(value),hasPublicDrawingImage=d=>!!d?.imageData||d?.imageReady===true;
const drawerName=d=>d.drawerNickname||d.drawerDisplayName||'알 수 없음',escapeHtml=value=>String(value),escapeAttribute=value=>String(value),emptyHtml=()=>'<p>empty</p>',serverNow=()=>nowRef.value,normalizeAnswer=value=>String(value||'').trim().toLowerCase();
const state={user:{id:'solver-a',nickname:'풀이자'},cacheOwnerUid:'solver-a',cacheGeneration:7,galleryTab:'solved',gallerySort:'new',galleryView:'thumb',galleryIndex:0,galleryArtistDrawingId:null,galleryArtist:null,galleryLists:{},galleryMetadata:{},galleryMetadataPromises:{},galleryScroll:{},recentFinalizedDrawings:new Map(),likeCache:new Map(),pendingLikes:new Set(),pendingLikeOwners:new Map(),thumbnailCache:new Map(),detailImageCache:new Map(),hintUsed:{},feedbackBodyCache:new Map(),feedbackBodyPromises:new Map(),feedbackPending:new Map()};
let drawingX={status:'open',imageReady:true,drawerId:'artist-a',drawerNickname:'작가A',word:'answer',answers:['answer'],expiresAt:9000,createdAt:100};let solvedRecords={},expiredRecords={},openRecords={'drawing-x':drawingX,'drawing-y':{status:'open',imageReady:true,drawerId:'artist-b',drawerNickname:'작가B',word:'other',expiresAt:9000,createdAt:50}},queryQueue=[];
const snap=records=>({forEach(callback){for(const [key,value] of Object.entries(records))callback({key,val:()=>value})}}),deferred=()=>{let resolve;const promise=new Promise(done=>resolve=done);return{promise,resolve}};
const query=status=>({once:()=>queryQueue.length?queryQueue.shift().promise:Promise.resolve(snap(status==='solved'?solvedRecords:status==='expired'?expiredRecords:openRecords))});
const db={ref:path=>{
 if(path==='drawings/drawing-x')return{once:async()=>({val:()=>drawingX}),transaction:async update=>{const next=update(drawingX);if(next===undefined)return{committed:false,snapshot:{val:()=>drawingX}};drawingX=next;return{committed:true,snapshot:{val:()=>drawingX}}}};
 if(path==='drawings')return{orderByChild:()=>({equalTo:status=>query(status)})};
 if(path==='drawingLikes/drawing-x/solver-a')return{transaction:async update=>({committed:update(null)===true})};
 return{once:async()=>({exists:()=>true,val:()=>null})};
}};
const expireOldDrawings=async()=>({snapshot:snap(openRecords)}),ensureLikeState=async id=>state.likeCache.get(id)||{count:0,liked:false},resolveDrawingId=async id=>id,loadRecentSolverSuccessCount=async()=>0,solverRewardFor=()=>10,isConfigured=()=>true,claimAnswerRewards=async()=>{},showToast=()=>{},bindGalleryContent=()=>{},performance=globalThis.performance;
const cancelFeedbackLoading=()=>{};state.answerSuccessModalCleanup=null;const cancelSolveImageLoading=()=>{};
${sources}
(async()=>{try{
 const before=await loadGalleryDrawings('solved','new');
 const answer=await submitAnswer('drawing-x','answer',false);
 const modalPreserved=answer.correct&&answer.likeDrawing?.status==='solved';
 await toggleLike('drawing-x',answer.likeDrawing);invalidateGalleryListsByStatus('solved');
 const after=await loadGalleryDrawings('solved','new');
 document.body.insertAdjacentHTML('beforeend','<section class="gallery-screen"><div id="galleryContent"></div></section>');renderGalleryContent(after);
 const immediate={ids:after.map(d=>d.id),card:!!document.querySelector('[data-gallery-card="drawing-x"]'),liked:document.querySelector('[data-like="drawing-x"]')?.classList.contains('is-liked'),count:document.querySelector('[data-like="drawing-x"] [data-like-count]')?.textContent};
 document.querySelector('.gallery-screen').remove();document.body.insertAdjacentHTML('beforeend','<section data-route-cycle="ranking"></section>');document.querySelector('[data-route-cycle]').remove();
 const afterRoutes=await loadGalleryDrawings('solved','new');
 const openAfter=await loadOpenDrawings('new');
 state.galleryArtistDrawingId='drawing-x';state.galleryArtist=null;const artist=await loadGalleryArtistDrawings('new');
 const otherArtist=artist.filter(d=>drawingOwnerId(d)==='artist-b');
 state.galleryArtistDrawingId=null;
 const a=deferred(),b=deferred();state.galleryMetadata={};state.galleryMetadataPromises={};queryQueue=[a,b];const pendingA=loadGalleryMetadata('solved');invalidateGalleryListsByStatus('solved');cacheRecentFinalizedDrawing('drawing-x',answer.likeDrawing);invalidateGalleryListsByStatus('solved');const pendingB=loadGalleryMetadata('solved');b.resolve(snap({}));const listB=await pendingB;a.resolve(snap({}));const listA=await pendingA;
 state.galleryMetadata={};state.galleryMetadataPromises={};solvedRecords={'drawing-x':drawingX};const normalized=await loadGalleryMetadata('solved');
 state.galleryMetadata={};state.galleryMetadataPromises={};cacheRecentFinalizedDrawing('drawing-x',drawingX);state.user={id:'solver-b',nickname:'B'};setCacheSession('solver-b');
 const resultValue={before:before.length,modalPreserved,immediate,afterRoutes:afterRoutes.map(d=>d.id),openAfter:openAfter.map(d=>d.id),artist:artist.map(d=>d.id),otherArtist:otherArtist.map(d=>d.id),raceA:listA.map(d=>d.id),raceB:listB.map(d=>d.id),normalized:normalized.map(d=>d.id),overlayAfterSession:state.recentFinalizedDrawings.size,overflow:document.documentElement.scrollWidth>innerWidth+1,failures};
 result.textContent=encodeURIComponent(JSON.stringify(resultValue));
}catch(error){result.textContent=encodeURIComponent(JSON.stringify({error:error.stack||String(error),failures}))}})();
</script>`);
  const output = execFileSync(chrome, ["--headless=new", "--disable-gpu", "--no-sandbox", "--no-first-run", "--disable-background-networking", "--window-size=390,844", `--user-data-dir=${join(directory, "profile")}`, "--dump-dom", pathToFileURL(fixture).href], { encoding: "utf8", timeout: 60_000 });
  const encoded = output.match(/<output id="result">([^<]+)<\/output>/)?.[1] || "";
  const result = JSON.parse(decodeURIComponent(encoded));
  assert.ok(!result.error, result.error);
  assert.equal(result.before, 0);
  assert.equal(result.modalPreserved, true);
  assert.deepEqual(result.immediate, { ids: ["drawing-x"], card: true, liked: true, count: "1" });
  assert.deepEqual(result.afterRoutes, ["drawing-x"]);
  assert.deepEqual(result.openAfter, ["drawing-y"]);
  assert.deepEqual(result.artist, ["drawing-x"]);
  assert.deepEqual(result.otherArtist, []);
  assert.deepEqual(result.raceA, ["drawing-x"]);
  assert.deepEqual(result.raceB, ["drawing-x"]);
  assert.deepEqual(result.normalized, ["drawing-x"]);
  assert.equal(result.overlayAfterSession, 0);
  assert.equal(result.overflow, false);
  assert.deepEqual(result.failures, []);
  console.log(`Solved gallery session refresh browser: ${chrome}`);
  console.log(JSON.stringify(result));
  console.log("Solved gallery session refresh browser checks passed.");
} finally {
  rmSync(directory, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
}
