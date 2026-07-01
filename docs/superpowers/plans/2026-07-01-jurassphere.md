# Jurassphere Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page website with a spinnable 3D globe that plots real fossil-excavation sites from a live API and shows dinosaur info in a slide-in panel.

**Architecture:** Framework-free static site. `globe.gl` (loaded via CDN) renders the 3D Earth. Pure-logic ES modules (data normalization, era classification, filtering, search) are unit-tested with Node's built-in test runner; DOM/globe modules are verified in the browser. Live data comes from the Paleobiology Database (PBDB) API with a curated JSON fallback. Deployed on GitHub Pages.

**Tech Stack:** HTML, CSS, vanilla JS (ES modules), globe.gl (CDN), PBDB REST API, Node `node --test` (dev only), GitHub Pages.

---

## File Structure

```
index.html            - markup shell: globe container, side panel, controls, search
css/styles.css        - Neon Jurassic theme + layout + animations
js/data.js            - PBDB fetch + normalization/era-classification (pure fns exported)
js/filters.js         - era filter + search matching (pure fns exported)
js/globe.js           - globe.gl instance, markers, auto-spin, fly-to
js/panel.js           - slide-in dino info panel (DOM view)
js/audio.js           - intro animation + ambient sound toggle
js/main.js            - bootstrap: load data -> build globe -> wire UI
data/fallback.json    - ~15 curated famous sites (used if API fails)
test/data.test.js     - node --test for js/data.js pure fns
test/filters.test.js  - node --test for js/filters.js pure fns
README.md             - overview, features, run + deploy instructions
DEVLOG.md             - dated devlog entries (StarDance rule 3)
```

**Key conventions:**
- All `js/*.js` files are ES modules (`export`/`import`). `index.html` loads globe.gl as a global script, then `js/main.js` as `type="module"`.
- Pure-logic modules never touch `window`, `document`, or `Globe`, so Node can import them for tests.
- Normalized site object shape (used everywhere):
  ```js
  { id, name, title, lat, lng, era, location, description, image }
  ```
  where `era` is one of `"Triassic" | "Jurassic" | "Cretaceous"`.

**Local dev note:** ES modules + `fetch` need an HTTP server (not `file://`). Run `python -m http.server 8000` (or `npx serve`) from the repo root and open `http://localhost:8000`.

---

## Task 1: Project scaffolding + static shell

**Files:**
- Create: `index.html`
- Create: `css/styles.css` (empty placeholder for now)
- Create: `js/main.js` (temporary console log)
- Create: `data/fallback.json`
- Create: `README.md`
- Create: `DEVLOG.md`

- [ ] **Step 1: Create `data/fallback.json`** with curated sites

```json
[
  { "id": "f1", "name": "Tyrannosaurus rex", "title": "Tyrannosaurus rex", "lat": 47.6, "lng": -106.6, "era": "Cretaceous", "location": "Montana, USA", "description": "One of the largest land predators ever; up to 12 m long with bone-crushing bite force.", "image": null },
  { "id": "f2", "name": "Velociraptor mongoliensis", "title": "Velociraptor mongoliensis", "lat": 43.5, "lng": 103.7, "era": "Cretaceous", "location": "Omnogovi, Mongolia", "description": "Turkey-sized feathered predator with a large sickle claw on each foot.", "image": null },
  { "id": "f3", "name": "Triceratops horridus", "title": "Triceratops horridus", "lat": 45.9, "lng": -103.5, "era": "Cretaceous", "location": "South Dakota, USA", "description": "Three-horned herbivore with a massive bony frill.", "image": null },
  { "id": "f4", "name": "Stegosaurus stenops", "title": "Stegosaurus stenops", "lat": 40.4, "lng": -108.8, "era": "Jurassic", "location": "Colorado, USA", "description": "Plated herbivore with a spiked tail (thagomizer).", "image": null },
  { "id": "f5", "name": "Allosaurus fragilis", "title": "Allosaurus fragilis", "lat": 39.3, "lng": -110.7, "era": "Jurassic", "location": "Utah, USA", "description": "Apex Jurassic predator of the Morrison Formation.", "image": null },
  { "id": "f6", "name": "Brachiosaurus altithorax", "title": "Brachiosaurus altithorax", "lat": 39.1, "lng": -108.7, "era": "Jurassic", "location": "Colorado, USA", "description": "Long-necked giant that browsed high foliage.", "image": null },
  { "id": "f7", "name": "Diplodocus longus", "title": "Diplodocus longus", "lat": 41.1, "lng": -104.8, "era": "Jurassic", "location": "Wyoming, USA", "description": "Extremely long sauropod with a whip-like tail.", "image": null },
  { "id": "f8", "name": "Spinosaurus aegyptiacus", "title": "Spinosaurus aegyptiacus", "lat": 30.0, "lng": -6.0, "era": "Cretaceous", "location": "Kem Kem, Morocco", "description": "Sail-backed semi-aquatic predator, possibly the longest theropod.", "image": null },
  { "id": "f9", "name": "Coelophysis bauri", "title": "Coelophysis bauri", "lat": 36.2, "lng": -106.3, "era": "Triassic", "location": "New Mexico, USA", "description": "Slender early theropod found in huge bonebeds.", "image": null },
  { "id": "f10", "name": "Plateosaurus trossingensis", "title": "Plateosaurus trossingensis", "lat": 48.3, "lng": 8.6, "era": "Triassic", "location": "Baden-Wurttemberg, Germany", "description": "Early long-necked plant-eater of the Late Triassic.", "image": null },
  { "id": "f11", "name": "Herrerasaurus ischigualastensis", "title": "Herrerasaurus ischigualastensis", "lat": -30.2, "lng": -68.0, "era": "Triassic", "location": "San Juan, Argentina", "description": "One of the earliest known dinosaurs.", "image": null },
  { "id": "f12", "name": "Iguanodon bernissartensis", "title": "Iguanodon bernissartensis", "lat": 50.5, "lng": 3.6, "era": "Cretaceous", "location": "Bernissart, Belgium", "description": "Herbivore with a distinctive thumb spike.", "image": null },
  { "id": "f13", "name": "Ankylosaurus magniventris", "title": "Ankylosaurus magniventris", "lat": 48.8, "lng": -113.6, "era": "Cretaceous", "location": "Montana, USA", "description": "Armoured herbivore with a bony tail club.", "image": null },
  { "id": "f14", "name": "Archaeopteryx lithographica", "title": "Archaeopteryx lithographica", "lat": 48.9, "lng": 11.2, "era": "Jurassic", "location": "Bavaria, Germany", "description": "Feathered transitional form between dinosaurs and birds.", "image": null },
  { "id": "f15", "name": "Carnotaurus sastrei", "title": "Carnotaurus sastrei", "lat": -45.0, "lng": -69.0, "era": "Cretaceous", "location": "Chubut, Argentina", "description": "Horned predator with tiny arms and a lightweight skull.", "image": null }
]
```

- [ ] **Step 2: Create `index.html` shell**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Jurassphere — Explore Fossil Sites on a 3D Globe</title>
  <link rel="stylesheet" href="css/styles.css" />
</head>
<body>
  <div id="intro" class="intro">
    <h1 class="intro-title">JURASSPHERE</h1>
    <p class="intro-tagline">Spin the Earth. Uncover the dinosaurs.</p>
  </div>

  <header class="hud">
    <div class="brand">JURASSPHERE</div>
    <div class="controls">
      <input id="search" class="search" type="text" placeholder="Search a dinosaur…" autocomplete="off" />
      <div class="eras" id="eras">
        <button class="era-btn active" data-era="All">All</button>
        <button class="era-btn" data-era="Triassic">Triassic</button>
        <button class="era-btn" data-era="Jurassic">Jurassic</button>
        <button class="era-btn" data-era="Cretaceous">Cretaceous</button>
      </div>
      <button id="mute" class="mute" title="Toggle ambient sound">🔊</button>
    </div>
  </header>

  <div id="status" class="status" hidden></div>
  <main id="globe" class="globe"></main>

  <aside id="panel" class="panel" aria-hidden="true">
    <button id="panel-close" class="panel-close" aria-label="Close">×</button>
    <div class="panel-image" id="panel-image"></div>
    <h2 id="panel-title" class="panel-title"></h2>
    <div id="panel-era" class="panel-era"></div>
    <div id="panel-location" class="panel-location"></div>
    <p id="panel-desc" class="panel-desc"></p>
  </aside>

  <script src="https://unpkg.com/globe.gl"></script>
  <script type="module" src="js/main.js"></script>
</body>
</html>
```

- [ ] **Step 3: Create placeholder `css/styles.css`**

```css
/* Neon Jurassic theme — filled in Task 8 */
body { margin: 0; background: #04100a; color: #e8ffe8; font-family: system-ui, sans-serif; }
```

- [ ] **Step 4: Create temporary `js/main.js`**

```js
console.log("Jurassphere booting…");
```

- [ ] **Step 5: Create `README.md`**

```markdown
# Jurassphere

An interactive 3D globe for exploring real dinosaur fossil-excavation sites.
Spin the Earth, click glowing markers, and read about the dinosaurs found there.

## Features
- Spinnable 3D globe (globe.gl / three.js)
- Live fossil data from the Paleobiology Database (PBDB) API, with curated fallback
- Slide-in info panel per site
- Geologic-era filter (Triassic / Jurassic / Cretaceous)
- Search a dinosaur and fly the camera to its sites
- Intro animation + optional ambient sound

## Run locally
ES modules need an HTTP server (not file://):

```bash
python -m http.server 8000
# then open http://localhost:8000
```

## Tests (pure-logic modules)
```bash
node --test
```

## Deploy
Hosted on GitHub Pages from this repo. See DEVLOG.md for build notes.
```

- [ ] **Step 6: Create `DEVLOG.md`**

```markdown
# Jurassphere Devlog

## 2026-07-01 — Project kickoff
- Designed the concept: spinnable 3D globe plotting real fossil sites.
- Chose globe.gl for the globe, PBDB API for live data, GitHub Pages for hosting.
- Scaffolded static shell (index.html, css, js), curated fallback dataset.
```

- [ ] **Step 7: Verify the shell loads**

Run: `python -m http.server 8000` then open `http://localhost:8000` in a browser.
Expected: Dark page, "JURASSPHERE" intro/header visible, console logs "Jurassphere booting…", no JS errors.

- [ ] **Step 8: Commit**

```bash
git add index.html css/styles.css js/main.js data/fallback.json README.md DEVLOG.md
git commit -m "feat: scaffold Jurassphere static shell and curated fallback data"
```

---

## Task 2: Data module — era classification + normalization (TDD)

**Files:**
- Create: `js/data.js`
- Test: `test/data.test.js`

- [ ] **Step 1: Write the failing test**

Create `test/data.test.js`:

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/data.test.js`
Expected: FAIL — cannot import `classifyEra` (module/exports don't exist yet).

- [ ] **Step 3: Write minimal implementation**

Create `js/data.js`:

```js
// Geologic period boundaries (millions of years ago)
export function classifyEra(maxMa, minMa) {
  const mid = (Number(maxMa) + Number(minMa)) / 2;
  if (mid >= 66 && mid <= 145) return "Cretaceous";
  if (mid > 145 && mid <= 201.4) return "Jurassic";
  if (mid > 201.4 && mid <= 251.9) return "Triassic";
  return "Other";
}

export function normalizeOccurrence(record) {
  const lat = parseFloat(record.lat);
  const lng = parseFloat(record.lng);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;

  const name = record.accepted_name || record.identified_name || "Unknown taxon";
  const location =
    [record.state, record.cc].filter(Boolean).join(", ") || "Unknown location";

  return {
    id: String(record.occurrence_no),
    name,
    title: name,
    lat,
    lng,
    era: classifyEra(record.max_ma, record.min_ma),
    location,
    description: `${name} — found in rocks dated about ${record.max_ma}–${record.min_ma} million years ago.`,
    image: null
  };
}

const TARGET_ERAS = new Set(["Triassic", "Jurassic", "Cretaceous"]);

export function normalizeAll(records) {
  const out = [];
  for (const rec of records) {
    const site = normalizeOccurrence(rec);
    if (site && TARGET_ERAS.has(site.era)) out.push(site);
  }
  return out;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/data.test.js`
Expected: PASS — 4 tests passing.

- [ ] **Step 5: Commit**

```bash
git add js/data.js test/data.test.js
git commit -m "feat: add PBDB data normalization and era classification with tests"
```

---

## Task 3: Data module — live fetch with fallback

**Files:**
- Modify: `js/data.js` (append `loadSites`)

- [ ] **Step 1: Append `loadSites` to `js/data.js`**

Add at the bottom of `js/data.js`:

```js
const PBDB_URL =
  "https://paleobiodb.org/data1.2/occs/list.json" +
  "?base_name=Dinosauria&show=coords,loc&vocab=pbdb&idreso=genus&limit=800";

// Fetch live occurrences; fall back to the curated dataset on any failure.
export async function loadSites() {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(PBDB_URL, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`PBDB HTTP ${res.status}`);
    const json = await res.json();
    const sites = normalizeAll(json.records || []);
    if (sites.length === 0) throw new Error("PBDB returned no usable records");
    return { sites, source: "PBDB live API" };
  } catch (err) {
    console.warn("PBDB fetch failed, using fallback:", err.message);
    const res = await fetch("data/fallback.json");
    const sites = await res.json();
    return { sites, source: "curated fallback" };
  }
}
```

- [ ] **Step 2: Verify existing tests still pass**

Run: `node --test test/data.test.js`
Expected: PASS — the 4 tests from Task 2 still pass (loadSites is not unit-tested; it needs a browser/network).

- [ ] **Step 3: Manual smoke check in browser console**

Temporarily set `js/main.js` to:

```js
import { loadSites } from "./data.js";
loadSites().then(({ sites, source }) =>
  console.log(`Loaded ${sites.length} sites from ${source}`, sites[0])
);
```

Run: `python -m http.server 8000`, open `http://localhost:8000`, check console.
Expected: A log like "Loaded N sites from PBDB live API" with N > 0 and a sample site object. (If offline, expect "curated fallback" with 15 sites.)

- [ ] **Step 4: Commit**

```bash
git add js/data.js js/main.js
git commit -m "feat: load live PBDB data with curated fallback"
```

---

## Task 4: Filters module — era filter + search (TDD)

**Files:**
- Create: `js/filters.js`
- Test: `test/filters.test.js`

- [ ] **Step 1: Write the failing test**

Create `test/filters.test.js`:

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/filters.test.js`
Expected: FAIL — cannot import from `js/filters.js`.

- [ ] **Step 3: Write minimal implementation**

Create `js/filters.js`:

```js
export function filterByEra(sites, era) {
  if (era === "All") return sites.slice();
  return sites.filter((s) => s.era === era);
}

export function searchSites(sites, query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return sites.filter((s) => s.name.toLowerCase().includes(q));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/filters.test.js`
Expected: PASS — 4 tests passing.

- [ ] **Step 5: Run the whole suite**

Run: `node --test`
Expected: PASS — all data + filters tests pass.

- [ ] **Step 6: Commit**

```bash
git add js/filters.js test/filters.test.js
git commit -m "feat: add era filter and dinosaur search with tests"
```

---

## Task 5: Globe module — render markers + auto-spin + fly-to

**Files:**
- Create: `js/globe.js`

- [ ] **Step 1: Create `js/globe.js`**

```js
// Wraps the global `Globe` from the globe.gl CDN script.
const ERA_COLORS = {
  Triassic: "#37e08b",
  Jurassic: "#f0a437",
  Cretaceous: "#ff6b3d"
};

export function createGlobe(el, onPointClick) {
  const globe = Globe()(el)
    .globeImageUrl("//unpkg.com/three-globe/example/img/earth-dark.jpg")
    .backgroundColor("rgba(0,0,0,0)")
    .pointAltitude(0.01)
    .pointRadius(0.35)
    .pointColor((d) => ERA_COLORS[d.era] || "#f0a437")
    .pointLabel((d) => `${d.title} — ${d.era}`)
    .onPointClick((d) => onPointClick(d));

  // Auto-spin until the user interacts.
  const controls = globe.controls();
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.6;
  el.addEventListener("pointerdown", () => (controls.autoRotate = false), { once: true });

  window.addEventListener("resize", () => {
    globe.width(el.clientWidth).height(el.clientHeight);
  });
  globe.width(el.clientWidth).height(el.clientHeight);

  return globe;
}

export function setPoints(globe, sites) {
  globe.pointsData(sites);
}

export function flyTo(globe, lat, lng) {
  globe.pointOfView({ lat, lng, altitude: 1.6 }, 1200);
}
```

- [ ] **Step 2: Wire a temporary bootstrap in `js/main.js`**

Replace `js/main.js` with:

```js
import { loadSites } from "./data.js";
import { createGlobe, setPoints, flyTo } from "./globe.js";

const el = document.getElementById("globe");
const globe = createGlobe(el, (site) => console.log("clicked", site.title));

loadSites().then(({ sites, source }) => {
  console.log(`Loaded ${sites.length} sites from ${source}`);
  setPoints(globe, sites);
});

window._flyTo = (lat, lng) => flyTo(globe, lat, lng);
```

- [ ] **Step 3: Verify the globe renders in the browser**

Run: `python -m http.server 8000`, open `http://localhost:8000`.
Expected: A dark 3D globe appears and slowly auto-rotates. Coloured markers appear on continents. Dragging stops the rotation and spins the globe. Clicking a marker logs `clicked <title>`. In console, `_flyTo(47.6, -106.6)` animates the camera to Montana.

- [ ] **Step 4: Commit**

```bash
git add js/globe.js js/main.js
git commit -m "feat: render fossil sites on an auto-spinning 3D globe with fly-to"
```

---

## Task 6: Panel module — slide-in dino info

**Files:**
- Create: `js/panel.js`

- [ ] **Step 1: Create `js/panel.js`**

```js
const els = {};

export function initPanel() {
  els.panel = document.getElementById("panel");
  els.image = document.getElementById("panel-image");
  els.title = document.getElementById("panel-title");
  els.era = document.getElementById("panel-era");
  els.location = document.getElementById("panel-location");
  els.desc = document.getElementById("panel-desc");
  document.getElementById("panel-close").addEventListener("click", closePanel);
}

export function openPanel(site) {
  els.title.textContent = site.title;
  els.era.textContent = site.era;
  els.era.dataset.era = site.era;
  els.location.textContent = site.location;
  els.desc.textContent = site.description;
  if (site.image) {
    els.image.style.backgroundImage = `url("${site.image}")`;
    els.image.classList.remove("placeholder");
  } else {
    els.image.style.backgroundImage = "";
    els.image.classList.add("placeholder");
    els.image.textContent = "🦕";
  }
  els.panel.classList.add("open");
  els.panel.setAttribute("aria-hidden", "false");
}

export function closePanel() {
  els.panel.classList.remove("open");
  els.panel.setAttribute("aria-hidden", "true");
}
```

- [ ] **Step 2: Wire panel into `js/main.js`**

Update `js/main.js`:

```js
import { loadSites } from "./data.js";
import { createGlobe, setPoints, flyTo } from "./globe.js";
import { initPanel, openPanel } from "./panel.js";

const el = document.getElementById("globe");
initPanel();
const globe = createGlobe(el, (site) => openPanel(site));

loadSites().then(({ sites, source }) => {
  console.log(`Loaded ${sites.length} sites from ${source}`);
  setPoints(globe, sites);
});
```

- [ ] **Step 3: Verify the panel in the browser**

Run: `python -m http.server 8000`, open `http://localhost:8000`.
Expected: Clicking a marker slides the panel in from the right with the correct title, era, location, and description. The close (×) button hides it. Sites without an image show a 🦕 placeholder.

- [ ] **Step 4: Commit**

```bash
git add js/panel.js js/main.js
git commit -m "feat: add slide-in dinosaur info panel"
```

---

## Task 7: Wire era filter + search into the UI

**Files:**
- Modify: `js/main.js`

- [ ] **Step 1: Update `js/main.js` to wire controls**

```js
import { loadSites } from "./data.js";
import { createGlobe, setPoints, flyTo } from "./globe.js";
import { initPanel, openPanel } from "./panel.js";
import { filterByEra, searchSites } from "./filters.js";

const el = document.getElementById("globe");
const statusEl = document.getElementById("status");
initPanel();
const globe = createGlobe(el, (site) => openPanel(site));

let allSites = [];
let activeEra = "All";

function render() {
  setPoints(globe, filterByEra(allSites, activeEra));
}

function showStatus(msg) {
  statusEl.textContent = msg;
  statusEl.hidden = !msg;
}

// Era buttons
document.getElementById("eras").addEventListener("click", (e) => {
  const btn = e.target.closest(".era-btn");
  if (!btn) return;
  activeEra = btn.dataset.era;
  document.querySelectorAll(".era-btn").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  render();
});

// Search + fly-to
const searchInput = document.getElementById("search");
searchInput.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  const hits = searchSites(allSites, searchInput.value);
  if (hits.length === 0) {
    showStatus(`No sites found for "${searchInput.value.trim()}".`);
    return;
  }
  showStatus(`Found ${hits.length} site(s) for "${hits[0].name}".`);
  activeEra = "All";
  document.querySelectorAll(".era-btn").forEach((b) => b.classList.remove("active"));
  document.querySelector('.era-btn[data-era="All"]').classList.add("active");
  render();
  flyTo(globe, hits[0].lat, hits[0].lng);
  openPanel(hits[0]);
});

loadSites().then(({ sites, source }) => {
  allSites = sites;
  showStatus(`Loaded ${sites.length} sites from ${source}.`);
  setTimeout(() => showStatus(""), 3000);
  render();
});
```

- [ ] **Step 2: Verify filters + search in the browser**

Run: `python -m http.server 8000`, open `http://localhost:8000`.
Expected:
- Clicking "Jurassic" shows only Jurassic markers; "All" restores everything; the active button is highlighted.
- Typing "Tyrannosaurus" + Enter flies the camera to Montana, opens its panel, and shows a status message.
- Searching gibberish shows a "No sites found" status and does not move the camera.

- [ ] **Step 3: Commit**

```bash
git add js/main.js
git commit -m "feat: wire era filter and search-and-fly-to into the UI"
```

---

## Task 8: Audio module — intro animation + ambient toggle

**Files:**
- Create: `js/audio.js`
- Modify: `js/main.js`

- [ ] **Step 1: Create `js/audio.js`**

```js
// Ambient sound uses a short looping WebAudio drone (no asset files needed).
let audioCtx = null;
let ambientNode = null;
let muted = true;

export function playIntro() {
  const intro = document.getElementById("intro");
  if (!intro) return;
  // Fade the intro overlay out after a beat.
  setTimeout(() => intro.classList.add("hidden"), 1800);
}

function buildAmbient() {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const gain = audioCtx.createGain();
  gain.gain.value = 0.04;
  const osc = audioCtx.createOscillator();
  osc.type = "sine";
  osc.frequency.value = 72; // low drone
  const lfo = audioCtx.createOscillator();
  lfo.frequency.value = 0.08;
  const lfoGain = audioCtx.createGain();
  lfoGain.gain.value = 6;
  lfo.connect(lfoGain).connect(osc.frequency);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start();
  lfo.start();
  ambientNode = gain;
}

export function initAudioToggle() {
  const btn = document.getElementById("mute");
  btn.addEventListener("click", () => {
    if (!audioCtx) buildAmbient();
    if (audioCtx.state === "suspended") audioCtx.resume();
    muted = !muted;
    ambientNode.gain.value = muted ? 0 : 0.04;
    btn.textContent = muted ? "🔊" : "🔇";
  });
}
```

- [ ] **Step 2: Call intro + audio from `js/main.js`**

Add these imports at the top of `js/main.js`:

```js
import { playIntro, initAudioToggle } from "./audio.js";
```

And add after `initPanel();`:

```js
playIntro();
initAudioToggle();
```

- [ ] **Step 3: Verify in the browser**

Run: `python -m http.server 8000`, open `http://localhost:8000`.
Expected: The "JURASSPHERE" intro overlay fades out after ~1.8s revealing the globe. Clicking the speaker button starts a subtle low ambient drone and toggles the icon; clicking again silences it. (Browsers require the click before audio starts — expected.)

- [ ] **Step 4: Commit**

```bash
git add js/audio.js js/main.js
git commit -m "feat: add intro animation and toggleable ambient audio"
```

---

## Task 9: Neon Jurassic theme (full CSS)

**Files:**
- Modify: `css/styles.css`

- [ ] **Step 1: Replace `css/styles.css` with the full theme**

```css
:root {
  --bg-0: #04100a;
  --bg-1: #0a1f16;
  --panel: #0c1a12;
  --line: #1c3326;
  --text: #e8ffe8;
  --muted: #8fb79c;
  --accent: #f0a437;
  --neon: #37e08b;
}

* { box-sizing: border-box; }
html, body { height: 100%; }
body {
  margin: 0;
  color: var(--text);
  font-family: "Segoe UI", system-ui, sans-serif;
  background: radial-gradient(circle at 50% 40%, var(--bg-1), var(--bg-0));
  overflow: hidden;
}

/* Intro overlay */
.intro {
  position: fixed; inset: 0; z-index: 30;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  background: radial-gradient(circle at 50% 45%, #0a1f16, #04100a);
  transition: opacity 0.9s ease, visibility 0.9s ease;
}
.intro.hidden { opacity: 0; visibility: hidden; }
.intro-title {
  font-size: clamp(2.5rem, 9vw, 6rem); letter-spacing: 0.35em; margin: 0;
  color: var(--neon); text-shadow: 0 0 24px #37e08b88; animation: pulse 2.4s infinite;
}
.intro-tagline { color: var(--accent); letter-spacing: 0.2em; margin-top: 1rem; }
@keyframes pulse { 50% { text-shadow: 0 0 40px #37e08bcc; } }

/* HUD header */
.hud {
  position: fixed; top: 0; left: 0; right: 0; z-index: 20;
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 20px; gap: 16px;
  background: linear-gradient(180deg, #04100acc, transparent);
}
.brand { font-weight: 800; letter-spacing: 0.3em; color: var(--neon); text-shadow: 0 0 12px #37e08b66; }
.controls { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }

.search {
  background: #0c1a12; border: 1px solid var(--line); color: var(--text);
  padding: 8px 14px; border-radius: 999px; outline: none; min-width: 200px;
}
.search:focus { border-color: var(--neon); box-shadow: 0 0 0 2px #37e08b33; }

.eras { display: flex; gap: 6px; }
.era-btn {
  background: transparent; border: 1px solid var(--line); color: var(--muted);
  padding: 7px 14px; border-radius: 999px; cursor: pointer; transition: all 0.2s;
}
.era-btn:hover { color: var(--text); border-color: var(--accent); }
.era-btn.active { color: #04100a; background: var(--accent); border-color: var(--accent); font-weight: 700; }

.mute { background: transparent; border: none; font-size: 1.3rem; cursor: pointer; }

/* Status toast */
.status {
  position: fixed; top: 72px; left: 50%; transform: translateX(-50%); z-index: 20;
  background: #0c1a12ee; border: 1px solid var(--line); color: var(--text);
  padding: 8px 16px; border-radius: 999px; font-size: 0.9rem;
}

/* Globe */
.globe { position: fixed; inset: 0; z-index: 1; }

/* Slide-in panel */
.panel {
  position: fixed; top: 0; right: 0; z-index: 25; height: 100%;
  width: min(380px, 88vw); padding: 64px 26px 26px;
  background: linear-gradient(180deg, var(--panel), #04100a);
  border-left: 2px solid var(--neon);
  box-shadow: -12px 0 40px #000a; transform: translateX(105%);
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1); overflow-y: auto;
}
.panel.open { transform: translateX(0); }
.panel-close {
  position: absolute; top: 16px; right: 18px; background: transparent; border: none;
  color: var(--muted); font-size: 1.8rem; line-height: 1; cursor: pointer;
}
.panel-close:hover { color: var(--neon); }
.panel-image {
  height: 160px; border-radius: 12px; margin-bottom: 18px;
  background-size: cover; background-position: center;
  border: 1px solid var(--line);
}
.panel-image.placeholder {
  display: flex; align-items: center; justify-content: center; font-size: 3rem;
  background: radial-gradient(circle at 50% 40%, #12281c, #0a1f16);
}
.panel-title { margin: 0 0 10px; color: var(--neon); font-size: 1.5rem; }
.panel-era {
  display: inline-block; padding: 3px 12px; border-radius: 999px;
  background: var(--accent); color: #04100a; font-weight: 700; font-size: 0.8rem;
}
.panel-location { color: var(--muted); margin: 12px 0 16px; }
.panel-desc { line-height: 1.6; }

@media (max-width: 600px) {
  .brand { display: none; }
  .search { min-width: 140px; }
}
```

- [ ] **Step 2: Verify the full look in the browser**

Run: `python -m http.server 8000`, open `http://localhost:8000`.
Expected: Neon Jurassic look — dark green-black background, glowing green title, amber era buttons, styled search, and a polished slide-in panel with a neon left border. Layout holds together on a narrow (mobile) window.

- [ ] **Step 3: Commit**

```bash
git add css/styles.css
git commit -m "feat: apply Neon Jurassic theme and polish UI"
```

---

## Task 10: Deploy to GitHub Pages + finalize docs

**Files:**
- Modify: `DEVLOG.md`
- Modify: `README.md`

- [ ] **Step 1: Run the full test suite one last time**

Run: `node --test`
Expected: PASS — all data + filters tests pass.

- [ ] **Step 2: Push all commits to the public repo**

```bash
git push origin main
```

- [ ] **Step 3: Enable GitHub Pages**

In the GitHub repo: Settings → Pages → Source: "Deploy from a branch" → Branch: `main`, folder `/ (root)` → Save.
(Alternatively run this if `gh` is authenticated, then still confirm in Settings → Pages:)

```bash
gh browse --settings
```

Expected: After ~1 minute, the site is live at `https://<username>.github.io/<repo>/`.

- [ ] **Step 4: Verify the deployed site**

Open the GitHub Pages URL in a browser.
Expected: Same behaviour as local — globe spins, markers load (PBDB live or fallback), panel opens, filters + search work. Confirm there are no mixed-content or CORS errors in the console (PBDB and unpkg both serve over HTTPS).

- [ ] **Step 5: Update `README.md` with the live URL**

Add near the top of `README.md`:

```markdown
**Live site:** https://<username>.github.io/<repo>/
```

- [ ] **Step 6: Add a devlog entry**

Append to `DEVLOG.md`:

```markdown
## 2026-07-01 — Shipped v1
- Live 3D globe plotting PBDB fossil occurrences with curated fallback.
- Era filter, search-and-fly-to, slide-in info panel, intro + ambient audio.
- Deployed to GitHub Pages. Pure-logic modules covered by node --test.
```

- [ ] **Step 7: Commit and push**

```bash
git add README.md DEVLOG.md
git commit -m "docs: add live URL and shipping devlog entry"
git push origin main
```

---

## Self-Review Notes

- **Spec coverage:** globe (T5), live PBDB API + fallback (T2/T3), slide-in panel A (T6), era filter (T4/T7), search-and-fly-to (T4/T7), intro + ambient audio (T8), Neon Jurassic CSS (T9), GitHub Pages deploy (T10), README + DEVLOG (T1/T10). All spec sections mapped.
- **Type consistency:** normalized site shape `{id,name,title,lat,lng,era,location,description,image}` is produced in `data.js` and consumed identically by `globe.js`, `panel.js`, and `filters.js`. Function names (`loadSites`, `createGlobe`, `setPoints`, `flyTo`, `initPanel`, `openPanel`, `closePanel`, `filterByEra`, `searchSites`, `playIntro`, `initAudioToggle`) are used consistently across tasks.
- **No placeholders:** every code step contains complete code.
```
