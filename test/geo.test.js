import { test } from "node:test";
import assert from "node:assert/strict";
import { haversineKm, nearestSites } from "../js/geo.js";

test("haversine: distance to self is zero", () => {
  assert.equal(haversineKm(40, -100, 40, -100), 0);
});

test("haversine: one degree of latitude is about 111 km", () => {
  const d = haversineKm(0, 0, 1, 0);
  assert.ok(Math.abs(d - 111) < 1, `expected ~111 km, got ${d}`);
});

test("haversine: London to Paris is about 340 km", () => {
  const d = haversineKm(51.5, -0.13, 48.85, 2.35);
  assert.ok(Math.abs(d - 344) < 15, `expected ~344 km, got ${d}`);
});

test("nearestSites: sorts by distance and annotates distanceKm", () => {
  const sites = [
    { name: "far", lat: 0, lng: 90 },
    { name: "near", lat: 1, lng: 0 },
    { name: "mid", lat: 10, lng: 0 }
  ];
  const out = nearestSites(sites, 0, 0, 2);
  assert.equal(out.length, 2);
  assert.equal(out[0].name, "near");
  assert.equal(out[1].name, "mid");
  assert.ok(out[0].distanceKm < out[1].distanceKm);
});

test("nearestSites: skips sites with invalid coordinates", () => {
  const sites = [
    { name: "bad", lat: NaN, lng: 0 },
    { name: "good", lat: 2, lng: 2 }
  ];
  const out = nearestSites(sites, 0, 0, 5);
  assert.equal(out.length, 1);
  assert.equal(out[0].name, "good");
});
