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
