import { test } from "node:test";
import assert from "node:assert/strict";
import { filterByEra, searchSites, filterByTime } from "../js/filters.js";

const sites = [
  { name: "Tyrannosaurus rex", era: "Cretaceous", lat: 1, lng: 1, maxMa: 68, minMa: 66 },
  { name: "Stegosaurus stenops", era: "Jurassic", lat: 2, lng: 2, maxMa: 155, minMa: 150 },
  { name: "Coelophysis bauri", era: "Triassic", lat: 3, lng: 3, maxMa: 216, minMa: 203 }
];

test("filterByEra returns all sites for 'All'", () => {
  assert.equal(filterByEra(sites, "All").length, 3);
});

test("filterByEra filters by a single era", () => {
  const jur = filterByEra(sites, "Jurassic");
  assert.equal(jur.length, 1);
  assert.equal(jur[0].name, "Stegosaurus stenops");
});

test("searchSites matches case-insensitive substrings of the name", () => {
  const hits = searchSites(sites, "rex");
  assert.equal(hits.length, 1);
  assert.equal(hits[0].name, "Tyrannosaurus rex");
});

test("searchSites returns [] for empty query", () => {
  assert.equal(searchSites(sites, "   ").length, 0);
});

test("filterByTime keeps only sites alive at the given age", () => {
  const jur = filterByTime(sites, 152);
  assert.equal(jur.length, 1);
  assert.equal(jur[0].name, "Stegosaurus stenops");
});

test("filterByTime at a boundary age is inclusive", () => {
  assert.equal(filterByTime(sites, 66).length, 1); // T. rex lower bound
  assert.equal(filterByTime(sites, 216).length, 1); // Coelophysis upper bound
});

test("filterByTime with null age returns every site", () => {
  assert.equal(filterByTime(sites, null).length, 3);
});

test("filterByTime never hides sites lacking numeric ages", () => {
  const withUnknown = [...sites, { name: "Mystery", era: "Jurassic" }];
  const out = filterByTime(withUnknown, 100); // no site alive at 100 Ma here
  assert.equal(out.length, 1);
  assert.equal(out[0].name, "Mystery");
});
