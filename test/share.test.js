import { test } from "node:test";
import assert from "node:assert/strict";
import { deepLinkFor, parseDeepLink } from "../js/share.js";

test("deepLinkFor encodes the name into a hash", () => {
  assert.equal(deepLinkFor("Tyrannosaurus rex"), "#dino=Tyrannosaurus%20rex");
});

test("deepLinkFor returns empty for blank names", () => {
  assert.equal(deepLinkFor(""), "");
  assert.equal(deepLinkFor("   "), "");
});

test("parseDeepLink round-trips a name", () => {
  assert.equal(parseDeepLink(deepLinkFor("Velociraptor mongoliensis")), "Velociraptor mongoliensis");
});

test("parseDeepLink reads a dino among other params", () => {
  assert.equal(parseDeepLink("#foo=1&dino=Stegosaurus&bar=2"), "Stegosaurus");
});

test("parseDeepLink returns null when there is no dino reference", () => {
  assert.equal(parseDeepLink(""), null);
  assert.equal(parseDeepLink("#era=Jurassic"), null);
});
