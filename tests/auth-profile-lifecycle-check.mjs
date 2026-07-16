import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");

function pick(name) {
  const pattern = new RegExp(`(?:async )?function ${name}\\(`);
  const match = pattern.exec(source);
  assert.ok(match, `${name} must exist`);
  const start = match.index;
  const remainder = source.slice(start + 1);
  const next = /\n(?:async )?function [A-Za-z0-9_]+\(/.exec(remainder);
  return source.slice(start, next ? start + 1 + next.index : source.length).trim();
}

const functionNames = [
  "normalizeNickname", "nicknameKey", "internalEmail", "nicknameFromInternalEmail", "validateCredentials", "authMessage",
  "authEmailKey", "claimAuthOwner", "isAuthPreparationCurrent", "profileNickname", "claimNicknameIndex",
  "ensureUserProfile", "loadCurrentUser", "prepareAuthSession", "observeSignupDatabase", "cleanupSignup", "signUp", "signIn",
  "applyLoggedOut", "signOut", "handleAuthState"
];

function deferred() {
  let resolve, reject;
  const promise = new Promise((done, fail) => { resolve = done; reject = fail; });
  return { promise, resolve, reject };
}
async function settle() { for (let index = 0; index < 12; index++) await Promise.resolve(); }
function snapshot(value) { return { val: () => value, exists: () => value !== null && value !== undefined }; }

function harness({ users = {}, indexes = {}, admins = {}, claims = {}, stored = {}, dom = null } = {}) {
  const counters = { authSignIn: 0, authSignUp: 0, authSignOut: 0, authDelete: 0, usersRead: 0, usersSet: 0, usersUpdate: 0, usersRemove: 0, indexRead: 0, indexWrite: 0, indexRemove: 0, adminRead: 0, claimsRead: 0, routes: 0, cacheChanges: 0, expiry: 0, toasts: 0 };
  const values = { users: structuredClone(users), indexes: structuredClone(indexes), admins: structuredClone(admins), claims: structuredClone(claims) };
  const failures = {};
  function failureFor(name) {
    const failure = failures[name];
    if (!failure) return null;
    if (failure.once) delete failures[name];
    return failure.error || failure;
  }
  const gates = new Map();
  const storage = new Map(Object.entries(stored));
  const localStorage = {
    getItem: key => storage.has(key) ? storage.get(key) : null,
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: key => storage.delete(key)
  };
  const db = { ref(path) {
    const [root, key] = path.split("/");
    return {
      async once() {
        const failure = failureFor(`once:${path}`); if (failure) throw failure;
        if (gates.has(path)) await gates.get(path).promise;
        if (root === "users") counters.usersRead++;
        if (root === "admins") counters.adminRead++;
        if (root === "scoreClaims") counters.claimsRead++;
        return snapshot(values[root === "nicknameIndex" ? "indexes" : root]?.[key] ?? null);
      },
      async set(value) { const failure = failureFor(`set:${path}`); if (failure) throw failure; if (root === "users") counters.usersSet++; values[root][key] = structuredClone(value); },
      async update(changes) {
        if (root === "users") counters.usersUpdate++;
        const next = { ...values[root][key] };
        for (const [field, value] of Object.entries(changes)) { if (value === null) delete next[field]; else next[field] = value; }
        values[root][key] = next;
      },
      async remove() {
        const failure = failureFor(`remove:${path}`); if (failure) throw failure;
        if (root === "users") counters.usersRemove++;
        if (root === "nicknameIndex") counters.indexRemove++;
        delete values[root === "nicknameIndex" ? "indexes" : root][key];
      },
      async transaction(updater) {
        const failure = failureFor(`transaction:${path}`); if (failure) throw failure;
        counters.indexRead++;
        const next = updater(values.indexes[key] ?? null);
        if (next === undefined) return { committed: false, snapshot: snapshot(values.indexes[key] ?? null) };
        counters.indexWrite++;
        values.indexes[key] = next;
        const afterCommitFailure = failureFor(`transactionAfterCommit:${path}`); if (afterCommitFailure) throw afterCommitFailure;
        return { committed: true, snapshot: snapshot(next) };
      }
    };
  } };
  const state = { user: null, isAdmin: false, authReady: false, cacheOwnerUid: null, route: "login" };
  const auth = {
    currentUser: null,
    hook: null,
    async signInWithEmailAndPassword(email) {
      counters.authSignIn++;
      if (this.signInError) throw this.signInError;
      const user = this.nextUser || makeUser("uid-login", email);
      this.currentUser = user;
      if (this.hook) this.hook(user);
      return { user };
    },
    async createUserWithEmailAndPassword(email) {
      counters.authSignUp++;
      if (this.signUpError) throw this.signUpError;
      const user = this.nextUser || makeUser("uid-signup", email);
      this.currentUser = user;
      if (this.hook) this.hook(user);
      return { user };
    },
    async signOut() { counters.authSignOut++; this.currentUser = null; if (this.hook) this.hook(null); }
  };
  function makeUser(uid, email) {
    return { uid, email, async delete() { counters.authDelete++; if (auth.deleteError) throw auth.deleteError; if (auth.currentUser?.uid === uid) auth.currentUser = null; if (auth.hook) auth.hook(null); } };
  }
  const scoreEl = { textContent: "" };
  const api = Function(
    "state", "auth", "db", "localStorage", "serverNow", "setCacheSession", "scoreEl", "location", "transitionRoute", "expireOldDrawings", "console", "showToast", "userErrorMessage", "loadUserScore", "document",
    `"use strict"; ${functionNames.map(pick).join("\n")}\nreturn { ${functionNames.join(", ")} };`
  )(
    state, auth, db, localStorage, () => 1000,
    uid => { const next = uid || null; if (state.cacheOwnerUid === next) return false; state.cacheOwnerUid = next; counters.cacheChanges++; return true; },
    scoreEl, { hash: "" }, () => { counters.routes++; }, async () => { counters.expiry++; }, { error() {} }, () => { counters.toasts++; }, error => error.message,
    async uid => { counters.claimsRead++; return Object.values(values.claims[uid] || {}).reduce((sum, claim) => sum + (Number(claim?.score) || 0), 0); },
    dom || { querySelector: () => null }
  );
  auth.hook = user => { api.handleAuthState(user).catch(() => {}); };
  return { api, auth, db, state, values, counters, storage, gates, failures, makeUser, scoreEl };
}

const nickname = "테스트";
const key = "u_" + Array.from(new TextEncoder().encode(nickname), byte => byte.toString(16).padStart(2, "0")).join("");
const email = `${key}@catchgallery.app`;
const existingProfile = { nickname, nicknameKey: key, score: 0, createdAt: 10, lastSeenAt: 20, rankingDeleted: false };

// A normal login and its auth callback share one preparation.
{
  const h = harness({ users: { u1: existingProfile }, admins: { u1: true }, claims: { u1: { a: { score: 7 } } }, stored: { catchGalleryNickname: "이전값" } });
  h.auth.nextUser = h.makeUser("u1", email);
  const user = await h.api.signIn(nickname, "123456");
  assert.equal(user.id, "u1");
  assert.deepEqual(h.counters, { ...h.counters, authSignIn: 1, usersRead: 1, usersSet: 0, usersUpdate: 1, indexRead: 0, indexWrite: 0, adminRead: 1, claimsRead: 1, routes: 1, cacheChanges: 1, expiry: 1 });
  assert.equal(h.storage.get("catchGalleryNickname"), nickname);
  await h.api.handleAuthState(h.auth.currentUser);
  assert.equal(h.counters.usersRead, 1, "same-UID callback must not prepare twice");
  assert.equal(h.counters.routes, 1);
}

// Signup intent exists before Auth fires, so callback-first completion creates once.
{
  const h = harness();
  h.auth.nextUser = h.makeUser("new", email);
  const user = await h.api.signUp(nickname, "123456");
  assert.equal(user.id, "new");
  assert.equal(h.counters.authSignUp, 1);
  assert.equal(h.counters.usersRead, 1);
  assert.equal(h.counters.usersSet, 1);
  assert.equal(h.counters.usersUpdate, 0);
  assert.equal(h.counters.indexRead, 1);
  assert.equal(h.counters.indexWrite, 1);
  assert.equal(h.counters.adminRead, 1);
  assert.equal(h.counters.claimsRead, 1);
  assert.equal(h.counters.routes, 1);
  assert.equal(h.storage.get("catchGalleryNickname"), nickname);
}

// Failed Auth never changes the previously stored nickname or route.
for (const code of ["auth/wrong-password", "auth/user-not-found", "auth/network-request-failed"]) {
  const h = harness({ stored: { catchGalleryNickname: "기존닉" } });
  h.auth.signInError = Object.assign(new Error("failed"), { code });
  await assert.rejects(h.api.signIn(nickname, "123456"));
  assert.equal(h.storage.get("catchGalleryNickname"), "기존닉");
  assert.equal(h.counters.routes, 0);
}
for (const code of ["auth/email-already-in-use", "auth/weak-password"]) {
  const h = harness({ stored: { catchGalleryNickname: "기존닉" } });
  h.auth.signUpError = Object.assign(new Error("failed"), { code });
  await assert.rejects(h.api.signUp(nickname, "123456"));
  assert.equal(h.storage.get("catchGalleryNickname"), "기존닉");
  assert.equal(h.counters.routes, 0);
}

// A delayed A result cannot overwrite B or emit a stale toast.
{
  const aProfile = { ...existingProfile, nickname: "가", nicknameKey: "u_eab080" };
  const bProfile = { ...existingProfile, nickname: "나", nicknameKey: "u_eb8298" };
  const h = harness({ users: { a: aProfile, b: bProfile }, admins: { a: true, b: false }, claims: { a: { x: { score: 9 } }, b: { x: { score: 3 } } } });
  const gate = deferred(); h.gates.set("users/a", gate);
  const userA = h.makeUser("a", "u_eab080@catchgallery.app");
  const userB = h.makeUser("b", "u_eb8298@catchgallery.app");
  h.auth.currentUser = userA;
  const late = h.api.handleAuthState(userA);
  await settle();
  h.auth.currentUser = userB;
  await h.api.handleAuthState(userB);
  gate.resolve();
  await late;
  assert.equal(h.state.user.id, "b");
  assert.equal(h.state.isAdmin, false);
  assert.equal(h.scoreEl.textContent, "3점");
  assert.equal(h.counters.routes, 1);
  assert.equal(h.counters.toasts, 0);
}

// Ranking deletion is restored with a partial update that preserves other fields.
{
  const profile = { ...existingProfile, rankingDeleted: true, rankingDeletedAt: 55, score: 0, customLegacy: "keep" };
  const h = harness({ users: { rank: profile } });
  const user = h.makeUser("rank", email); h.auth.currentUser = user;
  await h.api.handleAuthState(user);
  assert.equal(h.values.users.rank.rankingDeleted, false);
  assert.equal(h.values.users.rank.score, 0);
  assert.equal("rankingDeletedAt" in h.values.users.rank, false);
  assert.equal(h.values.users.rank.customLegacy, "keep");
  assert.equal(h.counters.usersSet, 0);
  assert.equal(h.counters.usersUpdate, 1);
}

// Email recovery accepts only canonical catchgallery keys and valid UTF-8 names.
{
  const h = harness();
  assert.equal(h.api.nicknameFromInternalEmail(email), nickname);
  assert.equal(h.api.nicknameFromInternalEmail(`${key}@example.com`), null);
  assert.equal(h.api.nicknameFromInternalEmail("u_xyz@catchgallery.app"), null);
  assert.equal(h.api.nicknameFromInternalEmail("u_ff@catchgallery.app"), null);
  assert.equal(h.api.nicknameFromInternalEmail("u_@catchgallery.app"), null);
}

// Automatic login can rebuild a missing profile from Auth email without localStorage.
{
  const h = harness();
  const user = h.makeUser("recover", email); h.auth.currentUser = user;
  const recovered = await h.api.handleAuthState(user);
  assert.equal(recovered.nickname, nickname);
  assert.equal(h.counters.authSignIn, 0);
  assert.equal(h.counters.usersRead, 1);
  assert.equal(h.counters.usersSet, 1);
  assert.equal(h.counters.indexWrite, 1);
  assert.equal(h.counters.routes, 1);
}
{
  const h = harness({ stored: { catchGalleryNickname: nickname } });
  const user = h.makeUser("invalid", `${key}@example.com`); h.auth.currentUser = user;
  assert.equal(await h.api.handleAuthState(user), null);
  assert.equal(h.values.users.invalid, undefined);
  assert.equal(h.counters.toasts, 1);
  assert.equal(h.counters.authSignOut, 1);
}

// Occupied indexes never get overwritten and a failed signup cleans Auth/profile.
{
  const h = harness({ indexes: { [key]: "other" }, stored: { catchGalleryNickname: "기존닉" } });
  h.auth.nextUser = h.makeUser("new", email);
  let failure;
  try { await h.api.signUp(nickname, "123456"); } catch (error) { failure = error; }
  assert.ok(failure);
  assert.ok(failure.cleanupState, JSON.stringify({ message: failure.message, current: h.auth.currentUser?.uid, counters: h.counters, users: h.values.users, indexes: h.values.indexes }));
  assert.equal(failure.cleanupState?.stale, false);
  assert.equal(h.values.indexes[key], "other");
  assert.equal(h.values.users.new.nickname, nickname, "conflicting index keeps the recoverable profile");
  assert.equal(h.counters.authDelete, 0);
  assert.equal(h.counters.authSignOut, 1);
  assert.equal(h.storage.get("catchGalleryNickname"), "기존닉");
  assert.equal(h.counters.routes, 1, "the affected signup user returns to login once");
}

// Creation and follow-up failures clean what they safely can; deletion failures remain recoverable.
{
  const h = harness({ stored: { catchGalleryNickname: "기존닉" } });
  h.auth.nextUser = h.makeUser("set-fail", email);
  h.failures[`set:users/set-fail`] = new Error("profile set failed");
  await assert.rejects(h.api.signUp(nickname, "123456"));
  assert.equal(h.counters.authDelete, 1);
  assert.equal(h.storage.get("catchGalleryNickname"), "기존닉");
}

// A transaction may commit server-side and still reject locally. Uncertain cleanup preserves Auth/data when removal cannot be confirmed.
{
  const h = harness({ stored: { catchGalleryNickname: "기존닉" } });
  h.auth.nextUser = h.makeUser("ambiguous", email);
  h.failures[`transactionAfterCommit:nicknameIndex/${key}`] = new Error("network lost after commit");
  h.failures[`remove:nicknameIndex/${key}`] = new Error("index remove response lost");
  let failure;
  try { await h.api.signUp(nickname, "123456"); } catch (error) { failure = error; }
  assert.ok(failure?.cleanupState);
  assert.equal(h.values.users.ambiguous.nickname, nickname);
  assert.equal(h.values.indexes[key], "ambiguous");
  assert.equal(failure.cleanupState.database.profile, "present");
  assert.equal(failure.cleanupState.database.index.status, "present");
  assert.equal(failure.cleanupState.database.index.owner, "ambiguous");
  assert.equal(h.counters.authDelete, 0);
  assert.equal(h.counters.authSignOut, 1);
  assert.equal(h.storage.get("catchGalleryNickname"), "기존닉");

  delete h.failures[`transactionAfterCommit:nicknameIndex/${key}`];
  delete h.failures[`remove:nicknameIndex/${key}`];
  h.auth.currentUser = h.auth.nextUser;
  const recovered = await h.api.handleAuthState(h.auth.currentUser);
  assert.equal(recovered.id, "ambiguous", "the preserved account remains usable on the next login");
}

// If rechecks and both removals succeed after an ambiguous commit, Auth deletion is allowed.
{
  const h = harness();
  h.auth.nextUser = h.makeUser("confirmed-empty", email);
  h.failures[`transactionAfterCommit:nicknameIndex/${key}`] = new Error("network lost after commit");
  let failure;
  try { await h.api.signUp(nickname, "123456"); } catch (error) { failure = error; }
  assert.ok(failure?.cleanupState);
  assert.equal(h.values.users["confirmed-empty"], undefined);
  assert.equal(h.values.indexes[key], undefined);
  assert.equal(failure.cleanupState.database.profile, "absent");
  assert.equal(failure.cleanupState.database.index.status, "absent");
  assert.equal(h.counters.authDelete, 1, "Auth deletion requires both Database paths to be confirmed absent");
}

// A clear transaction failure plus failed users removal never claims that the profile is absent or deletes Auth.
{
  const h = harness({ stored: { catchGalleryNickname: "기존닉" } });
  h.auth.nextUser = h.makeUser("remove-fail", email);
  h.failures[`transaction:nicknameIndex/${key}`] = { once: true, error: new Error("transaction rejected before commit") };
  h.failures[`remove:users/remove-fail`] = new Error("users remove failed");
  let failure;
  try { await h.api.signUp(nickname, "123456"); } catch (error) { failure = error; }
  assert.ok(failure?.cleanupState);
  assert.equal(h.values.users["remove-fail"].nickname, nickname);
  assert.equal(h.values.indexes[key], "remove-fail", "failed profile removal restores the user's index for recovery");
  assert.equal(failure.cleanupState.database.profile, "present");
  assert.equal(failure.cleanupState.database.index.status, "present");
  assert.equal(h.counters.authDelete, 0);
  assert.equal(h.counters.authSignOut, 1);
}

// Cleanup for stale signup A cannot sign out or mutate fully prepared user B.
{
  const bNickname = "나";
  const bKey = "u_eb8298";
  const bProfile = { nickname: bNickname, nicknameKey: bKey, score: 0, createdAt: 1, lastSeenAt: 1, rankingDeleted: false };
  const h = harness({ users: { b: bProfile }, admins: { b: true }, claims: { b: { score: { score: 4 } } } });
  const adminGate = deferred(); h.gates.set("admins/a", adminGate);
  const userA = h.makeUser("a", email); h.auth.nextUser = userA;
  const signupA = h.api.signUp(nickname, "123456");
  await settle();
  assert.equal(h.values.users.a.nickname, nickname);
  assert.equal(h.values.indexes[key], "a");

  const userB = h.makeUser("b", `${bKey}@catchgallery.app`);
  h.auth.currentUser = userB;
  await h.api.handleAuthState(userB);
  const bSnapshot = {
    currentUid: h.auth.currentUser.uid,
    user: structuredClone(h.state.user), isAdmin: h.state.isAdmin,
    score: h.scoreEl.textContent, cache: h.state.cacheOwnerUid,
    nickname: h.storage.get("catchGalleryNickname"), routes: h.counters.routes, toasts: h.counters.toasts
  };
  adminGate.reject(new Error("late A admin failure"));
  assert.equal(await signupA, null);
  assert.equal(h.counters.authSignOut, 0);
  assert.equal(h.counters.authDelete, 0);
  assert.deepEqual({
    currentUid: h.auth.currentUser.uid,
    user: h.state.user, isAdmin: h.state.isAdmin,
    score: h.scoreEl.textContent, cache: h.state.cacheOwnerUid,
    nickname: h.storage.get("catchGalleryNickname"), routes: h.counters.routes, toasts: h.counters.toasts
  }, bSnapshot);
  assert.equal(h.values.users.a.nickname, nickname);
  assert.equal(h.values.indexes[key], "a");
}

// The real login submit handler keeps DOM input and restores both buttons after post-Auth failure.
{
  const elements = {};
  const form = { submit: null, addEventListener(type, handler) { if (type === "submit") this.submit = handler; } };
  const nameInput = { value: "" };
  const passwordInput = { value: "" };
  const loginButton = { disabled: false, textContent: "로그인" };
  const signupButton = { disabled: false, onclick: null };
  Object.assign(elements, { "#loginForm": form, "#nickname": nameInput, "#password": passwordInput, "#loginButton": loginButton, "#signupButton": signupButton });
  const dom = { querySelector: selector => elements[selector] || null };
  const h = harness({ users: { u1: existingProfile }, stored: { catchGalleryNickname: "기존성공" }, dom });
  h.auth.nextUser = h.makeUser("u1", email);
  h.failures["once:admins/u1"] = new Error("admin lookup failed");
  const appEl = { renders: 0, set innerHTML(value) { this.renders++; this.value = value; }, get innerHTML() { return this.value; } };
  let uiToasts = 0;
  const renderLogin = Function("appEl", "document", "localStorage", "signIn", "showToast", "userErrorMessage", "openSignupModal", `"use strict"; ${pick("renderLogin")}; return renderLogin;`)(
    appEl, dom, { getItem: key => h.storage.get(key) || null }, h.api.signIn, () => { uiToasts++; }, error => error.message, () => {}
  );
  renderLogin();
  nameInput.value = nickname;
  passwordInput.value = "123456";
  await form.submit({ preventDefault() {} });
  assert.equal(appEl.renders, 1, "failed post-Auth work must not recreate the login screen");
  assert.equal(nameInput.value, nickname);
  assert.equal(passwordInput.value, "123456");
  assert.equal(loginButton.disabled, false);
  assert.equal(signupButton.disabled, false);
  assert.equal(loginButton.textContent, "로그인");
  assert.equal(uiToasts, 1);
  assert.equal(h.counters.routes, 0);
  assert.equal(h.storage.get("catchGalleryNickname"), "기존성공");
}
{
  const h = harness({ stored: { catchGalleryNickname: "기존닉" } });
  h.auth.nextUser = h.makeUser("admin-fail", email);
  h.failures[`once:admins/admin-fail`] = new Error("admin read failed");
  await assert.rejects(h.api.signUp(nickname, "123456"));
  assert.equal(h.values.users["admin-fail"], undefined);
  assert.equal(h.values.indexes[key], undefined);
  assert.equal(h.counters.authDelete, 1);
}
{
  const h = harness();
  h.auth.nextUser = h.makeUser("delete-fail", email);
  h.failures[`set:users/delete-fail`] = new Error("profile set failed");
  h.auth.deleteError = new Error("auth delete failed");
  await assert.rejects(h.api.signUp(nickname, "123456"));
  assert.equal(h.counters.authDelete, 1);
  assert.equal(h.counters.authSignOut, 1, "failed Auth deletion falls back to signOut");
}
{
  const h = harness();
  h.auth.nextUser = h.makeUser("cleanup-fail", email);
  h.failures[`once:admins/cleanup-fail`] = new Error("admin read failed");
  h.failures[`remove:nicknameIndex/${key}`] = new Error("index cleanup failed");
  await assert.rejects(h.api.signUp(nickname, "123456"));
  assert.equal(h.counters.authDelete, 0, "Database cleanup failure keeps the Auth account recoverable");
  assert.equal(h.counters.authSignOut, 1);
  assert.equal(h.values.indexes[key], "cleanup-fail");
}

// Explicit logout is idempotent, clears session data, and blocks late work.
{
  const h = harness({ users: { u1: existingProfile }, stored: { catchGalleryNickname: nickname, catchGalleryUid: "u1" } });
  const gate = deferred(); h.gates.set("users/u1", gate);
  const user = h.makeUser("u1", email); h.auth.currentUser = user;
  const late = h.api.handleAuthState(user);
  await settle();
  await h.api.signOut();
  gate.resolve(); await late;
  assert.equal(h.counters.authSignOut, 1);
  assert.equal(h.state.user, null);
  assert.equal(h.storage.has("catchGalleryUid"), false);
  assert.equal(h.storage.has("catchGalleryNickname"), false);
  assert.equal(h.counters.routes, 1);
}

assert.doesNotMatch(source, /async function loadCurrentUser\([^)]*shouldApply = \(\) => true/);
assert.doesNotMatch(source, /ensureUserProfile[\s\S]{0,900}ref\.set\(profile\)[\s\S]{0,300}return loadCurrentUser/);
assert.doesNotMatch(source, /await signIn\([^;]+;\s*route\("home"\)/);
assert.doesNotMatch(source, /await signUp\([^;]+;[\s\S]{0,80}route\("home"\)/);
console.log("Auth profile lifecycle checks passed.");
