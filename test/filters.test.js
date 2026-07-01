import { test } from "node:test";
import assert from "node:assert/strict";
import { filterByEra, searchSites } from "../js/filters.js";

const sites = [
  { name: "Tyrannosaurus rex", era: "Cretaceous", lat: 1, lng: 1 },
  { name: "Stegosaurus stenops", era: "Jurassic", lat: 2, lng: 2 },
  { name: "Coelophysis bauri", era: "Triassic", lat: 3, lng: 3 }
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
