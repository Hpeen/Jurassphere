import { loadSites } from "./data.js";
import { createGlobe, setPoints, flyTo } from "./globe.js";

const el = document.getElementById("globe");
const globe = createGlobe(el, (site) => console.log("clicked", site.title));

loadSites().then(({ sites, source }) => {
  console.log(`Loaded ${sites.length} sites from ${source}`);
  setPoints(globe, sites);
});

window._flyTo = (lat, lng) => flyTo(globe, lat, lng);
