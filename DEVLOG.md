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

## 2026-07-02 — Jungle redesign (v1.1)
- Renamed the project to Jurasasphere.
- Fixed the "black globe on a blank background" problem: swapped the near-black
  night texture for NASA Blue Marble with topographic relief, added a starfield
  backdrop and a thin atmosphere so the globe reads as a living planet.
- Replaced the synthesized drone with real audio: a looping rainforest bed plus
  a distant roar that fires at random 20–55s intervals. Both fade in and are
  credited in the README.
- Pushed the visual theme toward a prehistoric-jungle field expedition:
  deeper canopy greens, amber/resin accents, ferns and fossil motifs.
