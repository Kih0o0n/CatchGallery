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
  "ensureUserProfile", "loadCurrentUser", "prepareAuthSession", "cleanupSignup", "signUp", "signIn",
  "applyLoggedOut", "signOut", "handleAuthState"
];

function deferred() {
  let resolve, reject;
  const promise = new Promise((done, fail) => { resolve = done; reject = fail; });
  return { promise, resolve, reject };
}
async function settle() { for (let index = 0; index < 12; index++) await Promise.resolve(); }
function snapshot(value) { return { val: () => value, exists: () => value !== null && value !== undefined }; }

function harness({ users = {}, indexes = {}, admins = {}, claims = {}, stored = {} } = {}) {
  const counters = { authSignIn: 0, authSignUp: 0, authSignOut: 0, authDelete: 0, usersRead: 0, usersSet: 0, usersUpdate: 0, usersRemove: 0, indexRead: 0, indexWrite: 0, indexRemove: 0, adminRead: 0, claimsRead: 0, routes: 0, cacheChanges: 0, expiry: 0, toasts: 0 };
  const values = { users: structuredClone(users), indexes: structuredClone(indexes), admins: structuredClone(admins), claims: structuredClone(claims) };
  const failures = {};
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
        if (failures[`once:${path}`]) throw failures[`once:${path}`];
        if (gates.has(path)) await gates.get(path).promise;
        if (root === "users") counters.usersRead++;
        if (root === "admins") counters.adminRead++;
        if (root === "scoreClaims") counters.claimsRead++;
        return snapshot(values[root]?.[key] ?? null);
      },
      async set(value) { if (failures[`set:${path}`]) throw failures[`set:${path}`]; if (root === "users") counters.usersSet++; values[root][key] = structuredClone(value); },
      async update(changes) {
        if (root === "users") counters.usersUpdate++;
        const next = { ...values[root][key] };
        for (const [field, value] of Object.entries(changes)) { if (value === null) delete next[field]; else next[field] = value; }
        values[root][key] = next;
      },
      async remove() {
        if (failures[`remove:${path}`]) throw failures[`remove:${path}`];
        if (root === "users") counters.usersRemove++;
        if (root === "nicknameIndex") counters.indexRemove++;
        delete values[root === "nicknameIndex" ? "indexes" : root][key];
      },
      async transaction(updater) {
        if (failures[`transaction:${path}`]) throw failures[`transaction:${path}`];
        counters.indexRead++;
        const next = updater(values.indexes[key] ?? null);
        if (next === undefined) return { committed: false, snapshot: snapshot(values.indexes[key] ?? null) };
        counters.indexWrite++;
        values.indexes[key] = next;
        return { committed: true, snapshot: snapshot(next) };
      }
    };
  } };
  const state = { user: null, isAdmin: false, authReady: false, cacheOwnerUid: null };
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
    "state", "auth", "db", "localStorage", "serverNow", "setCacheSession", "scoreEl", "location", "transitionRoute", "expireOldDrawings", "console", "showToast", "userErrorMessage", "loadUserScore",
    `"use strict"; ${functionNames.map(pick).join("\n")}\nreturn { ${functionNames.join(", ")} };`
  )(
    state, auth, db, localStorage, () => 1000,
    uid => { const next = uid || null; if (state.cacheOwnerUid === next) return false; state.cacheOwnerUid = next; counters.cacheChanges++; return true; },
    scoreEl, { hash: "" }, () => { counters.routes++; }, async () => { counters.expiry++; }, { error() {} }, () => { counters.toasts++; }, error => error.message,
    async uid => { counters.claimsRead++; return Object.values(values.claims[uid] || {}).reduce((sum, claim) => sum + (Number(claim?.score) || 0), 0); }
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
  await assert.rejects(h.api.signUp(nickname, "123456"));
  assert.equal(h.values.indexes[key], "other");
  assert.equal(h.values.users.new, undefined);
  assert.equal(h.counters.authDelete, 1);
  assert.equal(h.storage.get("catchGalleryNickname"), "기존닉");
  assert.equal(h.counters.routes, 1, "Auth deletion produces one logged-out route");
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
