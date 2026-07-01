# Jurassphere

Live site: https://hpeen.github.io/Jurassphere/

An interactive 3D globe for exploring real dinosaur fossil sites. Spin the Earth, click a marker, and a panel opens with details about the dinosaur found there. You can filter by geologic period, or search a dinosaur by name and let the globe fly you straight to its dig sites. Think Google Earth, if the only thing it cared about was dinosaurs.

The fossil data comes live from the Paleobiology Database, a public science API, with a curated backup list so the map is never empty. It's plain HTML, CSS, and JavaScript with no framework, styled like an old paleontology field guide.

## Features
- A 3D globe you can spin and zoom, built with globe.gl
- Live fossil data from the Paleobiology Database, with a curated fallback for when the API is down
- Click a marker to open its field record
- Filter by period: Triassic, Jurassic, or Cretaceous
- Search a dinosaur by name and fly the camera to its sites
- Intro animation and optional ambient sound

## Run locally
The site uses ES modules, so it needs a local server instead of opening the file directly:

```bash
npx serve .
# or, if you have Python installed:
python -m http.server 8000
```

Then open the URL it prints.

## Tests
The data logic (fossil parsing, era classification, filtering, and search) is covered by tests:

```bash
node --test
```

## Deploy
It's hosted on GitHub Pages straight from this repo. Every push to `main` redeploys automatically. Build notes are in DEVLOG.md.
