# Jurasasphere

Live site: https://hpeen.github.io/Jurassphere/

An interactive 3D globe for exploring real dinosaur fossil sites. Spin the Earth, click a marker, and a panel opens with details about the dinosaur found there. You can filter by geologic period, or search a dinosaur by name and let the globe fly you straight to its dig sites. Think Google Earth, if the only thing it cared about was dinosaurs.

The fossil data comes live from the Paleobiology Database, a public science API, with a curated backup list so the map is never empty. It's plain HTML, CSS, and JavaScript with no framework, styled like an old paleontology field guide.

## Features
- A 3D globe you can spin and zoom, built with globe.gl
- Live fossil data from the Paleobiology Database, with a curated fallback for when the API is down
- Click a marker to open a field record that fills itself in from Wikipedia (plain-language description + a real photo), so it reads for anyone, not just specialists
- A size-vs-human chart, a click-to-hear pronunciation, and diet/length/weight badges on each record
- The whole scene reskins to the dig's region: jungle, desert, polar, or plains
- Filter by period: Triassic, Jurassic, or Cretaceous
- Search a dinosaur by name and fly the camera to its sites
- Intro animation and optional ambient sound (rainforest bed with an occasional distant roar)

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

## Credits
- Globe textures: [three-globe](https://github.com/vasturiano/three-globe) example imagery (NASA Blue Marble and topography).
- Rainforest ambience by Alexander, [Orange Free Sounds](https://orangefreesounds.com/rainforest-sounds/) — CC BY 4.0.
- Distant roar by Alexander, [Orange Free Sounds](https://orangefreesounds.com/dinosaur-roar-sound-effect/) — CC BY-NC 4.0 (non-commercial).
