const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCXi55RYsUh7ZKpyzpET_ICik2CG9rIKJQ",
  authDomain: "catchgallery.firebaseapp.com",
  databaseURL: "https://catchgallery-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "catchgallery",
  storageBucket: "catchgallery.firebasestorage.app",
  messagingSenderId: "184579573382",
  appId: "1:184579573382:web:c4a7d3e969b35d4065b307"
};

const WORDS = [
  { category: "음식", word: "바나나", answers: ["바나나"] }, { category: "음식", word: "김밥", answers: ["김밥"] }, { category: "음식", word: "떡볶이", answers: ["떡볶이"] }, { category: "음식", word: "수박", answers: ["수박"] },
  { category: "음식", word: "붕어빵", answers: ["붕어빵"] }, { category: "음식", word: "라면", answers: ["라면"] }, { category: "음식", word: "딸기", answers: ["딸기"] }, { category: "음식", word: "급식", answers: ["급식"] },
  { category: "동물", word: "고양이", answers: ["고양이"] }, { category: "동물", word: "강아지", answers: ["강아지"] }, { category: "동물", word: "기린", answers: ["기린"] }, { category: "동물", word: "토끼", answers: ["토끼"] },
  { category: "동물", word: "문어", answers: ["문어"] }, { category: "동물", word: "펭귄", answers: ["펭귄"] }, { category: "동물", word: "달팽이", answers: ["달팽이"] }, { category: "동물", word: "공룡", answers: ["공룡"] }, { category: "동물", word: "용", answers: ["용"] },
  { category: "물건", word: "우산", answers: ["우산"] }, { category: "물건", word: "안경", answers: ["안경"] }, { category: "물건", word: "시계", answers: ["시계"] }, { category: "물건", word: "가방", answers: ["가방"] },
  { category: "물건", word: "연필", answers: ["연필"] }, { category: "물건", word: "선풍기", answers: ["선풍기"] }, { category: "물건", word: "로봇", answers: ["로봇"] }, { category: "물건", word: "크리스마스트리", answers: ["크리스마스트리"] },
  { category: "탈것", word: "자전거", answers: ["자전거"] },
  { category: "자연", word: "무지개", answers: ["무지개"] }, { category: "자연", word: "구름", answers: ["구름"] }, { category: "자연", word: "화산", answers: ["화산"] }, { category: "자연", word: "해바라기", answers: ["해바라기"] }, { category: "자연", word: "번개", answers: ["번개"] }, { category: "자연", word: "눈사람", answers: ["눈사람"] },
  { category: "운동과 놀이", word: "수영", answers: ["수영"] }, { category: "운동과 놀이", word: "종이비행기", answers: ["종이비행기"] }
];

const STATUS_LABEL = { open: "도전 중", solved: "완성", expired: "미해결", withdrawn: "회수됨" };
const FEEDBACK_SORTS = [["new", "최신순"], ["old", "과거순"], ["popular", "인기순"], ["likes", "좋아요순"], ["dislikes", "싫어요순"]];

const appEl = document.querySelector("#app");
const headerEl = document.querySelector("#appHeader");
const scoreEl = document.querySelector("#headerScore");
const state = {
  user: null,
  isAdmin: false,
  authReady: false,
  route: "login",
  word: null,
  hintUsed: {},
  galleryTab: "solved",
  galleryView: "thumb",
  gallerySort: "new",
  galleryIndex: 0,
  manageStatus: "open",
  rankingType: "total",
  editDrawing: null,
  canvas: null,
  ctx: null,
  drawing: false,
  dirty: false,
  history: [],
  publishing: false,
  feedbackView: "all",
  feedbackSort: "new",
  editingFeedback: null
};
let db = null;
let auth = null;

function firebaseReady() { return true; }
function initFirebase() {
  if (!firebaseReady()) return false;
  if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
  db = firebase.database();
  auth = firebase.auth();
  return true;
}
function serverNow() { return Date.now(); }
function escapeHtml(value = "") { const d = document.createElement("div"); d.textContent = String(value); return d.innerHTML; }
function safeObject(value) { return value && typeof value === "object" ? value : {}; }
function drawerName(d) { return d.drawerNickname || d.drawerDisplayName || "알 수 없음"; }
function solverName(d) { return d.solverNickname || d.solverDisplayName || "알 수 없음"; }
function showToast(message) {
  const el = document.querySelector("#toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => el.classList.remove("show"), 2400);
}
function loading() { appEl.innerHTML = '<div class="loading" aria-label="불러오는 중"></div>'; }
function formatTime(expiresAt) {
  const ms = Number(expiresAt) - serverNow();
  if (ms <= 0) return "마감됨";
  const h = Math.floor(ms / 3600000);
  return h < 1 ? "1시간 미만" : `${h}시간`;
}
function randomWord() {
  let next;
  do {
    next = WORDS[Math.floor(Math.random() * WORDS.length)];
  } while (WORDS.length > 1 && state.word?.word === next.word);
  state.word = { ...next, answers: [...next.answers], isCustomWord: false };
}
function normalizeAnswer(value) { return String(value || "").trim().normalize("NFC").replace(/\s+/g, "").toLowerCase(); }
function textLength(value) { return Array.from(value).length; }
function isConfigured() {
  if (initFirebase()) return true;
  showToast("Firebase 설정을 먼저 연결해 주세요.");
  return false;
}
function route(name, options = {}) {
  state.route = name;
  if (name !== "draw") state.editDrawing = null;
  history.pushState({ route: name }, "", `#${name}`);
  renderRoute(options);
}

window.addEventListener("popstate", () => {
  const name = location.hash.slice(1) || (state.user ? "home" : "login");
  state.route = name;
  renderRoute();
});
document.addEventListener("click", e => {
  const target = e.target.closest("[data-route]");
  if (target) route(target.dataset.route);
});
document.querySelector("#backButton").addEventListener("click", () => route("home"));

function normalizeNickname(value) { return value.trim().normalize("NFC"); }
function nicknameKey(value) {
  const bytes = new TextEncoder().encode(normalizeNickname(value));
  return "u_" + Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
}
function internalEmail(value) { return `${nicknameKey(value)}@catchgallery.app`; }
function validateCredentials(nickname, password) {
  const name = normalizeNickname(nickname);
  if (!name || name.length > 8) throw new Error("닉네임은 1~8글자로 입력해 주세요.");
  if (password.length < 6) throw new Error("비밀번호는 6자 이상 입력해 주세요.");
  return name;
}
function authMessage(error, mode) {
  const code = error?.code || "";
  if (code.includes("email-already-in-use")) return "이미 사용 중인 닉네임입니다.\n다른 닉네임을 사용해 주세요.";
  if (code.includes("wrong-password") || code.includes("invalid-credential") || code.includes("invalid-login-credentials")) return "비밀번호가 맞지 않습니다.";
  if (code.includes("user-not-found")) return "가입되지 않은 닉네임입니다.";
  if (code.includes("weak-password")) return "비밀번호는 6자 이상 입력해 주세요.";
  if (code.includes("too-many-requests")) return "잠시 후 다시 시도해 주세요.";
  return mode === "signup" ? "회원가입 중 오류가 발생했습니다." : "로그인 중 오류가 발생했습니다.";
}
async function ensureUserProfile(firebaseUser, nickname) {
  const uid = firebaseUser.uid;
  const key = nicknameKey(nickname);
  const now = serverNow();
  const ref = db.ref(`users/${uid}`);
  const snap = await ref.once("value");
  const old = snap.val();
  const profile = old || { nickname, nicknameKey: key, score: 0, createdAt: now, lastSeenAt: now, rankingDeleted: false, rankingDeletedAt: null };
  profile.nickname = profile.nickname || nickname;
  profile.nicknameKey = profile.nicknameKey || key;
  profile.lastSeenAt = now;
  if (profile.rankingDeleted) {
    profile.score = 0;
    profile.rankingDeleted = false;
    profile.rankingDeletedAt = null;
  }
  await ref.set(profile);
  try {
    await db.ref(`nicknameIndex/${key}`).set(uid);
  } catch (error) {
    if (!old) {
      try { await ref.remove(); } catch (_) {}
    }
    throw error;
  }
  return loadCurrentUser(uid);
}
async function signUp(nickname, password) {
  const name = validateCredentials(nickname, password);
  localStorage.setItem("catchGalleryNickname", name);
  try {
    const credential = await auth.createUserWithEmailAndPassword(internalEmail(name), password);
    try {
      await ensureUserProfile(credential.user, name);
    } catch (error) {
      try { await credential.user.delete(); } catch (_) {}
      throw error;
    }
    return state.user;
  } catch (error) {
    if (error.message?.startsWith("이미") || error.message?.includes("오류")) throw error;
    throw new Error(authMessage(error, "signup"));
  }
}
async function signIn(nickname, password) {
  const name = validateCredentials(nickname, password);
  localStorage.setItem("catchGalleryNickname", name);
  try {
    const credential = await auth.signInWithEmailAndPassword(internalEmail(name), password);
    await ensureUserProfile(credential.user, name);
    return state.user;
  } catch (error) {
    if (error.message?.includes("오류")) throw error;
    throw new Error(authMessage(error, "login"));
  }
}
async function signOut() {
  await auth.signOut();
  state.user = null;
  state.isAdmin = false;
  localStorage.removeItem("catchGalleryUid");
  localStorage.removeItem("catchGalleryNickname");
  route("login");
}
async function boot() {
  initFirebase();
  loading();
  auth.onAuthStateChanged(async firebaseUser => {
    try {
      if (firebaseUser) {
        const saved = localStorage.getItem("catchGalleryNickname");
        const snap = await db.ref(`users/${firebaseUser.uid}`).once("value");
        if (snap.exists()) await loadCurrentUser(firebaseUser.uid);
        else if (saved) await ensureUserProfile(firebaseUser, saved);
        else {
          await auth.signOut();
          throw new Error("닉네임 정보를 복구할 수 없어 다시 로그인해야 합니다.");
        }
      } else {
        state.user = null;
        state.isAdmin = false;
      }
    } catch (error) {
      console.error(error);
      showToast(error.message);
    }
    state.authReady = true;
    const initial = state.user ? (location.hash.slice(1) || "home") : "login";
    state.route = initial;
    history.replaceState({ route: initial }, "", `#${initial}`);
    renderRoute();
    if (state.user) expireOldDrawings().catch(console.error);
  });
}

function claimScore(claim) { return typeof claim === "number" ? claim : Number(claim?.score) || 0; }
function sumClaims(claims) { return Object.values(safeObject(claims)).reduce((sum, claim) => sum + claimScore(claim), 0); }
function claimType(claim, drawing, userId) {
  if (claim && typeof claim === "object" && ["drawer", "solver"].includes(claim.type)) return claim.type;
  if (drawing?.solverId === userId) return "solver";
  if (drawing?.drawerId === userId) return "drawer";
  return null;
}
async function loadUserScore(uid) { return sumClaims((await db.ref(`scoreClaims/${uid}`).once("value")).val()); }
async function loadCurrentUser(userId = auth?.currentUser?.uid) {
  if (!db || !userId) return null;
  const [snap, adminSnap, score] = await Promise.all([
    db.ref(`users/${userId}`).once("value"),
    db.ref(`admins/${userId}`).once("value"),
    loadUserScore(userId)
  ]);
  if (!snap.exists()) return null;
  state.user = { id: userId, ...snap.val(), score };
  state.isAdmin = adminSnap.val() === true;
  localStorage.setItem("catchGalleryUid", userId);
  localStorage.setItem("catchGalleryNickname", state.user.nickname);
  scoreEl.textContent = `${score}점`;
  return state.user;
}

function renderRoute() {
  const publicRoute = state.route === "login";
  headerEl.classList.toggle("hidden", publicRoute);
  if (!publicRoute && !state.user) {
    state.route = "login";
    return renderLogin();
  }
  const routes = { login: renderLogin, home: renderHome, draw: renderDraw, solve: renderSolve, gallery: renderGallery, ranking: renderRanking, manage: renderManage, guide: renderGuide, feedback: renderFeedback };
  (routes[state.route] || renderHome)();
}
function renderLogin() {
  appEl.innerHTML = `<section class="screen center-screen"><div class="welcome-art">🖼️</div><div style="text-align:center"><h1>캐치갤러리</h1><p class="subtitle">닉네임과 비밀번호로 시작해요!</p></div><form id="loginForm" class="card"><label class="field-label" for="nickname">닉네임</label><input id="nickname" maxlength="8" autocomplete="username" placeholder="닉네임 입력" required><label class="field-label" for="password">비밀번호</label><input id="password" type="password" minlength="6" autocomplete="current-password" placeholder="6자 이상" required><p class="password-warning">평소 쓰는 비밀번호를 사용하지 마세요.</p><p class="helper">같은 닉네임과 비밀번호로 다른 기기에서도 기록을 이어갈 수 있습니다.</p><div class="button-row"><button id="loginButton" class="button primary" type="submit">로그인</button><button id="signupButton" class="button secondary" type="button">회원가입</button></div></form></section>`;
  const form = document.querySelector("#loginForm");
  const nameInput = document.querySelector("#nickname");
  const loginButton = document.querySelector("#loginButton");
  const signupButton = document.querySelector("#signupButton");
  nameInput.value = localStorage.getItem("catchGalleryNickname") || "";
  const submit = async mode => {
    loginButton.disabled = signupButton.disabled = true;
    const active = mode === "login" ? loginButton : signupButton;
    const original = active.textContent;
    active.textContent = "처리 중…";
    try {
      mode === "login" ? await signIn(nameInput.value, password.value) : await signUp(nameInput.value, password.value);
      route("home");
    } catch (error) {
      showToast(error.message);
    } finally {
      loginButton.disabled = signupButton.disabled = false;
      active.textContent = original;
    }
  };
  form.addEventListener("submit", event => { event.preventDefault(); submit("login"); });
  signupButton.onclick = () => submit("signup");
}
function renderHome() {
  scoreEl.textContent = `${state.user.score || 0}점`;
  appEl.innerHTML = `<section class="screen"><div class="home-greeting"><h2>${escapeHtml(state.user.nickname)}님, 반가워요!</h2><p class="muted">그림을 그리고, 다른 사람의 그림도 맞혀보세요.</p></div><div class="main-actions"><button class="main-action draw" data-route="draw"><span class="action-icon">✏️</span><span class="action-title">그림 그리기</span><span class="action-copy">제시어를 그림으로 표현해요</span></button><button class="main-action solve" data-route="solve"><span class="action-icon">🔍</span><span class="action-title">정답 맞히기</span><span class="action-copy">이 그림은 무엇일까요?</span></button></div><div class="sub-actions"><button class="sub-action" data-route="gallery"><span>🖼️</span>전시장</button><button class="sub-action" data-route="ranking"><span>🏆</span>랭킹</button><button class="sub-action" data-route="manage"><span>🗂️</span>내 그림 관리</button><button class="sub-action" data-route="guide"><span>📖</span>게임설명</button><button class="sub-action feedback-menu" data-route="feedback"><span>💌</span>의견 보내기</button></div><button id="logoutButton" class="button ghost full logout-button">로그아웃</button></section>`;
  document.querySelector("#logoutButton").onclick = signOut;
}

function renderDraw() {
  if (!state.word) randomWord();
  const edit = state.editDrawing;
  const wordActions = edit ? "" : '<div class="word-actions"><button id="nextWord" class="button ghost">다른 제시어</button><button id="customWordButton" class="button ghost" aria-expanded="false">직접 제시어</button></div>';
  const customForm = edit ? "" : `<form id="customWordForm" class="custom-word-form hidden"><div class="custom-fields"><label>카테고리<input id="customCategory" maxlength="8" required placeholder="예: 음식"></label><label>제시어<input id="customWord" maxlength="12" required placeholder="예: 계란후라이"></label></div><label class="answer-label"><span>허용 정답 <button id="answerHelpButton" class="answer-help-button" type="button" aria-label="허용 정답 설명 보기" aria-expanded="false">?</button></span><input id="customAnswers" placeholder="달걀후라이, 계란프라이"></label><div id="answerHelp" class="answer-help hidden"><b>허용 정답이란?</b><br>정답은 맞지만 다르게 부를 수 있는 말을 적는 곳이에요.<br>예: 제시어가 ‘계란후라이’라면 ‘달걀후라이, 계란프라이’도 정답으로 인정할 수 있어요.<br>쉼표로 나누어 적어주세요.</div><button class="button secondary full" type="submit">이 제시어 사용하기</button></form>`;
  const shownAnswers = !edit && state.word.isCustomWord && state.word.answers.length > 1 ? `<small class="custom-answer-summary">허용 정답: ${state.word.answers.slice(1).map(escapeHtml).join(", ")}</small>` : "";
  appEl.innerHTML = `<section class="screen draw-screen"><div class="section-head"><div><h2>${edit ? "그림 수정하기" : "그림 그리기"}</h2><p class="muted">손가락으로 마음껏 그려요.</p></div>${wordActions}</div><div class="card word-card"><span class="category">${escapeHtml(edit?.category || state.word.category)}</span><div class="word">${escapeHtml(edit?.word || state.word.word)}</div>${shownAnswers}</div>${customForm}<div class="canvas-wrap"><canvas id="drawingCanvas" width="720" height="720" aria-label="그림판"></canvas></div><div class="tools"><div class="colors">${["#3e3a48", "#ed5f72", "#f29b38", "#f0cf3a", "#57b879", "#45a8df", "#745bc7"].map((c, i) => `<button class="color ${i === 0 ? "selected" : ""}" data-color="${c}" style="background:${c}" aria-label="색상 선택"></button>`).join("")}</div><div class="tool-grid"><input id="brushSize" type="range" min="3" max="34" value="9" aria-label="붓 굵기"><button id="eraser" class="button ghost">지우개</button><button id="undo" class="button ghost">되돌리기</button><button id="clearCanvas" class="button ghost">전체 지우기</button></div></div><div class="notice">${edit ? "수정할 때마다 최종 보상 -2점" : "누군가 맞혀야 점수를 얻습니다.<br>힌트가 필요한 난해한 그림은 낮은 점수를 얻습니다."}</div><button id="saveDrawing" class="button primary full">${edit ? "수정 저장하기" : "게시하기"}</button></section>`;
  setupCanvas(edit?.imageData);
  document.querySelectorAll(".color").forEach(button => button.onclick = () => {
    document.querySelectorAll(".color").forEach(x => x.classList.remove("selected"));
    button.classList.add("selected");
    state.ctx.globalCompositeOperation = "source-over";
    state.ctx.strokeStyle = button.dataset.color;
  });
  eraser.onclick = () => { state.ctx.globalCompositeOperation = "destination-out"; };
  undo.onclick = undoCanvas;
  clearCanvas.onclick = () => clearCanvasBoard(true);
  if (!edit) nextWord.onclick = () => {
    if (state.dirty && !confirm("그림을 지우고 다른 제시어를 받을까요?")) return;
    randomWord();
    renderDraw();
  };
  if (!edit) {
    customWordButton.onclick = () => {
      const opening = customWordForm.classList.contains("hidden");
      customWordForm.classList.toggle("hidden", !opening);
      document.querySelector(".draw-screen").classList.toggle("custom-word-open", opening);
      customWordButton.setAttribute("aria-expanded", String(opening));
      if (opening) customCategory.focus();
    };
    answerHelpButton.onclick = () => {
      const opening = answerHelp.classList.contains("hidden");
      answerHelp.classList.toggle("hidden", !opening);
      answerHelpButton.setAttribute("aria-expanded", String(opening));
    };
    customWordForm.onsubmit = event => {
      event.preventDefault();
      const category = customCategory.value.trim();
      const word = customWord.value.trim();
      const rawAnswers = customAnswers.value.split(",").map(value => value.trim()).filter(Boolean);
      if (textLength(category) < 1 || textLength(category) > 8) return showToast("카테고리는 1~8자로 입력해 주세요.");
      if (textLength(word) < 1 || textLength(word) > 12) return showToast("제시어는 1~12자로 입력해 주세요.");
      if (rawAnswers.length > 5) return showToast("허용 정답은 최대 5개까지 입력할 수 있어요.");
      if (rawAnswers.some(value => textLength(value) < 1 || textLength(value) > 12)) return showToast("허용 정답은 각각 1~12자로 입력해 주세요.");
      const answers = [word, ...rawAnswers].filter((value, index, list) => list.findIndex(item => normalizeAnswer(item) === normalizeAnswer(value)) === index);
      state.word = { category, word, answers, isCustomWord: true };
      document.querySelector(".word-card .category").textContent = category;
      document.querySelector(".word-card .word").textContent = word;
      document.querySelector(".custom-answer-summary")?.remove();
      if (answers.length > 1) document.querySelector(".word-card").insertAdjacentHTML("beforeend", `<small class="custom-answer-summary">허용 정답: ${answers.slice(1).map(escapeHtml).join(", ")}</small>`);
      customWordForm.classList.add("hidden");
      document.querySelector(".draw-screen").classList.remove("custom-word-open");
      customWordButton.setAttribute("aria-expanded", "false");
      showToast("직접 제시어를 적용했어요!");
    };
  }
  saveDrawing.onclick = async () => {
    if (!state.dirty) {
      showToast(edit ? "그림을 조금 수정해 주세요." : "빈 그림은 게시할 수 없어요.");
      return;
    }
    state.publishing = true;
    saveDrawing.disabled = true;
    saveDrawing.textContent = "저장하는 중…";
    try {
      edit ? await updateDrawing(edit.id) : await publishDrawing();
      state.editDrawing = null;
      state.word = null;
      showToast(edit ? "수정했어요!" : "그림을 게시했어요!");
      route("manage");
    } catch (error) {
      showToast(error.message);
      saveDrawing.disabled = false;
      saveDrawing.textContent = edit ? "수정 저장하기" : "게시하기";
    } finally {
      state.publishing = false;
    }
  };
}

function preventIfCancelable(event) { if (event && event.cancelable) event.preventDefault(); }
function lockDrawingScroll() {
  if (document.body.classList.contains("drawing-scroll-lock")) return;
  const y = window.scrollY || document.documentElement.scrollTop || 0;
  document.body.dataset.scrollY = String(y);
  document.body.style.top = `-${y}px`;
  document.documentElement.classList.add("drawing-scroll-lock");
  document.body.classList.add("drawing-scroll-lock");
}
function unlockDrawingScroll() {
  if (!document.body.classList.contains("drawing-scroll-lock")) return;
  const y = Number(document.body.dataset.scrollY || 0);
  document.documentElement.classList.remove("drawing-scroll-lock");
  document.body.classList.remove("drawing-scroll-lock");
  document.body.style.top = "";
  delete document.body.dataset.scrollY;
  window.scrollTo(0, y);
}
function bindDocumentDrawingScrollBlocker() {
  if (window.__catchGalleryDrawingScrollBlockerBound) return;
  const block = event => {
    if (state.route === "draw" && state.drawing) preventIfCancelable(event);
  };
  document.addEventListener("touchmove", block, { passive: false, capture: true });
  document.addEventListener("touchcancel", block, { passive: false, capture: true });
  document.addEventListener("gesturestart", block, { passive: false, capture: true });
  window.__catchGalleryDrawingScrollBlockerBound = true;
}
function setupCanvas(imageData) {
  bindDocumentDrawingScrollBlocker();
  state.canvas = document.querySelector("#drawingCanvas");
  state.ctx = state.canvas.getContext("2d", { willReadFrequently: true });
  state.ctx.lineCap = "round";
  state.ctx.lineJoin = "round";
  state.ctx.strokeStyle = "#3e3a48";
  state.ctx.lineWidth = 9;
  state.history = [];
  state.dirty = false;

  const pos = event => {
    const rect = state.canvas.getBoundingClientRect();
    const point = event.touches?.[0] || event.changedTouches?.[0] || event;
    return [
      (point.clientX - rect.left) * state.canvas.width / rect.width,
      (point.clientY - rect.top) * state.canvas.height / rect.height
    ];
  };
  const start = event => {
    preventIfCancelable(event);
    lockDrawingScroll();
    state.canvas.setPointerCapture?.(event.pointerId);
    saveHistory();
    state.drawing = true;
    const [x, y] = pos(event);
    state.ctx.beginPath();
    state.ctx.moveTo(x, y);
  };
  const move = event => {
    if (!state.drawing) return;
    preventIfCancelable(event);
    const [x, y] = pos(event);
    const brush = document.querySelector("#brushSize");
    state.ctx.lineWidth = Number(brush?.value || 9);
    state.ctx.lineTo(x, y);
    state.ctx.stroke();
    state.dirty = true;
  };
  const end = event => {
    if (state.drawing) preventIfCancelable(event);
    state.canvas.releasePointerCapture?.(event.pointerId);
    state.drawing = false;
    state.ctx.closePath();
    unlockDrawingScroll();
  };

  state.canvas.addEventListener("pointerdown", start, { passive: false });
  state.canvas.addEventListener("pointermove", move, { passive: false });
  state.canvas.addEventListener("pointerup", end, { passive: false });
  state.canvas.addEventListener("pointercancel", end, { passive: false });
  state.canvas.addEventListener("pointerleave", end, { passive: false });
  state.canvas.addEventListener("touchstart", event => { preventIfCancelable(event); lockDrawingScroll(); }, { passive: false });
  state.canvas.addEventListener("touchmove", preventIfCancelable, { passive: false });
  state.canvas.addEventListener("touchend", end, { passive: false });
  state.canvas.addEventListener("touchcancel", end, { passive: false });

  if (imageData) {
    const img = new Image();
    img.onload = () => { state.ctx.drawImage(img, 0, 0, 720, 720); };
    img.src = imageData;
  }
}
function saveHistory() {
  if (state.history.length >= 15) state.history.shift();
  state.history.push(state.ctx.getImageData(0, 0, state.canvas.width, state.canvas.height));
}
function undoCanvas() {
  const last = state.history.pop();
  if (!last) return showToast("되돌릴 내용이 없어요.");
  state.ctx.globalCompositeOperation = "source-over";
  state.ctx.putImageData(last, 0, 0);
  state.dirty = true;
}
function clearCanvasBoard(track) {
  if (track) saveHistory();
  state.ctx.clearRect(0, 0, 720, 720);
  state.dirty = !!track;
}
async function publishDrawing() {
  const now = serverNow();
  const ref = db.ref("drawings").push();
  const id = ref.key;
  const data = {
    word: state.word.word,
    category: state.word.category,
    answers: state.word.answers,
    isCustomWord: state.word.isCustomWord,
    imageData: state.canvas.toDataURL("image/png"),
    drawerId: state.user.id,
    drawerNickname: state.user.nickname,
    status: "open",
    createdAt: now,
    updatedAt: now,
    expiresAt: now + 48 * 3600000,
    revisionCount: 0,
    solverId: null,
    solverNickname: null,
    solvedAt: null,
    hintUsed: false,
    solverReward: 0,
    drawerReward: 0,
    expiredAt: null,
    withdrawnAt: null,
    likeCount: 0
  };
  await ref.set(data);
  await db.ref(`userDrawings/${state.user.id}/${id}`).set(true);
  state.word = null;
}
async function expireOldDrawings() {
  if (!db) return;
  const snap = await db.ref("drawings").orderByChild("status").equalTo("open").once("value");
  const jobs = [];
  snap.forEach(child => {
    const d = child.val();
    if (!d.solverId && Number(d.expiresAt) <= serverNow()) {
      jobs.push(child.ref.transaction(cur => cur && cur.status === "open" && !cur.solverId && Number(cur.expiresAt) <= serverNow() ? { ...cur, status: "expired", expiredAt: serverNow(), updatedAt: serverNow() } : undefined));
    }
  });
  await Promise.all(jobs);
}
async function loadOpenDrawings(sort = "new") {
  await expireOldDrawings();
  const snap = await db.ref("drawings").orderByChild("status").equalTo("open").once("value");
  const list = [];
  snap.forEach(child => {
    const d = child.val() || {};
    if (Number(d.expiresAt) > serverNow()) list.push({ ...d, id: child.key });
  });
  return list.sort((a, b) => sort === "new" ? b.createdAt - a.createdAt : a.createdAt - b.createdAt);
}
async function renderSolve() {
  if (!isConfigured()) { appEl.innerHTML = '<section class="screen"><div class="empty">Firebase 설정을 연결해 주세요.</div></section>'; return; }
  loading();
  const sort = sessionStorage.getItem("solveSort") || "new";
  try {
    const list = await loadOpenDrawings(sort);
    appEl.innerHTML = `<section class="screen"><div class="section-head"><div><h2>정답 맞히기</h2><p class="muted">그림 속 제시어를 찾아보세요!</p></div></div><div class="filters"><select id="solveSort"><option value="new" ${sort === "new" ? "selected" : ""}>최신순</option><option value="old" ${sort === "old" ? "selected" : ""}>과거순</option></select></div><div class="notice">힌트를 보면 정답 시 6점<br>힌트 없이 맞히면 10점</div><div id="openList">${list.length ? list.map(openDrawingCard).join("") : emptyHtml("", "아직 도전할 그림이 없어요.")}</div></section>`;
    solveSort.onchange = () => { sessionStorage.setItem("solveSort", solveSort.value); renderSolve(); };
    document.querySelectorAll("[data-hint]").forEach(button => button.onclick = () => {
      state.hintUsed[button.dataset.hint] = true;
      button.textContent = `카테고리: ${button.dataset.category}`;
      button.disabled = true;
    });
    document.querySelectorAll("[data-answer-form]").forEach(form => form.onsubmit = async event => {
      event.preventDefault();
      const id = form.dataset.answerForm;
      const button = form.querySelector("button");
      const input = form.querySelector("input");
      button.disabled = true;
      try {
        const result = await submitAnswer(id, input.value, !!state.hintUsed[id]);
        if (result.correct) {
          showToast(`정답! ${result.solverReward}점을 받았어요 `);
          await loadCurrentUser();
          renderSolve();
        } else {
          showToast(result.message);
          input.select();
          button.disabled = false;
        }
      } catch (error) {
        console.error("정답 확인 중 오류:", error);
        const permissionError = /permission[-_ ]?denied/i.test(`${error?.code || ""} ${error?.message || ""}`);
        showToast(permissionError
          ? "권한 확인 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요."
          : "정답 확인 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요.");
        button.disabled = false;
      }
    });
  } catch (error) {
    console.error(error);
    appEl.innerHTML = `<section class="screen">${emptyHtml("", "그림을 불러오지 못했어요.")}</section>`;
  }
}
function openDrawingCard(d) {
  const mine = d.drawerId === state.user.id;
  return `<article class="card drawing-card"><img src="${d.imageData}" alt="도전 중인 그림"><div class="meta"><span class="badge open">남은 시간: ${formatTime(d.expiresAt)}</span></div>${mine ? '<div class="notice">내 그림은 맞힐 수 없습니다.</div>' : `<button class="button secondary full" data-hint="${d.id}" data-category="${escapeHtml(d.category)}">카테고리 힌트 보기</button><form class="answer-row" data-answer-form="${d.id}"><input maxlength="30" autocomplete="off" placeholder="정답을 입력해요" aria-label="정답"><button class="button primary">정답!</button></form>`}</article>`;
}
async function updateDrawing(drawingId) {
  const imageData = state.canvas.toDataURL("image/png");
  const now = serverNow();
  let reason = "수정할 수 없는 그림이에요.";
  const result = await db.ref(`drawings/${drawingId}`).transaction(d => {
    if (!d) return;
    if (d.status !== "open" || d.drawerId !== state.user.id || d.solverId || Number(d.expiresAt) <= now) return;
    reason = "";
    return { ...d, imageData, updatedAt: now, revisionCount: (Number(d.revisionCount) || 0) + 1 };
  }, null, false);
  if (!result.committed) throw new Error(reason);
}
async function withdrawDrawing(drawingId) {
  const now = serverNow();
  const result = await db.ref(`drawings/${drawingId}`).transaction(d => d && d.status === "open" && d.drawerId === state.user.id && !d.solverId && Number(d.expiresAt) > now ? { ...d, status: "withdrawn", withdrawnAt: now, updatedAt: now } : undefined, null, false);
  if (!result.committed) throw new Error("회수할 수 없는 그림이에요.");
}
async function loadGalleryDrawings(status = state.galleryTab, sort = state.gallerySort) {
  await expireOldDrawings();
  const [snap, likesSnap] = await Promise.all([
    db.ref("drawings").orderByChild("status").equalTo(status).once("value"),
    db.ref("drawingLikes").once("value")
  ]);
  const likes = safeObject(likesSnap.val());
  const list = [];
  snap.forEach(child => {
    const d = child.val() || {};
    list.push({ ...d, likeCount: Object.keys(safeObject(likes[child.key])).length, id: child.key });
  });
  const timeKey = status === "solved" ? "solvedAt" : "expiredAt";
  return list.sort((a, b) => sort === "popular" ? (b.likeCount || 0) - (a.likeCount || 0) : sort === "new" ? b[timeKey] - a[timeKey] : a[timeKey] - b[timeKey]);
}
async function renderGallery() {
  if (!isConfigured()) { appEl.innerHTML = '<section class="screen"><div class="empty">Firebase 설정을 연결해 주세요.</div></section>'; return; }
  loading();
  try {
    const list = await loadGalleryDrawings();
    if (state.galleryIndex >= list.length) state.galleryIndex = 0;
    appEl.innerHTML = `<section class="screen"><h2>전시장</h2><p class="muted">그림을 감상하고 마음에 쏙 들면 좋아요!</p><div class="tabs"><button data-gallery-tab="solved" class="${state.galleryTab === "solved" ? "active" : ""}">완성 액자</button><button data-gallery-tab="expired" class="${state.galleryTab === "expired" ? "active" : ""}">미해결 그림</button></div><div class="gallery-controls"><div class="view-toggle"><button data-view="frame" class="${state.galleryView === "frame" ? "active" : ""}">액자 보기</button><button data-view="thumb" class="${state.galleryView === "thumb" ? "active" : ""}">썸네일 보기</button></div><select id="gallerySort"><option value="new" ${state.gallerySort === "new" ? "selected" : ""}>최신순</option><option value="old" ${state.gallerySort === "old" ? "selected" : ""}>과거순</option><option value="popular" ${state.gallerySort === "popular" ? "selected" : ""}>인기순</option></select></div><div id="galleryContent">${list.length ? (state.galleryView === "frame" ? galleryFrame(list, state.galleryIndex) : galleryThumbs(list)) : emptyHtml("🖼️", "아직 전시된 그림이 없어요.")}</div></section>`;
    bindGallery(list);
  } catch (error) {
    console.error(error);
    appEl.innerHTML = `<section class="screen">${emptyHtml("", "전시장을 불러오지 못했어요.")}</section>`;
  }
}
function galleryFrame(list, i) {
  const d = list[i];
  return `<div class="frame"><img class="frame-image" src="${d.imageData}" alt="전시 그림"></div><div class="frame-info"><button class="secret-word" data-secret>제시어 보기 </button><div class="meta"><span>그린 사람: ${escapeHtml(drawerName(d))}</span><span>${d.status === "solved" ? `맞힌 사람: ${escapeHtml(solverName(d))}` : "맞힌 사람: 없음"}</span></div><button class="button ${d.drawerId === state.user.id ? "ghost" : "secondary"} full" data-like="${d.id}" ${d.drawerId === state.user.id ? "disabled" : ""}>♡ 좋아요 ${Number(d.likeCount) || 0}${d.drawerId === state.user.id ? " · 내 그림" : ""}</button></div><div class="frame-nav"><button class="button ghost" data-prev ${i === 0 ? "disabled" : ""}>이전</button><span>${i + 1} / ${list.length}</span><button class="button ghost" data-next ${i === list.length - 1 ? "disabled" : ""}>다음</button></div>`;
}
function galleryThumbs(list) {
  return `<div class="thumbnail-grid">${list.map((d, i) => `<button class="thumbnail" data-thumb="${i}"><img src="${d.imageData}" alt="전시 그림"><small>♡ ${Number(d.likeCount) || 0} · ${escapeHtml(drawerName(d))}</small></button>`).join("")}</div>`;
}
function bindGallery(list) {
  document.querySelectorAll("[data-gallery-tab]").forEach(button => button.onclick = () => { state.galleryTab = button.dataset.galleryTab; state.galleryIndex = 0; renderGallery(); });
  document.querySelectorAll("[data-view]").forEach(button => button.onclick = () => { state.galleryView = button.dataset.view; renderGallery(); });
  gallerySort.onchange = () => { state.gallerySort = gallerySort.value; state.galleryIndex = 0; renderGallery(); };
  document.querySelector("[data-prev]")?.addEventListener("click", () => { state.galleryIndex--; renderGallery(); });
  document.querySelector("[data-next]")?.addEventListener("click", () => { state.galleryIndex++; renderGallery(); });
  document.querySelector("[data-secret]")?.addEventListener("click", e => { e.currentTarget.textContent = `제시어: ${list[state.galleryIndex].word}`; });
  document.querySelectorAll("[data-thumb]").forEach(button => button.onclick = () => { state.galleryIndex = Number(button.dataset.thumb); state.galleryView = "frame"; renderGallery(); });
  document.querySelector("[data-like]")?.addEventListener("click", async e => {
    e.currentTarget.disabled = true;
    try { await toggleLike(e.currentTarget.dataset.like); renderGallery(); }
    catch (error) { showToast(error.message); e.currentTarget.disabled = false; }
  });
}

async function loadRanking(type = state.rankingType) {
  const [usersSnap, claimsSnap, drawingsSnap] = await Promise.all([db.ref("users").once("value"), db.ref("scoreClaims").once("value"), db.ref("drawings").once("value")]);
  const claims = safeObject(claimsSnap.val());
  const drawings = safeObject(drawingsSnap.val());
  const list = [];
  usersSnap.forEach(child => {
    const u = child.val();
    const nickname = u.nickname || u.displayName || "";
    if (u.rankingDeleted || nickname.toLowerCase() === "admin") return;
    let score = 0;
    for (const [drawingId, claim] of Object.entries(safeObject(claims[child.key]))) {
      const inferredType = claimType(claim, drawings[drawingId], child.key);
      if (type === "total" || inferredType === type) score += claimScore(claim);
    }
    list.push({ id: child.key, ...u, nickname, score });
  });
  return list.sort((a, b) => (b.score || 0) - (a.score || 0) || a.createdAt - b.createdAt).slice(0, 30);
}
async function renderRanking() {
  loading();
  try {
    const list = await loadRanking();
    const labels = { total: "종합 랭킹", drawer: "그리기 랭킹", solver: "맞히기 랭킹" };
    appEl.innerHTML = `<section class="screen"><h2>랭킹</h2><p class="muted">${labels[state.rankingType]} 상위 30명까지 보여드려요.</p><div class="tabs ranking-tabs"><button data-ranking="total" class="${state.rankingType === "total" ? "active" : ""}">종합</button><button data-ranking="drawer" class="${state.rankingType === "drawer" ? "active" : ""}">그리기</button><button data-ranking="solver" class="${state.rankingType === "solver" ? "active" : ""}">맞히기</button></div><div>${list.map((u, i) => `<div class="rank-row ${u.id === state.user.id ? "mine" : ""}"><div class="rank-num">${i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}</div><div><b>${escapeHtml(u.nickname)}</b>${u.id === state.user.id ? "<small> · 나</small>" : ""}</div><div class="rank-score">${Number(u.score) || 0}점</div></div>`).join("") || emptyHtml("", "아직 랭킹이 비어 있어요.")}</div><button id="deleteRanking" class="button danger full" style="margin-top:20px">내 랭킹 삭제</button></section>`;
    document.querySelectorAll("[data-ranking]").forEach(button => button.onclick = () => { state.rankingType = button.dataset.ranking; renderRanking(); });
    document.querySelector("#deleteRanking").onclick = () => confirmModal("정말 내 랭킹을 삭제할까요?", "내 점수와 랭킹 기록이 사라집니다.\n하지만 이미 전시장에 올라간 그림은 삭제되지 않습니다.", async () => {
      await deleteMyRanking();
      showToast("랭킹을 삭제했어요.\n다음 로그인부터 0점으로 다시 참여해요.");
      await signOut();
    });
  } catch (error) {
    console.error(error);
  }
}
async function deleteMyRanking() {
  const now = serverNow();
  await db.ref().update({
    [`users/${state.user.id}/score`]: 0,
    [`users/${state.user.id}/rankingDeleted`]: true,
    [`users/${state.user.id}/rankingDeletedAt`]: now,
    [`users/${state.user.id}/lastSeenAt`]: now,
    [`scoreClaims/${state.user.id}`]: null
  });
}
async function renderManage() {
  if (!isConfigured()) { appEl.innerHTML = '<section class="screen"><div class="empty">Firebase 설정을 연결해 주세요.</div></section>'; return; }
  loading();
  try {
    await expireOldDrawings();
    const idsSnap = await db.ref(`userDrawings/${state.user.id}`).once("value");
    const ids = Object.keys(safeObject(idsSnap.val()));
    const all = await Promise.all(ids.map(async id => {
      const snap = await db.ref(`drawings/${id}`).once("value");
      return snap.exists() ? { ...(snap.val() || {}), id } : null;
    }));
    const list = all.filter(d => d && d.status === state.manageStatus).sort((a, b) => b.createdAt - a.createdAt);
    appEl.innerHTML = `<section class="screen"><h2>내 그림 관리</h2><p class="muted">내가 그린 그림을 상태별로 모아봐요.</p><div class="tabs status-tabs">${Object.entries(STATUS_LABEL).map(([k, v]) => `<button data-status="${k}" class="${state.manageStatus === k ? "active" : ""}">${v}</button>`).join("")}</div><div style="margin-top:15px">${list.length ? list.map(manageCard).join("") : emptyHtml("", "여기에 해당하는 그림이 없어요.")}</div></section>`;
    document.querySelectorAll("[data-status]").forEach(button => button.onclick = () => { state.manageStatus = button.dataset.status; renderManage(); });
    document.querySelectorAll("[data-edit]").forEach(button => button.onclick = () => {
      const d = list.find(x => x.id === button.dataset.edit);
      state.editDrawing = d;
      state.word = { word: d.word, category: d.category, answers: d.answers || [d.word], isCustomWord: !!d.isCustomWord };
      route("draw");
    });
    document.querySelectorAll("[data-withdraw]").forEach(button => button.onclick = () => confirmModal("정말 이 그림을 회수할까요?", "회수한 그림은 복구할 수 없고,\n전시장에도 전시되지 않습니다.", async () => {
      await withdrawDrawing(button.dataset.withdraw);
      showToast("그림을 회수했어요.");
      renderManage();
    }));
  } catch (error) {
    console.error(error);
  }
}
function manageCard(d) {
  return `<article class="card drawing-card"><img src="${d.imageData}" alt="내 그림"><div class="meta"><span class="badge ${d.status}">${STATUS_LABEL[d.status]}</span><span>제시어: ${escapeHtml(d.word)}</span>${d.status === "open" ? `<span>남은 시간: ${formatTime(d.expiresAt)}</span><span>수정 ${Number(d.revisionCount) || 0}회</span>` : ""}</div>${d.status === "open" ? `<div class="notice">수정할 때마다 최종 보상 -2점</div><div class="button-row"><button class="button secondary" data-edit="${d.id}">수정하기</button><button class="button danger" data-withdraw="${d.id}">회수하기</button></div>` : d.status === "solved" ? `<p>맞힌 사람: <b>${escapeHtml(solverName(d))}</b><br>획득 점수: <b>${Number(d.drawerReward) || 0}점</b></p>` : d.status === "expired" ? "<p>아무도 맞히지 못했어요.<br>획득 점수: <b>0점</b></p>" : '<p class="muted">회수한 그림은 다시 복구할 수 없어요.</p>'}</article>`;
}

async function submitFeedback(content, isAnonymous, isSecret) {
  content = content.trim();
  if (content.length <= 5) throw new Error("조금만 더 자세히 적어주세요.");
  if (content.length > 300) throw new Error("300자 이내로 줄여주세요.");
  const now = serverNow();
  const ref = db.ref("feedbackMeta").push();
  const id = ref.key;
  const meta = { createdAt: now, updatedAt: now, isAnonymous: !!isAnonymous, isSecret: !!isSecret, displayAuthor: isAnonymous ? "익명" : state.user.nickname, status: "open", hidden: false, deleted: false, likeCount: 0, dislikeCount: 0, popularityScore: 0 };
  await db.ref(`feedbackOwners/${id}/${state.user.id}`).set(true);
  try {
    await db.ref(`userFeedback/${state.user.id}/${id}`).set(true);
    await db.ref(`feedbackMeta/${id}`).set(meta);
    await db.ref(`feedbackContent/${id}`).set({ content, adminReply: null, repliedAt: null, repliedBy: null, repliedByNickname: null });
  } catch (error) {
    try { await db.ref(`feedbackMeta/${id}`).update({ deleted: true, deletedAt: serverNow(), updatedAt: serverNow() }); } catch (_) {}
    throw error;
  }
}
async function loadFeedback() {
  const [metaSnap, mySnap, reactionsSnap] = await Promise.all([db.ref("feedbackMeta").once("value"), db.ref(`userFeedback/${state.user.id}`).once("value"), db.ref("feedbackReactions").once("value")]);
  const mine = safeObject(mySnap.val());
  const reactions = safeObject(reactionsSnap.val());
  const items = [];
  const jobs = [];
  metaSnap.forEach(child => {
    const reactionValues = Object.values(safeObject(reactions[child.key]));
    const likeCount = reactionValues.filter(v => v === "like").length;
    const dislikeCount = reactionValues.filter(v => v === "dislike").length;
    const meta = { id: child.key, ...child.val(), likeCount, dislikeCount, popularityScore: likeCount - dislikeCount, isMine: !!mine[child.key] };
    if (meta.deleted) return;
    if (state.feedbackView === "mine" && !meta.isMine) return;
    if (meta.hidden && !state.isAdmin) return;
    const canRead = !meta.isSecret || meta.isMine || state.isAdmin;
    jobs.push((async () => {
      let content = null;
      if (canRead) {
        try { content = (await db.ref(`feedbackContent/${meta.id}`).once("value")).val(); } catch (_) { content = null; }
      }
      items.push({ ...meta, content });
    })());
  });
  await Promise.all(jobs);
  const comparators = {
    new: (a, b) => b.createdAt - a.createdAt,
    old: (a, b) => a.createdAt - b.createdAt,
    popular: (a, b) => (b.popularityScore || 0) - (a.popularityScore || 0),
    likes: (a, b) => (b.likeCount || 0) - (a.likeCount || 0),
    dislikes: (a, b) => (b.dislikeCount || 0) - (a.dislikeCount || 0)
  };
  return items.sort(comparators[state.feedbackSort]);
}
async function updateFeedback(id, content) {
  content = content.trim();
  if (content.length <= 5) throw new Error("조금만 더 자세히 적어주세요.");
  if (content.length > 300) throw new Error("300자 이내로 줄여주세요.");
  const owner = (await db.ref(`feedbackOwners/${id}/${state.user.id}`).once("value")).val() === true;
  if (!owner) throw new Error("내 의견만 수정할 수 있어요.");
  await db.ref().update({ [`feedbackContent/${id}/content`]: content, [`feedbackMeta/${id}/updatedAt`]: serverNow() });
}
async function deleteFeedback(id) {
  const owner = (await db.ref(`feedbackOwners/${id}/${state.user.id}`).once("value")).val() === true;
  if (!owner) throw new Error("내 의견만 삭제할 수 있어요.");
  await db.ref(`feedbackMeta/${id}`).update({ deleted: true, deletedAt: serverNow(), updatedAt: serverNow() });
}
async function saveAdminReply(id, reply) {
  if (!state.isAdmin) throw new Error("관리자만 답변할 수 있어요.");
  reply = reply.trim();
  if (!reply) throw new Error("답변 내용을 입력해 주세요.");
  await db.ref().update({ [`feedbackContent/${id}/adminReply`]: reply, [`feedbackContent/${id}/repliedAt`]: serverNow(), [`feedbackContent/${id}/repliedBy`]: state.user.id, [`feedbackContent/${id}/repliedByNickname`]: state.user.nickname, [`feedbackMeta/${id}/status`]: "answered", [`feedbackMeta/${id}/updatedAt`]: serverNow() });
}
async function toggleFeedbackHidden(id, hidden) {
  if (!state.isAdmin) throw new Error("관리자만 관리할 수 있어요.");
  await db.ref(`feedbackMeta/${id}`).update({ hidden, updatedAt: serverNow() });
}
async function renderFeedback() {
  loading();
  try {
    const list = await loadFeedback();
    const editing = state.editingFeedback;
    appEl.innerHTML = `<section class="screen"><h2>의견 보내기</h2><p class="muted">게임에 바라는 점이나 불편한 점을 남겨주세요.</p><form id="feedbackForm" class="card feedback-form"><textarea id="feedbackText" maxlength="300" placeholder="의견을 적어주세요" required>${editing ? escapeHtml(editing.content) : ""}</textarea>${editing ? "" : `<label class="check-row"><input id="anonymousCheck" type="checkbox"> 익명으로 올리기</label><label class="check-row"><input id="secretCheck" type="checkbox"> 비밀글로 올리기</label>`}<div class="button-row">${editing ? '<button id="cancelFeedbackEdit" class="button ghost" type="button">취소</button>' : ""}<button class="button primary" type="submit">${editing ? "수정 저장" : "보내기"}</button></div></form><div class="feedback-view-tabs"><button data-feedback-view="all" class="${state.feedbackView === "all" ? "active" : ""}">전체 글</button><button data-feedback-view="mine" class="${state.feedbackView === "mine" ? "active" : ""}">내 글</button></div><div class="feedback-sorts">${FEEDBACK_SORTS.map(([key, label]) => `<button data-feedback-sort="${key}" class="${state.feedbackSort === key ? "active" : ""}">${label}</button>`).join("")}</div><div>${list.length ? list.map(feedbackCard).join("") : emptyHtml("", "아직 의견이 없어요.")}</div></section>`;
    bindFeedback(list);
  } catch (error) {
    console.error(error);
    appEl.innerHTML = `<section class="screen">${emptyHtml("", "의견을 불러오지 못했어요.")}</section>`;
  }
}
function feedbackCard(f) {
  const secretLocked = f.isSecret && !f.content;
  const body = secretLocked ? '<div class="secret-feedback">🔒 비밀글입니다.<br><span>운영자와 작성자만 내용을 볼 수 있습니다.</span></div>' : `<p class="feedback-content">${escapeHtml(f.content?.content || "")}</p>`;
  const reply = f.content?.adminReply ? `<div class="admin-reply"><b>💬 운영자 답변</b><p>${escapeHtml(f.content.adminReply)}</p></div>` : "";
  return `<article class="card feedback-card ${f.hidden ? "is-hidden" : ""}"><div class="feedback-head"><b>${f.isSecret ? "🔒 " : ""}${escapeHtml(f.displayAuthor)}</b><span>${f.status === "answered" ? "답변 완료" : "답변 대기"}${f.hidden ? " · 숨김" : ""}</span></div>${body}${reply}<div class="reaction-row"><button data-react="like" data-id="${f.id}" ${f.isMine ? "disabled" : ""}>👍 ${Number(f.likeCount) || 0}</button><button data-react="dislike" data-id="${f.id}" ${f.isMine ? "disabled" : ""}>👎 ${Number(f.dislikeCount) || 0}</button></div>${f.isMine ? `<div class="button-row compact"><button class="button ghost" data-edit-feedback="${f.id}">수정</button><button class="button danger" data-delete-feedback="${f.id}">삭제</button></div>` : ""}${state.isAdmin ? `<div class="admin-tools"><textarea data-reply-text="${f.id}" placeholder="운영자 답변">${escapeHtml(f.content?.adminReply || "")}</textarea><div class="button-row compact"><button class="button secondary" data-admin-reply="${f.id}">${f.content?.adminReply ? "답변 수정" : "답변하기"}</button><button class="button ghost" data-admin-hide="${f.id}" data-hidden="${f.hidden}">${f.hidden ? "다시 보이기" : "숨기기"}</button></div></div>` : ""}</article>`;
}
function bindFeedback(list) {
  const form = document.querySelector("#feedbackForm");
  form.onsubmit = async event => {
    event.preventDefault();
    const button = event.submitter;
    const content = document.querySelector("#feedbackText").value;
    button.disabled = true;
    try {
      if (state.editingFeedback) await updateFeedback(state.editingFeedback.id, content);
      else await submitFeedback(content, document.querySelector("#anonymousCheck").checked, document.querySelector("#secretCheck").checked);
      state.editingFeedback = null;
      showToast("의견을 저장했어요.");
      renderFeedback();
    } catch (error) {
      showToast(error.message);
      button.disabled = false;
    }
  };
  document.querySelector("#cancelFeedbackEdit")?.addEventListener("click", () => { state.editingFeedback = null; renderFeedback(); });
  document.querySelectorAll("[data-feedback-view]").forEach(button => button.onclick = () => { state.feedbackView = button.dataset.feedbackView; state.editingFeedback = null; renderFeedback(); });
  document.querySelectorAll("[data-feedback-sort]").forEach(button => button.onclick = () => { state.feedbackSort = button.dataset.feedbackSort; renderFeedback(); });
  document.querySelectorAll("[data-react]").forEach(button => button.onclick = async () => { button.disabled = true; try { await toggleFeedbackReaction(button.dataset.id, button.dataset.react); renderFeedback(); } catch (error) { showToast(error.message); button.disabled = false; } });
  document.querySelectorAll("[data-edit-feedback]").forEach(button => button.onclick = () => { const feedback = list.find(item => item.id === button.dataset.editFeedback); state.editingFeedback = { id: feedback.id, content: feedback.content?.content || "" }; renderFeedback(); });
  document.querySelectorAll("[data-delete-feedback]").forEach(button => button.onclick = () => confirmModal("의견을 삭제할까요?", "삭제한 의견은 목록에서 보이지 않습니다.", async () => { await deleteFeedback(button.dataset.deleteFeedback); showToast("의견을 삭제했어요."); renderFeedback(); }));
  document.querySelectorAll("[data-admin-reply]").forEach(button => button.onclick = async () => { button.disabled = true; try { await saveAdminReply(button.dataset.adminReply, document.querySelector(`[data-reply-text="${button.dataset.adminReply}"]`).value); showToast("답변을 저장했어요."); renderFeedback(); } catch (error) { showToast(error.message); button.disabled = false; } });
  document.querySelectorAll("[data-admin-hide]").forEach(button => button.onclick = async () => { button.disabled = true; try { await toggleFeedbackHidden(button.dataset.adminHide, button.dataset.hidden !== "true"); renderFeedback(); } catch (error) { showToast(error.message); button.disabled = false; } });
}

function renderGuide() {
  const items = [
    ["캐치갤러리란?", "그림을 그리고, 다른 사람이 정답을 맞히는 그림 퀴즈 게임입니다.", "#ff8ea1"],
    ["로그인", "닉네임과 비밀번호로 로그인하면 다른 기기에서도 기록을 이어갈 수 있습니다.", "#f0c75a"],
    ["그림 그리기", "그림은 게시만으로 점수를 얻지 않습니다. 누군가 맞혀야 점수를 얻습니다.", "#73cba5"],
    ["정답 맞히기", "한 그림은 단 한 명만 맞힐 수 있습니다. 자기 그림은 맞힐 수 없습니다.", "#77bfea"],
    ["힌트와 점수", "힌트 없이 맞히면 양쪽 10점, 힌트를 보면 양쪽 6점입니다. 수정한 그림은 그린 사람의 점수가 1회당 2점 줄어요.", "#b59ae3"],
    ["그림 수정·회수", "도전 중인 내 그림은 수정하거나 회수할 수 있습니다.\n회수하면 복구할 수 없어요.", "#ffad88"],
    ["48시간 미해결 마감", "48시간 동안 아무도 못 맞히면 미해결 그림으로 전시됩니다.", "#8ecbc6"],
    ["전시장과 좋아요", "완성 액자와 미해결 그림을 볼 수 있습니다.\n제시어는 터치하면 공개되고, 남의 그림에 좋아요를 누를 수 있어요.", "#e99ca9"],
    ["의견 보내기", "게임에 바라는 점이나 불편한 점을 익명 또는 비밀글로 남길 수 있습니다.", "#79b9d3"],
    ["랭킹 삭제", "점수와 랭킹 기록은 사라지지만 이미 전시장에 올라간 그림은 그대로 남습니다.", "#a9a1cf"]
  ];
  appEl.innerHTML = `<section class="screen"><h2>게임설명</h2><p class="muted">알고 나면 더 재미있는 캐치갤러리!</p>${items.map(x => `<article class="card guide-card" style="--accent:${x[2]}"><h3>${x[0]}</h3><p>${x[1]}</p></article>`).join("")}</section>`;
}
function emptyHtml(icon, text) { return `<div class="empty"><div class="empty-icon">${icon}</div><p>${text}</p></div>`; }
function confirmModal(title, message, onConfirm) {
  const root = document.querySelector("#modalRoot");
  root.innerHTML = `<div class="modal-backdrop"><div class="modal"><h3>${title}</h3><p>${message}</p><div class="button-row"><button class="button ghost" data-cancel>취소</button><button class="button danger" data-confirm>확인</button></div></div></div>`;
  root.querySelector("[data-cancel]").onclick = () => root.innerHTML = "";
  root.querySelector("[data-confirm]").onclick = async event => {
    event.currentTarget.disabled = true;
    try { await onConfirm(); root.innerHTML = ""; }
    catch (error) { showToast(error.message); event.currentTarget.disabled = false; }
  };
}

async function claimAnswerRewards(drawingId, drawing) {
  const createdAt = Number(drawing.solvedAt) || serverNow();
  await db.ref().update({
    [`scoreClaims/${drawing.solverId}/${drawingId}`]: { score: drawing.solverReward, type: "solver", createdAt },
    [`scoreClaims/${drawing.drawerId}/${drawingId}`]: { score: drawing.drawerReward, type: "drawer", createdAt },
    [`userSolved/${drawing.solverId}/${drawingId}`]: true
  });
}
async function resolveDrawingId(drawingId) {
  if (!drawingId) return drawingId;
  const directSnap = await db.ref(`drawings/${drawingId}`).once("value");
  if (directSnap.exists()) return drawingId;
  const snap = await db.ref("drawings").once("value");
  let found = null;
  snap.forEach(child => {
    const d = child.val() || {};
    if (d.id === drawingId || d.legacyId === drawingId || d.drawingId === drawingId) found = child.key;
  });
  return found || drawingId;
}
async function submitAnswer(drawingId, answer, hintUsed) {
  answer = String(answer || "").trim();
  if (!answer) return { correct: false, message: "정답을 입력해 주세요." };

  const resolvedId = await resolveDrawingId(drawingId);
  const drawingRef = db.ref(`drawings/${resolvedId}`);

  // Firebase Realtime Database transaction의 update 함수는
  // 해당 경로의 값이 서버에는 있어도 클라이언트 캐시가 비어 있으면
  // 첫 호출에서 null을 받을 수 있다.
  // 여기서 바로 return 하면 실제 그림이 있는데도 "그림을 찾을 수 없어요."가 뜨므로,
  // transaction 전에 한 번 읽어 둔 값을 안전한 fallback으로 사용한다.
  const beforeSnap = await drawingRef.once("value");
  const fallbackDrawing = beforeSnap.val();
  if (!fallbackDrawing) return { correct: false, message: "그림을 찾을 수 없어요." };

  const now = serverNow();
  let outcome = { correct: false, message: "아쉽지만 정답이 아니에요." };
  let settledDrawing = null;

  const result = await drawingRef.transaction(current => {
    const d = current || fallbackDrawing;
    if (!d) { outcome.message = "그림을 찾을 수 없어요."; return; }

    if (d.status === "solved" && d.solverId === state.user.id) {
      settledDrawing = d;
      outcome = { correct: true, solverReward: d.solverReward, drawerReward: d.drawerReward };
      return d;
    }

    if (d.drawerId === state.user.id) { outcome.message = "내 그림은 맞힐 수 없습니다."; return d; }
    if (d.status !== "open" || d.solverId) { outcome.message = "이미 도전이 끝난 그림이에요."; return d; }

    if (Number(d.expiresAt) <= now) {
      outcome.message = "방금 마감된 그림이에요.";
      return { ...d, status: "expired", expiredAt: now, updatedAt: now };
    }

    const storedAnswers = Array.isArray(d.answers) ? d.answers : Object.values(safeObject(d.answers));
    const acceptedAnswers = [d.word, ...storedAnswers];
    if (!acceptedAnswers.some(candidate => normalizeAnswer(candidate) === normalizeAnswer(answer))) return d;

    const base = hintUsed ? 6 : 10;
    const drawerReward = Math.max(0, base - (Number(d.revisionCount) || 0) * 2);
    outcome = { correct: true, solverReward: base, drawerReward };

    return {
      ...d,
      status: "solved",
      solverId: state.user.id,
      solverNickname: state.user.nickname,
      solvedAt: now,
      updatedAt: now,
      hintUsed: !!hintUsed,
      solverReward: base,
      drawerReward
    };
  }, null, false);

  if (settledDrawing) {
    await claimAnswerRewards(resolvedId, settledDrawing);
    return outcome;
  }

  if (!outcome.correct) return outcome;
  if (!result.committed) return { correct: false, message: "다른 사람이 먼저 맞혔어요." };

  await claimAnswerRewards(resolvedId, result.snapshot.val());
  return outcome;
}
async function toggleLike(drawingId) {
  const drawing = (await db.ref(`drawings/${drawingId}`).once("value")).val();
  if (!drawing || !["solved", "expired"].includes(drawing.status)) throw new Error("좋아요를 누를 수 없는 그림이에요.");
  if (drawing.drawerId === state.user.id) throw new Error("내 그림에는 좋아요를 누를 수 없어요.");
  let liked = false;
  const result = await db.ref(`drawingLikes/${drawingId}/${state.user.id}`).transaction(value => {
    liked = value !== true;
    return liked ? true : null;
  }, null, false);
  if (!result.committed) throw new Error("좋아요를 바꾸지 못했어요.");
  showToast(liked ? "좋아요를 눌렀어요!" : "좋아요를 취소했어요.");
}
async function toggleFeedbackReaction(id, next) {
  const owner = (await db.ref(`feedbackOwners/${id}/${state.user.id}`).once("value")).val() === true;
  if (owner) throw new Error("내 의견에는 반응할 수 없어요.");
  let current = null;
  const result = await db.ref(`feedbackReactions/${id}/${state.user.id}`).transaction(value => {
    current = value === next ? null : next;
    return current;
  }, null, false);
  if (!result.committed) throw new Error("반응을 저장하지 못했어요.");
  showToast(current ? `${current === "like" ? "좋아요" : "싫어요"}를 눌렀어요.` : "반응을 취소했어요.");
}

boot();
