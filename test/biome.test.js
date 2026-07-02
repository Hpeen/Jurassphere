import { test } from "node:test";
import assert from "node:assert/strict";
import { classifyBiome } from "../js/biome.js";

test("high latitudes are polar", () => {
  assert.equal(classifyBiome(80, 0), "polar");
  assert.equal(classifyBiome(-70, 12), "polar");
});

test("known arid badlands classify as desert", () => {
  assert.equal(classifyBiome(47.6, -106.6), "desert"); // Montana
  assert.equal(classifyBiome(43.5, 103.7), "desert"); // Gobi
  assert.equal(classifyBiome(30.0, -6.0), "desert"); // Kem Kem, Morocco
});

test("humid tropics away from deserts are jungle", () => {
  assert.equal(classifyBiome(0, -60), "jungle"); // Amazon
});

test("temperate sites default to plains", () => {
  assert.equal(classifyBiome(50.5, 3.6), "plains"); // Belgium
});

test("bad coordinates fall back to jungle", () => {
  assert.equal(classifyBiome(NaN, 5), "jungle");
});
