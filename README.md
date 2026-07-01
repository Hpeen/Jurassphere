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
