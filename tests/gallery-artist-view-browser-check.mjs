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
  const bodyStart = app.indexOf(") {", start) + 2;
  assert.ok(bodyStart > 1, `${name} body must exist`);
  let depth = 0, opened = false;
  for (let index = bodyStart; index < app.length; index++) {
    if (app[index] === "{") { depth++; opened = true; }
    else if (app[index] === "}" && opened && --depth === 0) return app.slice(start, index + 1);
  }
  throw new Error(`could not extract ${name}`);
}

const candidates = process.platform === "win32" ? [
  process.env.CHROME_PATH, process.env.GOOGLE_CHROME_BIN,
  join(process.env.PROGRAMFILES || "C:\\Program Files", "Google", "Chrome", "Application", "chrome.exe"),
  join(process.env["PROGRAMFILES(X86)"] || "C:\\Program Files (x86)", "Google", "Chrome", "Application", "chrome.exe"),
  join(process.env.LOCALAPPDATA || "", "Google", "Chrome", "Application", "chrome.exe")
] : [process.env.CHROME_PATH, process.env.GOOGLE_CHROME_BIN, "/usr/bin/google-chrome", "/usr/bin/google-chrome-stable", "/usr/bin/chromium"];
const chrome = candidates.find(candidate => candidate && existsSync(candidate));
if (!chrome) {
  const message = "Gallery artist browser check skipped: Chrome/Chromium was not found.";
  if (process.env.REQUIRE_GALLERY_ARTIST_BROWSER_TEST === "1") throw new Error(message);
  console.log(message);
  process.exit(0);
}

const sources = ["normalizedArtistName", "hasViewableArtist", "galleryArtistIdentity", "isDrawingByArtist", "galleryDisplayTime", "sortGalleryDrawings", "likeAccessibilityLabel", "galleryArtistButton", "galleryThumbs", "galleryFrame", "galleryListKey", "fullGalleryHistoryState", "validGalleryReturnState", "galleryHistoryState", "openGalleryArtist", "showFullGallery", "returnFromArtistGallery", "returnFromArtistDetail"].map(pick).join("\n");
const directory = mkdtempSync(join(tmpdir(), "catchgallery-gallery-artist-"));
const file = join(directory, "check.html");
const html = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><style>${styles}#result{display:none}</style><button id="appBack">뒤로</button><main id="app"></main><div style="height:900px"></div><pre id="result"></pre><script>
const testWidth=Number(new URL(location.href).searchParams.get('width'))||innerWidth;document.documentElement.style.width=testWidth+'px';document.body.style.width=testWidth+'px';
const errors=[]; addEventListener('error',event=>errors.push(event.message));
const drawerName=d=>d.drawerNickname||d.drawerDisplayName||'알 수 없음',solverName=d=>d.solverNickname||'알 수 없음';
const drawingOwnerId=d=>d?.drawerId||d?.drawerUid||d?.ownerUid||d?.authorUid||d?.userId||null;
const isSafeRecordId=value=>typeof value==='string'&&/^[A-Za-z0-9_-]{1,80}$/.test(value);
const escapeHtml=value=>String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'),escapeAttribute=value=>escapeHtml(value).replace(/"/g,'&quot;');
const state={galleryTab:'solved',gallerySort:'new',galleryArtistDrawingId:null,galleryArtist:null,galleryHasGalleryBack:false,galleryScroll:{},galleryView:'thumb',galleryIndex:0,user:{id:'viewer'},isAdmin:true};
const isOwnDrawing=d=>drawingOwnerId(d)===state.user.id;
${sources}
const selected={id:'selected',status:'solved',drawerId:'uid-a',drawerNickname:'여덟글자작가님',solverNickname:'solver',word:'정답',solvedAt:50,likeCount:2,isLiked:false,imageReady:true};
const drawings=[selected,{id:'expired',status:'expired',drawerId:'uid-a',drawerNickname:'바뀐이름',word:'둘',expiredAt:40,likeCount:5,isLiked:false,imageReady:true},{id:'legacy',status:'expired',drawerNickname:'여덟글자작가님',word:'셋',expiredAt:30,likeCount:2,isLiked:false,imageReady:true},{id:'other',status:'solved',drawerId:'uid-b',drawerNickname:'여덟글자작가님',word:'넷',solvedAt:60,likeCount:9,isLiked:false,imageReady:true},{id:'unknown',status:'solved',drawerNickname:'알 수 없음',word:'다섯',solvedAt:20,likeCount:0,isLiked:false,imageReady:true}];
let currentList=drawings,detailOpens=0,likeCalls=0,deleteCalls=0,pending=false,renderToken=0; const scrolls={full:0,artist:0};
const appEl=document.querySelector('#app');
function scopeKey(){return state.galleryArtistDrawingId?'artist':'full'}
function artistList(){const artist=galleryArtistIdentity(selected);return drawings.filter(d=>['solved','expired'].includes(d.status)&&isDrawingByArtist(d,artist))}
function historyState(){return galleryHistoryState(state.galleryView==='frame')}
function applyHistory(value){const artistId=value?.galleryArtist===true?value.galleryArtistDrawingId:null;if(state.galleryArtistDrawingId!==artistId)state.galleryHasGalleryBack=false;state.galleryArtistDrawingId=artistId;state.galleryArtist=artistId?galleryArtistIdentity(selected):null;state.galleryView=value?.galleryDetail===true?'frame':'thumb';state.galleryIndex=value?.galleryIndex||0;state.gallerySort=value?.gallerySort||'new';state.galleryTab=value?.galleryTab||'solved';render()}
addEventListener('popstate',event=>applyHistory(event.state||fullGalleryHistoryState(false)));
function renderGallery(){render()}
function bind(){
 document.querySelectorAll('[data-thumb]').forEach(button=>button.onclick=()=>{scrolls[scopeKey()]=scrollY;state.galleryIndex=Number(button.dataset.thumb);state.galleryView='frame';detailOpens++;history.pushState(galleryHistoryState(true,{galleryHasArtistListBack:!!state.galleryArtistDrawingId}),'','#gallery');render()});
 document.querySelectorAll('[data-artist-drawing]').forEach(button=>button.onclick=event=>{event.stopPropagation();const drawing=currentList.find(d=>d.id===button.dataset.artistDrawing);if(drawing)openGalleryArtist(drawing)});
 document.querySelectorAll('[data-like]').forEach(button=>button.onclick=async event=>{event.stopPropagation();if(pending)return;pending=true;likeCalls++;await Promise.resolve();const d=currentList.find(item=>item.id===button.dataset.like);if(d){d.isLiked=!d.isLiked;d.likeCount+=d.isLiked?1:-1}pending=false;render()});
 document.querySelector('[data-prev]')?.addEventListener('click',()=>{state.galleryIndex--;history.replaceState(galleryHistoryState(true),'','#gallery');render()});
 document.querySelector('[data-next]')?.addEventListener('click',()=>{state.galleryIndex++;history.replaceState(galleryHistoryState(true),'','#gallery');render()});
 document.querySelectorAll('[data-admin-delete]').forEach(button=>button.onclick=()=>{deleteCalls++;const index=drawings.findIndex(d=>d.id===button.dataset.adminDelete);if(index>=0)drawings.splice(index,1);render()});
 document.querySelector('#sort')?.addEventListener('change',event=>{state.gallerySort=event.target.value;state.galleryIndex=0;history.replaceState(galleryHistoryState(false),'','#gallery');render()});
 document.querySelector('[data-return]')?.addEventListener('click',returnFromArtistGallery);
}
function render(){currentList=sortGalleryDrawings(state.galleryArtistDrawingId?artistList():drawings,state.gallerySort);if(state.galleryIndex>=currentList.length)state.galleryIndex=0;const artist=!!state.galleryArtistDrawingId;appEl.innerHTML='<section class="screen gallery-screen '+(artist?'gallery-artist-screen ':'')+(state.galleryView==='frame'?'gallery-detail':'')+'">'+(artist&&state.galleryView==='thumb'?'<button data-return class="gallery-return-button">← 전체 전시장으로</button>':'')+(artist?'<h2>'+escapeHtml(state.galleryArtist.name)+'님의 작품</h2><p>완성 액자와 미해결 그림을 함께 보여드려요.</p>':'<h2>전시장</h2><div class="tabs"><button>완성 액자</button><button>미해결 그림</button></div>')+'<select id="sort"><option value="new">최신순</option><option value="old">과거순</option><option value="popular">인기순</option></select><div id="content">'+(state.galleryView==='frame'?galleryFrame(currentList,state.galleryIndex):galleryThumbs(currentList))+'</div></section>';document.querySelector('#sort').value=state.gallerySort;bind()}
let backTarget=null;document.querySelector('#appBack').onclick=()=>{if(backTarget)applyHistory(backTarget)};
async function run(){
 history.replaceState(historyState(),'','#gallery');render();scrollTo(0,120);const fullScroll=scrollY,fullThumbState=historyState();
 const artistButton=document.querySelector('[data-artist-drawing="selected"]'),artistHeight=getComputedStyle(artistButton).minHeight;artistButton.click();
 const artistOpened={detailOpens,likeCalls,title:document.querySelector('h2').textContent,tabs:!!document.querySelector('.tabs'),ids:currentList.map(d=>d.id),badges:[...document.querySelectorAll('.gallery-status-badge')].map(e=>e.textContent),buttonHeight:artistHeight};
 for(const sort of ['old','popular','new']){const select=document.querySelector('#sort');select.value=sort;select.dispatchEvent(new Event('change'));artistOpened[sort]=currentList.map(d=>d.id)}
 {const select=document.querySelector('#sort');select.value='popular';select.dispatchEvent(new Event('change'))}
 const galleryScreen=document.querySelector('.gallery-screen');const noOverflow=[galleryScreen,...galleryScreen.querySelectorAll('*')].every(element=>{const rect=element.getBoundingClientRect();return rect.left>=-1&&rect.right<=testWidth+1});const actionVisible=[...document.querySelectorAll('.artist-button-action')].every(e=>e.scrollWidth<=e.clientWidth+1);
 const artistThumbState=historyState();document.querySelector('[data-thumb="0"]').click();const artistDetailIds=currentList.map(d=>d.id),artistDetailReturnHidden=!document.querySelector('[data-return]');const nextDisabled=document.querySelector('[data-next]').disabled;if(!nextDisabled)document.querySelector('[data-next]').click();const stayedInArtist=currentList.every(d=>d.id!=='other');
 const like=document.querySelector('[data-like]');like.click();like.click();await Promise.resolve();await Promise.resolve();const duplicateLikeCalls=likeCalls;
 backTarget=artistThumbState;document.querySelector('#appBack').click();const artistThumbRestored=state.galleryArtistDrawingId&&state.galleryView==='thumb';scrollTo(0,80);scrolls.artist=scrollY;
 backTarget=fullThumbState;document.querySelector('#appBack').click();const fullRestored=!state.galleryArtistDrawingId&&state.galleryView==='thumb',fullSortRestored=state.gallerySort==='new'&&galleryListKey()==='solved:new';scrollTo(0,state.galleryScroll['solved:new']||0);
 document.querySelector('[data-thumb="0"]').click();const fullDetailId=currentList[state.galleryIndex].id,fullDetailState=historyState();document.querySelector('[data-artist-drawing="'+fullDetailId+'"]').click();backTarget=fullDetailState;document.querySelector('#appBack').click();const fullDetailRestored=!state.galleryArtistDrawingId&&state.galleryView==='frame'&&currentList[state.galleryIndex].id===fullDetailId;
 applyHistory(fullThumbState);
 const keyboardButton=document.querySelector('[data-artist-drawing="selected"]');keyboardButton.focus();keyboardButton.click();const keyboardOpened=document.activeElement===keyboardButton||!!state.galleryArtistDrawingId;
 const token=++renderToken;let staleApplied=false;const stale=Promise.resolve().then(()=>{if(token===renderToken)staleApplied=true});renderToken++;state.galleryArtistDrawingId=null;await stale;
 render();const deleteButton=document.querySelector('[data-admin-delete="selected"]');deleteButton.click();const deleted=!drawings.some(d=>d.id==='selected');
 document.querySelector('#result').textContent=encodeURIComponent(JSON.stringify({layoutWidth:document.documentElement.getBoundingClientRect().width,scrollWidth:document.documentElement.scrollWidth,artistOpened,noOverflow,actionVisible,artistDetailIds,artistDetailReturnHidden,stayedInArtist,duplicateLikeCalls,artistThumbRestored,fullRestored,fullSortRestored,fullScrollRestored:scrollY===fullScroll,artistScroll:scrolls.artist,fullDetailRestored,keyboardOpened,staleApplied,deleteCalls,deleted,errors}));
}
run().catch(error=>{document.querySelector('#result').textContent=encodeURIComponent(JSON.stringify({fatal:error.stack||String(error),errors}))});
</script>`;
writeFileSync(file, html);
try {
  const results = [];
  for (const [width, height] of [[320,568],[360,800],[390,844],[768,1024],[1280,720],[568,320]]) {
    const dom = execFileSync(chrome, ["--headless=new", "--disable-gpu", "--no-sandbox", "--no-first-run", "--disable-background-networking", "--allow-file-access-from-files", `--window-size=${width},${height}`, "--virtual-time-budget=5000", "--dump-dom", `${pathToFileURL(file).href}?width=${width}`], { encoding: "utf8", timeout: 30000 });
    const encoded = dom.match(/<pre id="result">([^<]+)<\/pre>/)?.[1];
    assert.ok(encoded, `browser result must be present at ${width}x${height}: ${dom.slice(-2000)}`);
    results.push({ viewport: `${width}x${height}`, ...JSON.parse(decodeURIComponent(encoded)) });
  }
  const result = results[0];
  assert.equal(result.fatal, undefined, result.fatal);
  assert.equal(result.artistOpened.detailOpens, 0, "artist click does not open detail");
  assert.equal(result.artistOpened.likeCalls, 0, "artist click does not trigger like");
  assert.match(result.artistOpened.title, /님의 작품$/);
  assert.equal(result.artistOpened.tabs, false);
  assert.deepEqual(new Set(result.artistOpened.ids), new Set(["selected", "expired", "legacy"]));
  assert.deepEqual(new Set(result.artistOpened.badges), new Set(["완성 액자", "미해결 그림"]));
  assert.ok(parseFloat(result.artistOpened.buttonHeight) >= 44);
  assert.deepEqual(result.artistOpened.old, ["legacy", "expired", "selected"]);
  assert.deepEqual(result.artistOpened.popular, ["expired", "selected", "legacy"]);
  assert.deepEqual(result.artistOpened.new, ["selected", "expired", "legacy"]);
  for (const viewport of results) {
    assert.equal(viewport.layoutWidth, Number(viewport.viewport.split("x")[0]), `${viewport.viewport} layout width is exact`);
    assert.equal(viewport.noOverflow, true, `${viewport.viewport} has no horizontal overflow: scrollWidth=${viewport.scrollWidth}`);
    assert.equal(viewport.actionVisible, true, `${viewport.viewport} keeps 작품 보기 visible`);
    assert.deepEqual(viewport.errors, [], `${viewport.viewport} has no fatal console errors`);
  }
  assert.ok(result.artistDetailIds.every(id => id !== "other"));
  assert.equal(result.artistDetailReturnHidden, true);
  assert.equal(result.stayedInArtist, true);
  assert.equal(result.duplicateLikeCalls, 1);
  assert.equal(result.artistThumbRestored, true);
  assert.equal(result.fullRestored, true);
  assert.equal(result.fullSortRestored, true);
  assert.equal(result.fullScrollRestored, true);
  assert.ok(result.artistScroll >= 0);
  assert.equal(result.fullDetailRestored, true);
  assert.equal(result.keyboardOpened, true);
  assert.equal(result.staleApplied, false);
  assert.equal(result.deleteCalls, 1);
  assert.equal(result.deleted, true);
  console.log("Gallery artist view Chrome checks passed.");
} finally {
  rmSync(directory, { recursive: true, force: true });
}
