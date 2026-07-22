import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const app = readFileSync(new URL("../app.js", import.meta.url), "utf8");
const styles = readFileSync(new URL("../styles.css", import.meta.url), "utf8");
const html = app.match(/appEl\.innerHTML = `<section class="screen draw-screen"[\s\S]*?`;\s*setupCanvas/)?.[0] || "";
const slider = html.match(/<div class="brush-size-control">[\s\S]*?<\/div>/)?.[0] || "";
const setup = app.match(/function setupBrushSizeControl[\s\S]*?(?=function setupCanvas)/)?.[0] || "";
const canvasSetup = app.match(/function setupCanvas[\s\S]*?(?=function undoCanvas)/)?.[0] || "";

assert.match(slider, /<output id="brushSizeValue"[^>]*aria-hidden="true">9\(기본\)<\/output>/);
assert.match(slider, /id="brushSize" type="range" min="3" max="34" value="9"/);
assert.match(slider, /aria-label="붓 굵기"/);
assert.match(slider, /aria-valuetext="9, 기본 굵기"/);
assert.match(styles, /appearance:\s*none/);
assert.match(styles, /-webkit-appearance:\s*none/);
assert.match(styles, /::-webkit-slider-runnable-track/);
assert.match(styles, /::-webkit-slider-thumb/);
assert.match(styles, /::-moz-range-track/);
assert.match(styles, /::-moz-range-progress/);
assert.match(styles, /::-moz-range-thumb/);
assert.match(styles, /linear-gradient\(to right, var\(--pink\)[^}]*#fff/);
const sliderStyles = styles.match(/\.brush-size-control \{[\s\S]*?(?=\.notice \{)/)?.[0] || "";
assert.doesNotMatch(sliderStyles, /accent-color/);
assert.match(setup, /\(\(value - min\) \/ \(max - min\)\) \* 100/);
assert.match(setup, /input\.value = String\(defaultValue\)/);
assert.match(setup, /window\.addEventListener\("pointerup"/);
assert.match(setup, /window\.removeEventListener\("pointerup"/);
assert.match(setup, /visibilitychange/);
assert.match(setup, /aria-valuetext/);
assert.match(canvasSetup, /width:\s*Number\(state\.brushInput\?\.value \|\| 9\)/);
assert.match(canvasSetup, /releaseBrushSizeControl\(\)/);

console.log("Brush size slider static checks passed.");
