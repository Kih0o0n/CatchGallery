/* 캐치갤러리 Firebase 설정: 아래 값을 내 Firebase 프로젝트 설정으로 교체하세요. */
const FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const WORDS = [
  ["바나나","음식"],["김밥","음식"],["떡볶이","음식"],["수박","음식"],["붕어빵","음식"],["라면","음식"],["딸기","음식"],["달걀프라이","음식"],
  ["고양이","동물"],["강아지","동물"],["기린","동물"],["토끼","동물"],["문어","동물"],["펭귄","동물"],["달팽이","동물"],["공룡","동물"],
  ["우산","물건"],["안경","물건"],["시계","물건"],["가방","물건"],["연필","물건"],["선풍기","물건"],["자전거","탈것"],["로켓","탈것"],
  ["무지개","자연"],["구름","자연"],["화산","자연"],["해바라기","자연"],["번개","자연"],["눈사람","계절"],["크리스마스트리","계절"],["수영","운동"]
];
const STATUS_LABEL = { open:"도전 중", solved:"완성", expired:"미해결", withdrawn:"회수됨" };
const appEl = document.querySelector("#app");
const headerEl = document.querySelector("#appHeader");
const scoreEl = document.querySelector("#headerScore");
const state = { user:null, route:"login", word:null, hintUsed:{}, galleryTab:"solved", galleryView:"frame", gallerySort:"new", galleryIndex:0, manageStatus:"open", editDrawing:null, canvas:null, ctx:null, drawing:false, dirty:false, history:[], publishing:false };
let db = null;

function firebaseReady() { return FIREBASE_CONFIG.apiKey !== "YOUR_API_KEY"; }
function initFirebase() {
  if (!firebaseReady()) return false;
  if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
  db = firebase.database(); return true;
}
function serverNow() { return Date.now(); }
function escapeHtml(value="") { const d=document.createElement("div"); d.textContent=String(value); return d.innerHTML; }
function safeObject(value) { return value && typeof value === "object" ? value : {}; }
function showToast(message) { const el=document.querySelector("#toast"); el.textContent=message; el.classList.add("show"); clearTimeout(showToast.timer); showToast.timer=setTimeout(()=>el.classList.remove("show"),2400); }
function loading() { appEl.innerHTML='<div class="loading" aria-label="불러오는 중"></div>'; }
function formatTime(expiresAt) { const ms=Number(expiresAt)-serverNow(); if(ms<=0)return "마감됨"; const h=Math.floor(ms/3600000); return h<1?"1시간 미만":`${h}시간`; }
function randomWord() { let next; do { next=WORDS[Math.floor(Math.random()*WORDS.length)]; } while(WORDS.length>1 && state.word?.[0]===next[0]); state.word=next; }
function isConfigured() { if(initFirebase()) return true; showToast("Firebase 설정을 먼저 연결해 주세요."); return false; }
function route(name, options={}) { state.route=name; if(name!=="draw") state.editDrawing=null; history.pushState({route:name},"",`#${name}`); renderRoute(options); }
window.addEventListener("popstate",()=>{ const name=location.hash.slice(1)|| (state.user?"home":"login"); state.route=name; renderRoute(); });
document.addEventListener("click",e=>{ const target=e.target.closest("[data-route]"); if(target) route(target.dataset.route); });
document.querySelector("#backButton").addEventListener("click",()=>history.back());

async function boot() {
  initFirebase();
  const saved=localStorage.getItem("catchGalleryUserId");
  if(saved && db) { loading(); try { await loadCurrentUser(saved); } catch(e) { console.error(e); } }
  const initial=state.user ? (location.hash.slice(1)||"home") : "login";
  state.route=initial; history.replaceState({route:initial},"",`#${initial}`); renderRoute();
  if(state.user && db) expireOldDrawings().catch(console.error);
}

async function createOrLoadUser(name, tag) {
  if(!isConfigured()) throw new Error("Firebase 설정이 필요합니다.");
  name=name.trim(); tag=tag.trim();
  if(!name || name.length>8 || !/^[가-힣ㄱ-ㅎㅏ-ㅣ0-9]+$/.test(name)) throw new Error("이름은 한글 또는 숫자로 입력해 주세요.");
  if(!/^\d{4}$/.test(tag)) throw new Error("숫자 태그 4자리를 입력해 주세요.");
  const userId=`${name}_${tag}`, displayName=`${name}#${tag}`, ref=db.ref(`users/${userId}`), snap=await ref.once("value");
  const now=serverNow();
  if(snap.exists()) {
    const old=snap.val();
    const updates={lastSeenAt:now};
    if(old.rankingDeleted){ updates.rankingDeleted=false; updates.rankingDeletedAt=null; updates.score=0; }
    await ref.update(updates);
  } else await ref.set({name,tag,displayName,score:0,createdAt:now,lastSeenAt:now,rankingDeleted:false,rankingDeletedAt:null});
  localStorage.setItem("catchGalleryUserId",userId); localStorage.setItem("catchGalleryDisplayName",displayName);
  await loadCurrentUser(userId); return state.user;
}
async function loadCurrentUser(userId=localStorage.getItem("catchGalleryUserId")) {
  if(!db || !userId) return null;
  const snap=await db.ref(`users/${userId}`).once("value");
  if(!snap.exists()){ localStorage.removeItem("catchGalleryUserId"); return null; }
  state.user={id:userId,...snap.val()}; scoreEl.textContent=`${state.user.score||0}점`; return state.user;
}

function renderRoute() {
  const publicRoute=state.route==="login";
  headerEl.classList.toggle("hidden",publicRoute);
  if(!publicRoute && !state.user){ state.route="login"; return renderLogin(); }
  ({login:renderLogin,home:renderHome,draw:renderDraw,solve:renderSolve,gallery:renderGallery,ranking:renderRanking,manage:renderManage,guide:renderGuide}[state.route]||renderHome)();
}
function renderLogin() {
  appEl.innerHTML=`<section class="screen center-screen"><div class="welcome-art">🖼️</div><div style="text-align:center"><h1>캐치갤러리</h1><p class="subtitle">그리고, 맞히고, 전시해요!</p></div><form id="loginForm" class="card"><label class="field-label" for="name">이름</label><div class="nickname-row"><input id="name" maxlength="8" autocomplete="nickname" placeholder="예: 기훈" required><div class="hash-input"><input id="tag" inputmode="numeric" maxlength="4" pattern="[0-9]{4}" placeholder="1234" required></div></div><p class="helper">같은 닉네임과 숫자 태그를 사용해야 점수와 그림 기록이 이어집니다.<br>다르게 쓰면 새 사용자처럼 시작될 수 있습니다.</p><button class="button primary full" type="submit">갤러리 입장하기</button></form>${firebaseReady()?"":'<div class="notice">운영자는 <b>app.js 맨 위 Firebase 설정</b>을 연결해 주세요.</div>'}</section>`;
  const form=document.querySelector("#loginForm"), nameInput=document.querySelector("#name"), tagInput=document.querySelector("#tag");
  const saved=(localStorage.getItem("catchGalleryDisplayName")||"").split("#"); if(saved.length===2){ nameInput.value=saved[0]; tagInput.value=saved[1]; }
  form.addEventListener("submit",async e=>{e.preventDefault(); const btn=e.submitter; btn.disabled=true; btn.textContent="입장하는 중…"; try{await createOrLoadUser(nameInput.value,tagInput.value); route("home");}catch(err){showToast(err.message);btn.disabled=false;btn.textContent="갤러리 입장하기";}});
}
function renderHome() {
  scoreEl.textContent=`${state.user.score||0}점`;
  appEl.innerHTML=`<section class="screen"><div class="home-greeting"><h2>${escapeHtml(state.user.displayName)}님, 반가워요!</h2><p class="muted">그림을 그리고, 다른 사람의 그림도 맞혀보세요.</p></div><div class="main-actions"><button class="main-action draw" data-route="draw"><span class="action-icon">🖍️</span><span class="action-title">그림 그리기</span><span class="action-copy">제시어를 그림으로 표현해요</span></button><button class="main-action solve" data-route="solve"><span class="action-icon">🔎</span><span class="action-title">정답 맞히기</span><span class="action-copy">이 그림은 무엇일까요?</span></button></div><div class="sub-actions"><button class="sub-action" data-route="gallery"><span>🖼️</span>전시장</button><button class="sub-action" data-route="ranking"><span>🏆</span>랭킹</button><button class="sub-action" data-route="manage"><span>📁</span>내 그림 관리</button><button class="sub-action" data-route="guide"><span>💡</span>게임설명</button></div></section>`;
}

function renderDraw() {
  if(!state.word) randomWord();
  const edit=state.editDrawing;
  appEl.innerHTML=`<section class="screen"><div class="section-head"><div><h2>${edit?"그림 수정하기":"그림 그리기"}</h2><p class="muted">손가락으로 마음껏 그려요.</p></div>${edit?"":'<button id="nextWord" class="button ghost">다음 제시어</button>'}</div><div class="card word-card"><span class="category">${escapeHtml(edit?.category||state.word[1])}</span><div class="word">${escapeHtml(edit?.word||state.word[0])}</div></div><div class="canvas-wrap"><canvas id="drawingCanvas" width="720" height="720" aria-label="그림판"></canvas></div><div class="tools"><div class="colors">${["#3e3a48","#ed5f72","#f29b38","#f0cf3a","#57b879","#45a8df","#745bc7"].map((c,i)=>`<button class="color ${i===0?"selected":""}" data-color="${c}" style="background:${c}" aria-label="색상 선택"></button>`).join("")}</div><div class="tool-grid"><input id="brushSize" type="range" min="3" max="34" value="9" aria-label="붓 굵기"><button id="eraser" class="button ghost">지우개</button><button id="undo" class="button ghost">되돌리기</button></div><button id="clearCanvas" class="button ghost full" style="margin-top:8px">전체 지우기</button></div><div class="notice">${edit?"수정할 때마다 최종 보상 -2점":"누군가 맞혀야 점수를 얻습니다.<br>힌트가 필요한 난해한 그림은 낮은 점수를 얻습니다."}</div><button id="saveDrawing" class="button primary full">${edit?"수정 저장하기":"게시하기"}</button></section>`;
  setupCanvas(edit?.imageData);
  document.querySelectorAll(".color").forEach(b=>b.onclick=()=>{document.querySelectorAll(".color").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");state.ctx.globalCompositeOperation="source-over";state.ctx.strokeStyle=b.dataset.color;});
  eraser.onclick=()=>{state.ctx.globalCompositeOperation="destination-out";};
  undo.onclick=undoCanvas; clearCanvas.onclick=()=>clearCanvasBoard(true);
  if(!edit) nextWord.onclick=()=>{ if(state.dirty && !confirm("그림을 지우고 다음 제시어를 받을까요?"))return; randomWord(); renderDraw(); };
  saveDrawing.onclick=async()=>{ if(!state.dirty){showToast(edit?"그림을 조금 수정해 주세요.":"빈 그림은 게시할 수 없어요.");return;} state.publishing=true;saveDrawing.disabled=true;saveDrawing.textContent="저장하는 중…";try{ edit?await updateDrawing(edit.id):await publishDrawing(); state.editDrawing=null; state.word=null; showToast(edit?"수정했어요!":"그림을 게시했어요!"); route("manage"); }catch(err){showToast(err.message);saveDrawing.disabled=false;saveDrawing.textContent=edit?"수정 저장하기":"게시하기";}finally{state.publishing=false;} };
}
function setupCanvas(imageData) {
  state.canvas=document.querySelector("#drawingCanvas"); state.ctx=state.canvas.getContext("2d",{willReadFrequently:true}); state.ctx.lineCap="round";state.ctx.lineJoin="round";state.ctx.strokeStyle="#3e3a48";state.ctx.lineWidth=9;state.history=[];state.dirty=false;
  const pos=e=>{const r=state.canvas.getBoundingClientRect(),p=e.touches?.[0]||e;return [(p.clientX-r.left)*state.canvas.width/r.width,(p.clientY-r.top)*state.canvas.height/r.height];};
  const start=e=>{e.preventDefault();saveHistory();state.drawing=true;const [x,y]=pos(e);state.ctx.beginPath();state.ctx.moveTo(x,y);};
  const move=e=>{if(!state.drawing)return;e.preventDefault();const[x,y]=pos(e);state.ctx.lineWidth=Number(brushSize.value);state.ctx.lineTo(x,y);state.ctx.stroke();state.dirty=true;};
  const end=e=>{if(state.drawing)e.preventDefault();state.drawing=false;state.ctx.closePath();};
  ["pointerdown"].forEach(n=>state.canvas.addEventListener(n,start));["pointermove"].forEach(n=>state.canvas.addEventListener(n,move));["pointerup","pointercancel","pointerleave"].forEach(n=>state.canvas.addEventListener(n,end));
  if(imageData){const img=new Image();img.onload=()=>{state.ctx.drawImage(img,0,0,720,720);};img.src=imageData;}
}
function saveHistory(){if(state.history.length>=15)state.history.shift();state.history.push(state.ctx.getImageData(0,0,state.canvas.width,state.canvas.height));}
function undoCanvas(){const last=state.history.pop();if(!last)return showToast("되돌릴 내용이 없어요.");state.ctx.globalCompositeOperation="source-over";state.ctx.putImageData(last,0,0);state.dirty=true;}
function clearCanvasBoard(track){if(track)saveHistory();state.ctx.clearRect(0,0,720,720);state.dirty=!!track;}
async function publishDrawing(){if(state.publishing===false)throw new Error("다시 시도해 주세요.");if(!isConfigured())throw new Error("Firebase 설정이 필요합니다.");const now=serverNow(),ref=db.ref("drawings").push(),id=ref.key;const data={word:state.word[0],category:state.word[1],imageData:state.canvas.toDataURL("image/png"),drawerId:state.user.id,drawerDisplayName:state.user.displayName,status:"open",createdAt:now,updatedAt:now,expiresAt:now+48*3600000,revisionCount:0,solverId:null,solverDisplayName:null,solvedAt:null,hintUsed:false,solverReward:0,drawerReward:0,expiredAt:null,withdrawnAt:null,likeCount:0};await db.ref().update({[`drawings/${id}`]:data,[`userDrawings/${state.user.id}/${id}`]:true});state.word=null;}

async function expireOldDrawings(){if(!db)return;const snap=await db.ref("drawings").orderByChild("status").equalTo("open").once("value"),jobs=[];snap.forEach(child=>{const d=child.val();if(!d.solverId && Number(d.expiresAt)<=serverNow())jobs.push(child.ref.transaction(cur=>cur&&cur.status==="open"&&!cur.solverId&&Number(cur.expiresAt)<=serverNow()?{...cur,status:"expired",expiredAt:serverNow(),updatedAt:serverNow()}:undefined));});await Promise.all(jobs);}
async function loadOpenDrawings(sort="new"){await expireOldDrawings();const snap=await db.ref("drawings").orderByChild("status").equalTo("open").once("value");const list=[];snap.forEach(c=>{const d=c.val();if(Number(d.expiresAt)>serverNow())list.push({id:c.key,...d});});return list.sort((a,b)=>sort==="new"?b.createdAt-a.createdAt:a.createdAt-b.createdAt);}
async function renderSolve(){if(!isConfigured()){appEl.innerHTML='<section class="screen"><div class="empty">Firebase 설정을 연결해 주세요.</div></section>';return;}loading();const sort=sessionStorage.getItem("solveSort")||"new";try{const list=await loadOpenDrawings(sort);appEl.innerHTML=`<section class="screen"><div class="section-head"><div><h2>정답 맞히기</h2><p class="muted">그림 속 제시어를 찾아보세요!</p></div></div><div class="filters"><select id="solveSort"><option value="new" ${sort==="new"?"selected":""}>최신순</option><option value="old" ${sort==="old"?"selected":""}>과거순</option></select></div><div class="notice">힌트를 보면 정답 시 6점<br>힌트 없이 맞히면 10점</div><div id="openList">${list.length?list.map(openDrawingCard).join(""):emptyHtml("🧩","아직 도전할 그림이 없어요.")}</div></section>`;solveSort.onchange=()=>{sessionStorage.setItem("solveSort",solveSort.value);renderSolve();};document.querySelectorAll("[data-hint]").forEach(b=>b.onclick=()=>{state.hintUsed[b.dataset.hint]=true;b.textContent=`카테고리: ${b.dataset.category}`;b.disabled=true;});document.querySelectorAll("[data-answer-form]").forEach(f=>f.onsubmit=async e=>{e.preventDefault();const id=f.dataset.answerForm,btn=f.querySelector("button"),input=f.querySelector("input");btn.disabled=true;try{const result=await submitAnswer(id,input.value,!!state.hintUsed[id]);if(result.correct){showToast(`정답! ${result.solverReward}점을 받았어요 🎉`);await loadCurrentUser();renderSolve();}else{showToast(result.message);input.select();btn.disabled=false;}}catch(err){showToast(err.message);btn.disabled=false;}});}catch(e){console.error(e);appEl.innerHTML=`<section class="screen">${emptyHtml("😵","그림을 불러오지 못했어요.")}</section>`;}}
function openDrawingCard(d){const mine=d.drawerId===state.user.id;return `<article class="card drawing-card"><img src="${d.imageData}" alt="${escapeHtml(d.drawerDisplayName)}님의 그림"><div class="meta"><span class="badge open">남은 시간: ${formatTime(d.expiresAt)}</span><span>그린 사람: ${escapeHtml(d.drawerDisplayName)}</span></div>${mine?'<div class="notice">내 그림은 맞힐 수 없습니다.</div>':`<button class="button secondary full" data-hint="${d.id}" data-category="${escapeHtml(d.category)}">카테고리 힌트 보기</button><form class="answer-row" data-answer-form="${d.id}"><input maxlength="30" autocomplete="off" placeholder="정답을 입력해요" aria-label="정답"><button class="button primary">정답!</button></form>`}</article>`;}
async function submitAnswer(drawingId,answer,hintUsed){answer=answer.trim();if(!answer)return {correct:false,message:"정답을 입력해 주세요."};let outcome={correct:false,message:"아쉽지만 정답이 아니에요."};const now=serverNow();const result=await db.ref().transaction(root=>{if(!root)return;const d=root.drawings?.[drawingId];if(!d){outcome.message="그림을 찾을 수 없어요.";return;}if(d.drawerId===state.user.id){outcome.message="내 그림은 맞힐 수 없습니다.";return;}if(d.status!=="open"||d.solverId){outcome.message="이미 도전이 끝난 그림이에요.";return;}if(Number(d.expiresAt)<=now){d.status="expired";d.expiredAt=now;d.updatedAt=now;outcome.message="방금 마감된 그림이에요.";return root;}if(answer!==String(d.word).trim())return;const base=hintUsed?6:10,drawerReward=Math.max(0,base-(Number(d.revisionCount)||0)*2);d.status="solved";d.solverId=state.user.id;d.solverDisplayName=state.user.displayName;d.solvedAt=now;d.updatedAt=now;d.hintUsed=hintUsed;d.solverReward=base;d.drawerReward=drawerReward;root.users=root.users||{};if(!root.users[state.user.id])return;root.users[state.user.id].score=(Number(root.users[state.user.id].score)||0)+base;if(root.users[d.drawerId])root.users[d.drawerId].score=(Number(root.users[d.drawerId].score)||0)+drawerReward;root.userSolved=root.userSolved||{};root.userSolved[state.user.id]=root.userSolved[state.user.id]||{};root.userSolved[state.user.id][drawingId]=true;outcome={correct:true,solverReward:base,drawerReward};return root;},{applyLocally:false});if(!result.committed&&outcome.correct)return {correct:false,message:"다른 사람이 먼저 맞혔어요."};return outcome;}

async function updateDrawing(drawingId){const imageData=state.canvas.toDataURL("image/png"),now=serverNow();let reason="수정할 수 없는 그림이에요.";const result=await db.ref(`drawings/${drawingId}`).transaction(d=>{if(!d)return;if(d.status!=="open"||d.drawerId!==state.user.id||d.solverId||Number(d.expiresAt)<=now)return;reason="";return {...d,imageData,updatedAt:now,revisionCount:(Number(d.revisionCount)||0)+1};},{applyLocally:false});if(!result.committed)throw new Error(reason);}
async function withdrawDrawing(drawingId){const now=serverNow();const result=await db.ref(`drawings/${drawingId}`).transaction(d=>d&&d.status==="open"&&d.drawerId===state.user.id&&!d.solverId&&Number(d.expiresAt)>now?{...d,status:"withdrawn",withdrawnAt:now,updatedAt:now}:undefined,{applyLocally:false});if(!result.committed)throw new Error("회수할 수 없는 그림이에요.");}

async function loadGalleryDrawings(status=state.galleryTab,sort=state.gallerySort){await expireOldDrawings();const snap=await db.ref("drawings").orderByChild("status").equalTo(status).once("value"),list=[];snap.forEach(c=>list.push({id:c.key,...c.val()}));const timeKey=status==="solved"?"solvedAt":"expiredAt";return list.sort((a,b)=>sort==="popular"?(b.likeCount||0)-(a.likeCount||0):sort==="new"?b[timeKey]-a[timeKey]:a[timeKey]-b[timeKey]);}
async function renderGallery(){if(!isConfigured()){appEl.innerHTML='<section class="screen"><div class="empty">Firebase 설정을 연결해 주세요.</div></section>';return;}loading();try{const list=await loadGalleryDrawings();if(state.galleryIndex>=list.length)state.galleryIndex=0;appEl.innerHTML=`<section class="screen"><h2>전시장</h2><p class="muted">그림을 감상하고 마음에 쏙 들면 좋아요!</p><div class="tabs"><button data-gallery-tab="solved" class="${state.galleryTab==="solved"?"active":""}">완성 액자</button><button data-gallery-tab="expired" class="${state.galleryTab==="expired"?"active":""}">미해결 그림</button></div><div class="gallery-controls"><div class="view-toggle"><button data-view="frame" class="${state.galleryView==="frame"?"active":""}">액자 보기</button><button data-view="thumb" class="${state.galleryView==="thumb"?"active":""}">썸네일 보기</button></div><select id="gallerySort"><option value="new" ${state.gallerySort==="new"?"selected":""}>최신순</option><option value="old" ${state.gallerySort==="old"?"selected":""}>과거순</option><option value="popular" ${state.gallerySort==="popular"?"selected":""}>인기순</option></select></div><div id="galleryContent">${list.length?(state.galleryView==="frame"?galleryFrame(list,state.galleryIndex):galleryThumbs(list)):emptyHtml("🖼️","아직 전시된 그림이 없어요.")}</div></section>`;bindGallery(list);}catch(e){console.error(e);appEl.innerHTML=`<section class="screen">${emptyHtml("😵","전시장을 불러오지 못했어요.")}</section>`;}}
function galleryFrame(list,i){const d=list[i];return `<div class="frame"><img class="frame-image" src="${d.imageData}" alt="전시 그림"></div><div class="frame-info"><button class="secret-word" data-secret>제시어 보기 👀</button><div class="meta"><span>그린 사람: ${escapeHtml(d.drawerDisplayName)}</span><span>${d.status==="solved"?`맞힌 사람: ${escapeHtml(d.solverDisplayName)}`:"맞힌 사람: 없음"}</span></div><button class="button ${d.drawerId===state.user.id?"ghost":"secondary"} full" data-like="${d.id}" ${d.drawerId===state.user.id?"disabled":""}>♡ 좋아요 ${Number(d.likeCount)||0}${d.drawerId===state.user.id?" · 내 그림":""}</button></div><div class="frame-nav"><button class="button ghost" data-prev ${i===0?"disabled":""}>이전</button><span>${i+1} / ${list.length}</span><button class="button ghost" data-next ${i===list.length-1?"disabled":""}>다음</button></div>`;}
function galleryThumbs(list){return `<div class="thumbnail-grid">${list.map((d,i)=>`<button class="thumbnail" data-thumb="${i}"><img src="${d.imageData}" alt="전시 그림"><small>♡ ${Number(d.likeCount)||0} · ${escapeHtml(d.drawerDisplayName)}</small></button>`).join("")}</div>`;}
function bindGallery(list){document.querySelectorAll("[data-gallery-tab]").forEach(b=>b.onclick=()=>{state.galleryTab=b.dataset.galleryTab;state.galleryIndex=0;renderGallery();});document.querySelectorAll("[data-view]").forEach(b=>b.onclick=()=>{state.galleryView=b.dataset.view;renderGallery();});gallerySort.onchange=()=>{state.gallerySort=gallerySort.value;state.galleryIndex=0;renderGallery();};document.querySelector("[data-prev]")?.addEventListener("click",()=>{state.galleryIndex--;renderGallery();});document.querySelector("[data-next]")?.addEventListener("click",()=>{state.galleryIndex++;renderGallery();});document.querySelector("[data-secret]")?.addEventListener("click",e=>{e.currentTarget.textContent=`제시어: ${list[state.galleryIndex].word}`;});document.querySelectorAll("[data-thumb]").forEach(b=>b.onclick=()=>{state.galleryIndex=Number(b.dataset.thumb);state.galleryView="frame";renderGallery();});document.querySelector("[data-like]")?.addEventListener("click",async e=>{e.currentTarget.disabled=true;try{await toggleLike(e.currentTarget.dataset.like);renderGallery();}catch(err){showToast(err.message);e.currentTarget.disabled=false;}});}
async function toggleLike(drawingId){let message="좋아요를 바꾸지 못했어요.";const result=await db.ref().transaction(root=>{const d=root?.drawings?.[drawingId];if(!d||!["solved","expired"].includes(d.status))return;if(d.drawerId===state.user.id){message="내 그림에는 좋아요를 누를 수 없어요.";return;}root.drawingLikes=root.drawingLikes||{};root.drawingLikes[drawingId]=root.drawingLikes[drawingId]||{};const liked=!!root.drawingLikes[drawingId][state.user.id];if(liked)delete root.drawingLikes[drawingId][state.user.id];else root.drawingLikes[drawingId][state.user.id]=true;d.likeCount=Math.max(0,(Number(d.likeCount)||0)+(liked?-1:1));message=liked?"좋아요를 취소했어요.":"좋아요를 눌렀어요!";return root;},{applyLocally:false});if(!result.committed)throw new Error(message);showToast(message);}

async function loadRanking(){const snap=await db.ref("users").orderByChild("score").once("value"),list=[];snap.forEach(c=>{const u=c.val();if(!u.rankingDeleted)list.push({id:c.key,...u});});return list.sort((a,b)=>(b.score||0)-(a.score||0)||a.createdAt-b.createdAt);}
async function renderRanking(){if(!isConfigured()){appEl.innerHTML='<section class="screen"><div class="empty">Firebase 설정을 연결해 주세요.</div></section>';return;}loading();try{const list=await loadRanking();appEl.innerHTML=`<section class="screen"><h2>랭킹</h2><p class="muted">그림을 맞히고, 내 그림도 맞혀지면 점수가 올라요.</p><div>${list.map((u,i)=>`<div class="rank-row ${u.id===state.user.id?"mine":""}"><div class="rank-num">${i<3?["🥇","🥈","🥉"][i]:i+1}</div><div><b>${escapeHtml(u.displayName)}</b>${u.id===state.user.id?"<small> · 나</small>":""}</div><div class="rank-score">${Number(u.score)||0}점</div></div>`).join("")||emptyHtml("🏆","아직 랭킹이 비어 있어요.")}</div><button id="deleteRanking" class="button danger full" style="margin-top:20px">내 랭킹 삭제</button></section>`;deleteRanking.onclick=()=>confirmModal("정말 내 랭킹을 삭제할까요?","내 점수와 랭킹 기록이 사라집니다.\n하지만 이미 전시장에 올라간 그림은 삭제되지 않습니다.",async()=>{await deleteMyRanking();localStorage.removeItem("catchGalleryUserId");localStorage.removeItem("catchGalleryDisplayName");state.user=null;showToast("랭킹을 삭제했어요.");route("login");});}catch(e){console.error(e);}}
async function deleteMyRanking(){const now=serverNow();await db.ref(`users/${state.user.id}`).update({score:0,rankingDeleted:true,rankingDeletedAt:now,lastSeenAt:now});}

async function renderManage(){if(!isConfigured()){appEl.innerHTML='<section class="screen"><div class="empty">Firebase 설정을 연결해 주세요.</div></section>';return;}loading();try{await expireOldDrawings();const idsSnap=await db.ref(`userDrawings/${state.user.id}`).once("value"),ids=Object.keys(safeObject(idsSnap.val())),all=await Promise.all(ids.map(async id=>{const s=await db.ref(`drawings/${id}`).once("value");return s.exists()?{id,...s.val()}:null;})),list=all.filter(d=>d&&d.status===state.manageStatus).sort((a,b)=>b.createdAt-a.createdAt);appEl.innerHTML=`<section class="screen"><h2>내 그림 관리</h2><p class="muted">내가 그린 그림을 상태별로 모아봐요.</p><div class="tabs status-tabs">${Object.entries(STATUS_LABEL).map(([k,v])=>`<button data-status="${k}" class="${state.manageStatus===k?"active":""}">${v}</button>`).join("")}</div><div style="margin-top:15px">${list.length?list.map(manageCard).join(""):emptyHtml("📂","여기에 해당하는 그림이 없어요.")}</div></section>`;document.querySelectorAll("[data-status]").forEach(b=>b.onclick=()=>{state.manageStatus=b.dataset.status;renderManage();});document.querySelectorAll("[data-edit]").forEach(b=>b.onclick=()=>{const d=list.find(x=>x.id===b.dataset.edit);state.editDrawing=d;state.word=[d.word,d.category];route("draw");});document.querySelectorAll("[data-withdraw]").forEach(b=>b.onclick=()=>confirmModal("정말 이 그림을 회수할까요?","회수한 그림은 복구할 수 없고,\n전시장에도 전시되지 않습니다.",async()=>{await withdrawDrawing(b.dataset.withdraw);showToast("그림을 회수했어요.");renderManage();}));}catch(e){console.error(e);}}
function manageCard(d){return `<article class="card drawing-card"><img src="${d.imageData}" alt="내 그림"><div class="meta"><span class="badge ${d.status}">${STATUS_LABEL[d.status]}</span><span>제시어: ${escapeHtml(d.word)}</span>${d.status==="open"?`<span>남은 시간: ${formatTime(d.expiresAt)}</span><span>수정 ${Number(d.revisionCount)||0}회</span>`:""}</div>${d.status==="open"?`<div class="notice">수정할 때마다 최종 보상 -2점</div><div class="button-row"><button class="button secondary" data-edit="${d.id}">수정하기</button><button class="button danger" data-withdraw="${d.id}">회수하기</button></div>`:d.status==="solved"?`<p>맞힌 사람: <b>${escapeHtml(d.solverDisplayName)}</b><br>획득 점수: <b>${Number(d.drawerReward)||0}점</b></p>`:d.status==="expired"?"<p>아무도 맞히지 못했어요.<br>획득 점수: <b>0점</b></p>":"<p class=\"muted\">회수한 그림은 다시 복구할 수 없어요.</p>"}</article>`;}

function renderGuide(){const items=[["캐치갤러리란?","그림을 그리고, 다른 사람이 정답을 맞히는 그림 퀴즈 게임입니다.","#ff8ea1"],["닉네임","같은 닉네임과 숫자 태그를 사용해야 점수와 그림 기록이 이어집니다.","#f0c75a"],["그림 그리기","그림은 게시만으로 점수를 얻지 않습니다. 누군가 맞혀야 점수를 얻습니다.","#73cba5"],["정답 맞히기","한 그림은 단 한 명만 맞힐 수 있습니다. 자기 그림은 맞힐 수 없습니다.","#77bfea"],["힌트와 점수","힌트 없이 맞히면 양쪽 10점, 힌트를 보면 양쪽 6점입니다. 수정한 그림은 그린 사람의 점수가 1회당 2점 줄어요.","#b59ae3"],["그림 수정·회수","도전 중인 내 그림은 수정하거나 회수할 수 있습니다. 회수하면 복구할 수 없어요.","#ffad88"],["48시간 미해결 마감","48시간 동안 아무도 못 맞히면 미해결 그림으로 전시됩니다.","#8ecbc6"],["전시장과 좋아요","완성 액자와 미해결 그림을 볼 수 있습니다. 제시어는 터치하면 공개되고, 남의 그림에 좋아요를 누를 수 있어요.","#e99ca9"],["랭킹 삭제","점수와 랭킹 기록은 사라지지만 이미 전시장에 올라간 그림은 그대로 남습니다.","#a9a1cf"]];appEl.innerHTML=`<section class="screen"><h2>게임설명</h2><p class="muted">알고 나면 더 재미있는 캐치갤러리!</p>${items.map(x=>`<article class="card guide-card" style="--accent:${x[2]}"><h3>${x[0]}</h3><p>${x[1]}</p></article>`).join("")}</section>`;}
function emptyHtml(icon,text){return `<div class="empty"><div class="empty-icon">${icon}</div><p>${text}</p></div>`;}
function confirmModal(title,message,onConfirm){const root=document.querySelector("#modalRoot");root.innerHTML=`<div class="modal-backdrop"><div class="modal"><h3>${title}</h3><p>${message}</p><div class="button-row"><button class="button ghost" data-cancel>취소</button><button class="button danger" data-confirm>확인</button></div></div></div>`;root.querySelector("[data-cancel]").onclick=()=>root.innerHTML="";root.querySelector("[data-confirm]").onclick=async e=>{e.currentTarget.disabled=true;try{await onConfirm();root.innerHTML="";}catch(err){showToast(err.message);e.currentTarget.disabled=false;}};}

boot();
