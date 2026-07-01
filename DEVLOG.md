# Jurassphere Devlog

## 2026-07-01 — Project kickoff
- Designed the concept: spinnable 3D globe plotting real fossil sites.
- Chose globe.gl for the globe, PBDB API for live data, GitHub Pages for hosting.
- Scaffolded static shell (index.html, css, js), curated fallback dataset.

## 2026-07-02 — Shipped v1
- Built the full app: 3D globe plotting live Paleobiology Database occurrences
  (402 real sites across Triassic/Jurassic/Cretaceous) with a curated fallback.
- Features: slide-in field record, era filter, search-and-fly-to, intro + ambient audio.
- Pure-logic modules (data normalization, era classification, filter, search)
  covered by `node --test` (8/8 passing).
- Redesigned away from the initial neon look to a paleontology field-guide
  aesthetic: Fraunces + IBM Plex type, footprint trackway motifs, rock-strata
  textures, specimen-label era tags, earthy ochre/moss/rust palette.
- Deployed live to GitHub Pages: https://hpeen.github.io/Jurassphere/
