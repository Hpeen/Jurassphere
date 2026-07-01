# Jurassphere

**Live site:** https://hpeen.github.io/Jurassphere/

An interactive 3D globe for exploring real dinosaur fossil-excavation sites.
Spin the Earth, click the markers, and read about the dinosaurs found there —
styled as a paleontology field catalogue.

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
npx serve .          # Node (no install needed)
# or, if you have Python:
python -m http.server 8000
# then open the printed localhost URL
```

## Tests (pure-logic modules)
```bash
node --test
```

## Deploy
Hosted on GitHub Pages from this repo. See DEVLOG.md for build notes.
