import { test } from "node:test";
import assert from "node:assert/strict";
import { classifyEra, normalizeOccurrence, normalizeAll } from "../js/data.js";

test("classifyEra maps midpoint age to the correct period", () => {
  assert.equal(classifyEra(72, 66), "Cretaceous");   // mid 69
  assert.equal(classifyEra(160, 150), "Jurassic");   // mid 155
  assert.equal(classifyEra(230, 210), "Triassic");   // mid 220
  assert.equal(classifyEra(40, 30), "Other");        // too young
});

test("normalizeOccurrence builds a site object", () => {
  const rec = {
    occurrence_no: 123,
    accepted_name: "Tyrannosaurus rex",
    lat: "47.6", lng: "-106.6",
    max_ma: 68, min_ma: 66,
    state: "Montana", cc: "US"
  };
  const site = normalizeOccurrence(rec);
  assert.equal(site.id, "123");
  assert.equal(site.name, "Tyrannosaurus rex");
  assert.equal(site.title, "Tyrannosaurus rex");
  assert.equal(site.lat, 47.6);
  assert.equal(site.lng, -106.6);
  assert.equal(site.era, "Cretaceous");
  assert.equal(site.maxMa, 68);
  assert.equal(site.minMa, 66);
  assert.equal(site.location, "Montana, US");
});

test("normalizeOccurrence returns null when coordinates are missing", () => {
  assert.equal(normalizeOccurrence({ occurrence_no: 1, accepted_name: "X" }), null);
});

test("normalizeAll drops nulls and non-target eras", () => {
  const recs = [
    { occurrence_no: 1, accepted_name: "A", lat: "1", lng: "1", max_ma: 70, min_ma: 66 },
    { occurrence_no: 2, accepted_name: "B" },                                   // no coords -> null
    { occurrence_no: 3, accepted_name: "C", lat: "2", lng: "2", max_ma: 40, min_ma: 30 } // Other -> dropped
  ];
  const sites = normalizeAll(recs);
  assert.equal(sites.length, 1);
  assert.equal(sites[0].name, "A");
});
