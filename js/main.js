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
