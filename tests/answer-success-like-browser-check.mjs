import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const app = readFileSync(new URL("../app.js", import.meta.url), "utf8");
const styles = readFileSync(new URL("../styles.css", import.meta.url), "utf8");
function pick(name) {
  const marker = app.includes(`async function ${name}(`) ? `async function ${name}(` : `function ${name}(`;
  const start = app.indexOf(marker);
  assert.notEqual(start, -1, `${name} must exist`);
  const bodyStart = app.indexOf(") {", start) + 2;
  let depth = 0;
  for (let index = bodyStart; index < app.length; index++) {
    if (app[index] === "{") depth++;
    else if (app[index] === "}" && --depth === 0) return app.slice(start, index + 1);
  }
  throw new Error(`could not extract ${name}`);
}

const candidates = process.platform === "win32" ? [
  process.env.CHROME_PATH, process.env.GOOGLE_CHROME_BIN,
  join(process.env.PROGRAMFILES || "C:\\Program Files", "Google", "Chrome", "Application", "chrome.exe"),
  join(process.env["PROGRAMFILES(X86)"] || "C:\\Program Files (x86)", "Google", "Chrome", "Application", "chrome.exe")
] : [process.env.CHROME_PATH, process.env.GOOGLE_CHROME_BIN, "/usr/bin/google-chrome", "/usr/bin/chromium"];
const chrome = candidates.find(candidate => candidate && existsSync(candidate));
if (!chrome) {
  const message = "Answer success like browser check skipped: Chrome/Chromium was not found.";
  if (process.env.REQUIRE_ANSWER_SUCCESS_LIKE_BROWSER_TEST === "1") throw new Error(message);
  console.log(message);
  process.exit(0);
}

const sources = ["isCacheSessionCurrent", "likeAccessibilityLabel", "updateLikeButtonAccessibility", "ensureLikeState", "syncGalleryLike", "syncAnswerSuccessLikeAvailability", "toggleLike", "showAnswerSuccessModal"].map(pick).join("\n");
const directory = mkdtempSync(join(tmpdir(), "catchgallery-answer-like-"));
const file = join(directory, "check.html");
const html = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><style>${styles}#result{display:none}</style><main id="modalRoot"></main><pre id="result"></pre><script>
const errors=[];addEventListener('error',event=>errors.push(event.message));
const state={user:{id:'viewer'},cacheOwnerUid:'viewer',cacheGeneration:1,likeCache:new Map(),galleryLists:{one:[{id:'safe-id'}]},galleryMetadata:{solved:[{id:'safe-id'}]},pendingLikes:new Set(),answerSuccessModalCleanup:null};
const safeObject=value=>value&&typeof value==='object'?value:{},escapeHtml=value=>String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const isSafeRecordId=value=>typeof value==='string'&&/^[A-Za-z0-9_-]{1,80}$/.test(value),drawingOwnerId=d=>d?.drawerId||null,isOwnDrawing=d=>drawingOwnerId(d)===state.user?.id;
const userErrorMessage=(error,fallback)=>error?.message||fallback,showToast=()=>{};
let likes={other:true},readFails=0,toggleFails=0,transactions=0,drawingReads=0,readGate=null,transactionGate=null;
const snapshot=value=>({val:()=>value});
const db={ref:path=>({once:async()=>{if(path.startsWith('drawings/'))drawingReads++;if(readGate)await readGate;if(readFails-->0)throw new Error('read failed');return snapshot(likes)},transaction:async update=>{transactions++;if(transactionGate)await transactionGate;if(toggleFails-->0)throw new Error('toggle failed');const current=likes.viewer===true?true:null;const next=update(current);if(next===true)likes.viewer=true;else delete likes.viewer;return{committed:true}}})};
${sources}
const resultData={correct:true,drawingId:'safe-id',likeDrawing:{id:'safe-id',status:'solved',drawerId:'artist',imageReady:true},solverReward:10,drawerReward:30,drawerNickname:'여덟글자작가님'};
const tick=()=>new Promise(resolve=>setTimeout(resolve,0));
async function run(){
 showAnswerSuccessModal(resultData);
 const immediate={shown:!!document.querySelector('.answer-success-modal'),likeDisabled:document.querySelector('[data-like]').disabled,closeEnabled:!document.querySelector('[data-success-close]').disabled,focus:document.activeElement===document.querySelector('[data-success-close]')};
 await tick();await tick();
 let button=document.querySelector('[data-like]');const loaded={count:button.querySelector('[data-like-count]').textContent,pressed:button.getAttribute('aria-pressed'),label:button.getAttribute('aria-label'),lists:state.galleryLists.one[0].likeCount,metadata:state.galleryMetadata.solved[0].likeCount};
 button.click();await tick();await tick();button=document.querySelector('[data-like]');const liked={count:button.querySelector('[data-like-count]').textContent,pressed:button.getAttribute('aria-pressed'),label:button.getAttribute('aria-label'),heart:button.querySelector('.heart').textContent,transactions};
 button.click();button.click();await tick();await tick();button=document.querySelector('[data-like]');const doubleClick={count:button.querySelector('[data-like-count]').textContent,pressed:button.getAttribute('aria-pressed'),label:button.getAttribute('aria-label'),transactions};
 toggleFails=1;button.click();await tick();await tick();button=document.querySelector('[data-like]');const failed={modal:!!document.querySelector('.answer-success-modal'),enabled:!button.disabled,status:document.querySelector('[data-success-like-status]').textContent,transactions};
 button.click();await tick();await tick();const retried={pressed:document.querySelector('[data-like]').getAttribute('aria-pressed'),transactions};
 state.likeCache.clear();likes={other:true};readFails=1;showAnswerSuccessModal(resultData);await tick();await tick();const loadFailure={retry:!!document.querySelector('[data-success-like-retry]'),count:document.querySelector('[data-like-count]').textContent,label:document.querySelector('[data-like]').getAttribute('aria-label'),disabled:document.querySelector('[data-like]').disabled};document.querySelector('[data-success-like-retry]').click();await tick();await tick();const loadRetry={count:document.querySelector('[data-like-count]').textContent,enabled:!document.querySelector('[data-like]').disabled};
 showAnswerSuccessModal({...resultData,drawingId:'unsafe/id'});const unsafeHidden=!document.querySelector('[data-like]');
 showAnswerSuccessModal(resultData);await tick();document.querySelector('[data-success-close]').click();const closeWorks=!document.querySelector('.answer-success-modal');
 showAnswerSuccessModal(resultData);await tick();document.querySelector('.answer-success-backdrop').click();const backdropWorks=!document.querySelector('.answer-success-modal');
 showAnswerSuccessModal(resultData);await tick();document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'}));const escapeWorks=!document.querySelector('.answer-success-modal');
 let release;readGate=new Promise(resolve=>release=resolve);state.likeCache.clear();showAnswerSuccessModal(resultData);document.querySelector('[data-success-close]').click();release();await tick();await tick();const detachedSafe=!document.querySelector('.answer-success-modal');
 let releaseReplacement;readGate=new Promise(resolve=>releaseReplacement=resolve);showAnswerSuccessModal(resultData);document.querySelector('#modalRoot').innerHTML='<div id="replacement">replacement</div>';releaseReplacement();await tick();await tick();const replacementSafe=document.querySelector('#replacement')?.textContent==='replacement';readGate=null;
 let releaseSession;readGate=new Promise(resolve=>releaseSession=resolve);state.likeCache.clear();showAnswerSuccessModal(resultData);state.cacheGeneration++;releaseSession();await tick();await tick();const sessionStale=document.querySelector('[data-like-count]').textContent==='…'&&document.querySelector('[data-like]').disabled;state.answerSuccessModalCleanup?.();readGate=null;
 const galleryHost=document.createElement('div');document.body.append(galleryHost);galleryHost.innerHTML='<button data-like="safe-id"><span class="heart">♡</span><span data-like-count>0</span></button><button data-like="safe-id" data-own-like="true" disabled><span class="heart">♡</span><span data-like-count>0</span></button>';state.likeCache.set('safe-id',{count:3,liked:false});syncGalleryLike('safe-id');const galleryLabelsBefore=[...galleryHost.querySelectorAll('[data-like]')].map(item=>item.getAttribute('aria-label'));state.likeCache.set('safe-id',{count:4,liked:true});syncGalleryLike('safe-id');const galleryLabelsAfter=[...galleryHost.querySelectorAll('[data-like]')].map(item=>item.getAttribute('aria-label'));const galleryAccessibility={before:galleryLabelsBefore,after:galleryLabelsAfter};
 state.likeCache.clear();likes={other:true,viewer:true};let releaseNavigatedRead;readGate=new Promise(resolve=>releaseNavigatedRead=resolve);showAnswerSuccessModal(resultData);document.querySelector('[data-success-close]').click();galleryHost.innerHTML='<button data-like="safe-id" aria-pressed="false"><span class="heart">♡</span><span data-like-count>0</span></button>';releaseNavigatedRead();await tick();await tick();readGate=null;const navigatedReadGallery={modalGone:!document.querySelector('.answer-success-modal'),heart:galleryHost.querySelector('.heart').textContent,count:galleryHost.querySelector('[data-like-count]').textContent,pressed:galleryHost.querySelector('[data-like]').getAttribute('aria-pressed')};
 state.likeCache.set('safe-id',{count:1,liked:false});likes={other:true};showAnswerSuccessModal(resultData);await tick();await tick();let releaseClosedToggle;transactionGate=new Promise(resolve=>releaseClosedToggle=resolve);document.querySelector('[data-answer-success-like]').click();await tick();document.querySelector('[data-success-close]').click();galleryHost.innerHTML='<button data-like="safe-id" aria-pressed="false"><span class="heart">♡</span><span data-like-count>1</span></button>';releaseClosedToggle();await tick();await tick();transactionGate=null;const closedToggleGallery={modalGone:!document.querySelector('.answer-success-modal'),heart:galleryHost.querySelector('.heart').textContent,count:galleryHost.querySelector('[data-like-count]').textContent,pressed:galleryHost.querySelector('[data-like]').getAttribute('aria-pressed')};
 showAnswerSuccessModal(resultData);await tick();await tick();let releaseSame;transactionGate=new Promise(resolve=>releaseSame=resolve);document.querySelector('[data-answer-success-like]').click();await tick();document.querySelector('[data-success-close]').click();showAnswerSuccessModal(resultData);await tick();await tick();const samePending=document.querySelector('[data-answer-success-like]').disabled;releaseSame();await tick();await tick();transactionGate=null;const sameReplacement={pending:samePending,enabled:!document.querySelector('[data-answer-success-like]').disabled,count:document.querySelector('[data-like-count]').textContent,pressed:document.querySelector('[data-answer-success-like]').getAttribute('aria-pressed'),status:document.querySelector('[data-success-like-status]').textContent};
 showAnswerSuccessModal(resultData);await tick();await tick();let releaseOther;transactionGate=new Promise(resolve=>releaseOther=resolve);document.querySelector('[data-answer-success-like]').click();await tick();document.querySelector('[data-success-close]').click();const otherResult={...resultData,drawingId:'other-id',likeDrawing:{...resultData.likeDrawing,id:'other-id'}};showAnswerSuccessModal(otherResult);await tick();await tick();const otherBefore={count:document.querySelector('[data-like-count]').textContent,pressed:document.querySelector('[data-answer-success-like]').getAttribute('aria-pressed')};releaseOther();await tick();await tick();transactionGate=null;const otherIsolation={before:otherBefore,after:{count:document.querySelector('[data-like-count]').textContent,pressed:document.querySelector('[data-answer-success-like]').getAttribute('aria-pressed')}};
 state.answerSuccessModalCleanup?.();state.likeCache.set('safe-id',{count:2,liked:false});showAnswerSuccessModal(resultData);await tick();await tick();let releaseStaleToggle;transactionGate=new Promise(resolve=>releaseStaleToggle=resolve);document.querySelector('[data-answer-success-like]').click();await tick();const staleBefore=JSON.stringify(state.likeCache.get('safe-id'));state.cacheGeneration++;releaseStaleToggle();await tick();await tick();transactionGate=null;const staleToggle={cacheUnchanged:JSON.stringify(state.likeCache.get('safe-id'))===staleBefore,pendingCleared:!state.pendingLikes.has('safe-id'),buttonStillDisabled:document.querySelector('[data-answer-success-like]').disabled};state.answerSuccessModalCleanup?.();
 showAnswerSuccessModal(resultData);const modal=document.querySelector('.answer-success-modal'),rect=modal.getBoundingClientRect();const layout={overflow:document.documentElement.scrollWidth<=innerWidth+1,inside:rect.left>=0&&rect.right<=innerWidth,scrollable:modal.scrollHeight>=modal.clientHeight};
 document.querySelector('#result').textContent=encodeURIComponent(JSON.stringify({immediate,loaded,liked,doubleClick,failed,retried,loadFailure,loadRetry,unsafeHidden,closeWorks,backdropWorks,escapeWorks,detachedSafe,replacementSafe,sessionStale,galleryAccessibility,navigatedReadGallery,closedToggleGallery,sameReplacement,otherIsolation,staleToggle,drawingReads,layout,errors}));
}
run().catch(error=>document.querySelector('#result').textContent=encodeURIComponent(JSON.stringify({fatal:error.stack||String(error),errors})));
</script>`;
writeFileSync(file, html);
try {
  const results=[];
  for(const [width,height] of [[320,568],[360,800],[390,844],[768,1024],[1280,720],[568,320]]){
    const dom=execFileSync(chrome,["--headless=new","--disable-gpu","--no-sandbox","--no-first-run","--disable-background-networking",`--window-size=${width},${height}`,"--virtual-time-budget=5000","--dump-dom",pathToFileURL(file).href],{encoding:"utf8",timeout:30000});
    const encoded=dom.match(/<pre id="result">([^<]+)<\/pre>/)?.[1];assert.ok(encoded,`missing result ${width}x${height}`);results.push({viewport:`${width}x${height}`,...JSON.parse(decodeURIComponent(encoded))});
  }
  const result=results[0];assert.equal(result.fatal,undefined,result.fatal);
  assert.deepEqual(result.immediate,{shown:true,likeDisabled:true,closeEnabled:true,focus:true});
  assert.deepEqual(result.loaded,{count:"1",pressed:"false",label:"좋아요, 현재 1개",lists:1,metadata:1});
  assert.deepEqual(result.liked,{count:"2",pressed:"true",label:"좋아요 취소, 현재 2개",heart:"♥",transactions:1});
  assert.deepEqual(result.doubleClick,{count:"1",pressed:"false",label:"좋아요, 현재 1개",transactions:2});
  assert.equal(result.failed.modal,true);assert.equal(result.failed.enabled,true);assert.equal(result.failed.status,"좋아요를 바꾸지 못했어요. 다시 시도해 주세요.");assert.equal(result.retried.pressed,"true");
  assert.deepEqual(result.loadFailure,{retry:true,count:"…",label:"좋아요 상태를 불러오지 못함",disabled:true});assert.deepEqual(result.loadRetry,{count:"1",enabled:true});
  assert.equal(result.unsafeHidden,true);assert.equal(result.closeWorks,true);assert.equal(result.backdropWorks,true);assert.equal(result.escapeWorks,true);
  assert.equal(result.detachedSafe,true);assert.equal(result.replacementSafe,true);assert.equal(result.sessionStale,true);
  assert.deepEqual(result.galleryAccessibility,{before:["좋아요, 현재 3개","좋아요 3개 · 내 그림에는 좋아요를 누를 수 없음"],after:["좋아요 취소, 현재 4개","좋아요 4개 · 내 그림에는 좋아요를 누를 수 없음"]});
  assert.deepEqual(result.navigatedReadGallery,{modalGone:true,heart:"♥",count:"2",pressed:"true"});
  assert.deepEqual(result.closedToggleGallery,{modalGone:true,heart:"♥",count:"2",pressed:"true"});
  assert.deepEqual(result.sameReplacement,{pending:true,enabled:true,count:"1",pressed:"false",status:""});
  assert.deepEqual(result.otherIsolation.before,result.otherIsolation.after);
  assert.deepEqual(result.staleToggle,{cacheUnchanged:true,pendingCleared:true,buttonStillDisabled:true});
  assert.equal(result.drawingReads,0);
  for(const item of results){assert.equal(item.layout.overflow,true,item.viewport);assert.equal(item.layout.inside,true,item.viewport);assert.deepEqual(item.errors,[],item.viewport)}console.log("Answer success like Chrome checks passed.");
} finally { rmSync(directory,{recursive:true,force:true}); }
