import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const app = readFileSync(new URL("../app.js", import.meta.url), "utf8");

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

const productionSource = [
  "fullGalleryHistoryState", "validGalleryReturnState", "galleryHistoryState",
  "openGalleryArtist", "showFullGallery", "returnFromArtistGallery",
  "returnFromArtistDetail", "galleryListKey", "transitionRoute"
].map(pick).join("\n");

function createHistory() {
  return {
    entries: [], index: -1, backCalls: 0,
    get state() { return this.entries[this.index]?.state || null; },
    pushState(state, _title, url) {
      this.entries.splice(this.index + 1);
      this.entries.push({ state: structuredClone(state), url });
      this.index = this.entries.length - 1;
    },
    replaceState(state, _title, url) {
      const entry = { state: structuredClone(state), url };
      if (this.index < 0) { this.entries.push(entry); this.index = 0; }
      else this.entries[this.index] = entry;
    },
    back() { this.backCalls++; if (this.index > 0) this.index--; }
  };
}

function createHarness() {
  const state = {
    route: "home", user: { id: "user" }, galleryTab: "solved", gallerySort: "new",
    galleryView: "thumb", galleryIndex: 0, galleryArtistDrawingId: null,
    galleryArtist: null, galleryHasGalleryBack: false, galleryScroll: {},
    seenWordKeys: new Set(), editDrawing: null, rankingSnapshot: null,
    rankingSnapshotPromise: null
  };
  const history = createHistory();
  let renders = 0;
  const api = Function(
    "state", "history", "scrollY", "galleryArtistIdentity", "renderGallery",
    "setDrawViewportMode", "cleanupScreenResources", "renderRoute", "isSafeRecordId",
    `let routeTransitionId = 0; ${productionSource}; return { fullGalleryHistoryState, validGalleryReturnState, galleryHistoryState, openGalleryArtist, showFullGallery, returnFromArtistGallery, returnFromArtistDetail, galleryListKey, transitionRoute };`
  )(
    state, history, 73,
    drawing => drawing?.id ? { drawingId: drawing.id, ownerId: drawing.ownerId || null, name: drawing.name || "artist" } : null,
    () => { renders++; }, () => {}, () => {}, () => {},
    value => typeof value === "string" && /^[A-Za-z0-9_-]{1,80}$/.test(value)
  );
  const pop = () => api.transitionRoute("gallery", { historyMode: "pop", historyState: history.state });
  return { state, history, api, pop, renders: () => renders };
}

{
  const harness = createHarness();
  harness.api.transitionRoute("gallery");
  assert.deepEqual(harness.history.state, {
    route: "gallery", galleryTab: "solved", gallerySort: "new", galleryDetail: false,
    galleryIndex: 0, galleryArtist: false, galleryArtistDrawingId: null,
    galleryHasGalleryBack: false, galleryHasArtistListBack: false, galleryReturnState: null
  }, "initial gallery entry must record the full scope and sort");

  harness.state.galleryScroll["solved:new"] = 73;
  assert.equal(harness.api.openGalleryArtist({ id: "artist-anchor", name: "artist" }), true);
  assert.equal(harness.history.entries.length, 2, "artist entry must be pushed after replacing the full entry");
  assert.equal(harness.history.entries[0].state.gallerySort, "new");
  assert.equal(harness.history.state.galleryHasGalleryBack, true);
  assert.equal(harness.history.state.galleryReturnState.gallerySort, "new");

  harness.state.gallerySort = "popular";
  harness.history.replaceState(harness.api.galleryHistoryState(false), "", "#gallery");
  harness.api.returnFromArtistGallery();
  assert.equal(harness.history.backCalls, 1);
  harness.pop();
  assert.equal(harness.state.gallerySort, "new", "artist sorting must not leak into the full gallery");
  assert.equal(harness.api.galleryListKey(), "solved:new");
  assert.equal(harness.state.galleryScroll[harness.api.galleryListKey()], 73);

  harness.history.index = 1;
  harness.pop();
  assert.equal(harness.state.gallerySort, "popular");
  assert.equal(harness.api.galleryListKey(), "artist:artist-anchor:popular");
  harness.state.galleryScroll[harness.api.galleryListKey()] = 29;
  harness.history.replaceState(harness.api.galleryHistoryState(false), "", "#gallery");
  harness.api.returnFromArtistGallery();
  assert.equal(harness.history.backCalls, 1, "forward restoration must use the safe return state instead of leaving the app");
  assert.equal(harness.state.gallerySort, "new");
  assert.equal(harness.api.galleryListKey(), "solved:new");
  assert.equal(harness.state.galleryScroll["artist:artist-anchor:popular"], 29);
}

{
  const harness = createHarness();
  harness.api.transitionRoute("gallery");
  harness.state.gallerySort = "old";
  harness.state.galleryView = "frame";
  harness.state.galleryIndex = 2;
  harness.history.replaceState(harness.api.fullGalleryHistoryState(true), "", "#gallery");
  harness.api.openGalleryArtist({ id: "detail-artist", name: "artist" });
  harness.api.returnFromArtistGallery();
  harness.pop();
  assert.equal(harness.state.galleryView, "frame");
  assert.equal(harness.state.galleryIndex, 2);
  assert.equal(harness.state.gallerySort, "old");
}

{
  const harness = createHarness();
  harness.api.transitionRoute("gallery");
  harness.api.openGalleryArtist({ id: "artist-detail", name: "artist" });
  harness.state.galleryScroll["artist:artist-detail:new"] = 41;
  harness.state.galleryView = "frame";
  harness.state.galleryIndex = 1;
  harness.history.pushState(harness.api.galleryHistoryState(true, { galleryHasArtistListBack: true }), "", "#gallery");
  harness.api.returnFromArtistDetail();
  assert.equal(harness.history.backCalls, 1);
  harness.pop();
  assert.equal(harness.state.galleryView, "thumb");
  assert.equal(harness.api.galleryListKey(), "artist:artist-detail:new");
  assert.equal(harness.state.galleryScroll[harness.api.galleryListKey()], 41);
  harness.api.returnFromArtistGallery();
  harness.pop();
  assert.equal(harness.state.galleryArtistDrawingId, null);
  assert.equal(harness.state.galleryView, "thumb");
}

{
  const harness = createHarness();
  harness.state.route = "gallery";
  harness.state.galleryArtistDrawingId = "orphan";
  harness.state.galleryArtist = { drawingId: "orphan", name: "artist" };
  harness.state.galleryHasGalleryBack = false;
  harness.state.galleryView = "thumb";
  harness.history.pushState({
    route: "gallery", galleryTab: "solved", gallerySort: "popular", galleryDetail: false,
    galleryIndex: 0, galleryArtist: true, galleryArtistDrawingId: "orphan",
    galleryHasGalleryBack: true, galleryHasArtistListBack: false,
    galleryReturnState: { route: "gallery", galleryTab: "solved", gallerySort: "new", galleryDetail: false, galleryIndex: 0, galleryArtist: false }
  }, "", "#gallery");
  harness.api.returnFromArtistGallery();
  assert.equal(harness.history.backCalls, 0, "an unproven parent must never navigate outside the app");
  assert.equal(harness.history.entries.length, 1);
  assert.equal(harness.state.galleryArtistDrawingId, null);
  assert.equal(harness.state.galleryArtist, null);
  assert.equal(harness.state.galleryView, "thumb");
  assert.equal(harness.history.state.galleryArtist, false);
  assert.equal(harness.history.state.galleryArtistDrawingId, null);
}

assert.match(app, /artistMode && state\.galleryView === "thumb" \? '<button class="gallery-return-button"/, "full-gallery return button must be hidden in artist detail");
assert.match(pick("bindGalleryContent"), /galleryHasArtistListBack: !!state\.galleryArtistDrawingId/);

console.log("Gallery production history state checks passed.");
