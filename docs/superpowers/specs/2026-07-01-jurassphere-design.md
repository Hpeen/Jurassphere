# Jurassphere — Design Spec

**Date:** 2026-07-01
**Status:** Approved for planning

## Overview

Jurassphere is a single-page website featuring a full-screen, spinnable 3D
globe (Google Earth style). Real fossil-excavation sites appear as glowing
markers on the globe; clicking a marker slides in a panel from the right with
information about the dinosaur found there. The project is built for the
StarDance project and must satisfy its rules (see Compliance section).

## Goals

- Deliver a "wow" spinnable 3D globe as the centerpiece.
- Let users explore real fossil sites and learn about dinosaurs interactively.
- Use a live public API as the headline "real feature."
- Ship a fully deployed, custom-styled, framework-free site.

## Non-Goals (YAGNI)

- No user accounts / auth.
- No backend server or database of our own (all client-side).
- No favourites/collection feature (explicitly dropped during design).
- No build tooling required (plain static files).

## Stack

- **HTML + CSS + JS**, framework-free (StarDance rule 1).
- **globe.gl** (three.js-based) loaded via CDN — 3D globe, markers, camera moves.
- **Paleobiology Database (PBDB) API** — `https://paleobiodb.org/data1.2/` —
  live fossil occurrence data (supports CORS, usable client-side).
- **GitHub Pages** for deployment from the existing public repo.

## Aesthetic — "Neon Jurassic"

- Dark jungle green-black background (`#04100a` → `#0a1f16` radial).
- Vivid amber-orange accents (`#f0a437`) and neon green highlights (`#37e08b`).
- Glowing markers, subtle HUD-style panel, custom typography.
- Bold, playful, leans into the dinosaur theme. All custom CSS (rule 6).

## Architecture

Small, single-purpose files:

```
index.html          - markup shell: globe canvas, side panel, controls, search
css/styles.css      - Neon Jurassic theme, layout, panel/marker animations
js/globe.js         - builds globe, markers, auto-spin, fly-to camera moves
js/data.js          - PBDB API fetch + normalize + curated fallback loading
js/panel.js         - renders the slide-in dino info panel (layout A)
js/filters.js       - geologic-era filter + search-by-name
js/audio.js         - intro animation + optional ambient sound toggle
js/main.js          - wires modules together, app bootstrap
data/fallback.json  - ~15 famous curated sites (used if the API fails)
README.md           - project overview, features, run/deploy instructions
DEVLOG.md           - dated devlog entries (StarDance rule 3)
```

### Module responsibilities

- **data.js** — Fetches occurrences from PBDB, normalizes each into a common
  shape, and exposes a single `loadSites()` that returns the array. On network
  error or empty result, loads `data/fallback.json` instead. This is the only
  module that knows about the API.
- **globe.js** — Owns the globe.gl instance. Renders a points layer from the
  normalized site array, handles auto-spin (stops on user interaction), exposes
  `flyTo(lat, lng)` and `setPoints(sites)`. Knows nothing about the API.
- **panel.js** — Given one normalized site object, renders/updates the slide-in
  panel DOM. Pure view; no data fetching.
- **filters.js** — Era filter buttons and search box. Filters the site array and
  calls `globe.setPoints()` / `globe.flyTo()`. Depends on globe + current data.
- **audio.js** — Intro animation trigger and a muteable ambient sound toggle.
  Isolated so it can be disabled without touching other modules.
- **main.js** — Bootstraps: load data → build globe → wire filters/search/panel/
  audio.

### Normalized site shape

```json
{
  "id": "string",
  "name": "Tyrannosaurus rex",
  "lat": 45.1,
  "lng": -108.3,
  "era": "Cretaceous",
  "title": "Tyrannosaurus rex",
  "location": "Montana, USA",
  "description": "Short factual blurb...",
  "image": "url-or-null"
}
```

## Data Flow

1. On load, `main.js` calls `data.loadSites()`.
2. `data.js` requests PBDB occurrences (with coordinates and interval/era
   fields), filtered toward well-known genera, and normalizes them.
3. If the request fails, times out, or returns nothing, `data.js` loads
   `data/fallback.json` so the globe is never empty.
4. `globe.js` renders the sites as glowing amber markers.
5. User interactions:
   - Click marker → `panel.js` renders that site's info; panel slides in.
   - Era button → `filters.js` filters sites by era → `globe.setPoints()`.
   - Search name → `filters.js` finds matching sites → `globe.flyTo()`.

## Features

- **Spinnable 3D globe** with auto-spin until interaction (animation feature).
- **Slide-in side panel** (design A) — globe stays visible on the left.
- **Geologic-era filter** — Triassic / Jurassic / Cretaceous toggle markers.
- **Search & fly-to** — type a dinosaur name; camera animates to its sites.
- **Intro + ambient audio** — short intro animation and muteable ambient sound.

## Error Handling & Reliability

- API failures degrade gracefully to the curated fallback dataset.
- Missing coordinates → occurrence skipped (never plotted at 0,0).
- Missing image → panel shows a styled placeholder, not a broken image.
- Search with no matches → non-blocking "no results" hint in the UI.

## Deployment

- Static files served via **GitHub Pages** from the public repo.
- No build step; pushing to the configured branch publishes the site.
- Result is a real public URL (StarDance rule 5).

## StarDance Compliance

1. HTML + CSS + JS, framework-free — yes.
2. Public repo, frequent commits, strong README — yes (README.md + commit
   discipline).
3. Devlogs — `DEVLOG.md` with dated entries.
4. No AI one-click website builder — hand-built static site.
5. Fully deployed (not localhost) — GitHub Pages.
6. Custom UI/CSS instead of templates — Neon Jurassic custom theme.
7. At least one real feature — live PBDB API + animations + interactivity.

## Testing / Verification

- Manual verification in-browser: globe renders and spins, markers appear,
  clicking opens the correct panel, era filter changes visible markers, search
  flies to the right location, fallback loads when API is blocked.
- Verify deployed GitHub Pages URL behaves the same as local.
```
