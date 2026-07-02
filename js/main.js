import { loadSites } from "./data.js";
import { createGlobe, setPoints, flyTo, setGlobeMode } from "./globe.js";
import { initPanel, openPanel } from "./panel.js";
import { filterByEra, searchSites, filterByTime } from "./filters.js";
import { playIntro, initAudioToggle } from "./audio.js";
import { loadTraits } from "./traits.js";
import { nearestSites } from "./geo.js";
import { deepLinkFor, parseDeepLink } from "./share.js";

const el = document.getElementById("globe");
const statusEl = document.getElementById("status");
initPanel();
playIntro();
initAudioToggle();
loadTraits(); // curated size/diet data for the field records
const globe = createGlobe(el, (site) => openSite(site));

let allSites = [];
let activeEra = "All";
let activeMa = null; // set by the timeline scrubber; null = no time filter
let statusTimer = null;

function visibleSites() {
  return filterByTime(filterByEra(allSites, activeEra), activeMa);
}

function render() {
  setPoints(globe, visibleSites());
}

function showStatus(msg, sticky = false) {
  clearTimeout(statusTimer);
  statusEl.textContent = msg;
  statusEl.hidden = !msg;
  if (msg && !sticky) statusTimer = setTimeout(() => showStatus(""), 3200);
}

// ---- Opening a record (with shareable deep link) ---------------------------

function openSite(site) {
  openPanel(site);
  history.replaceState(null, "", deepLinkFor(site.name));
}

function clearHash() {
  history.replaceState(null, "", location.pathname + location.search);
}

document.getElementById("panel-close").addEventListener("click", clearHash);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") clearHash();
});

// Reset era to "All" so a chosen site is never filtered out from the globe.
function resetEraToAll() {
  activeEra = "All";
  document.querySelectorAll(".era-btn").forEach((b) => b.classList.remove("active"));
  document.querySelector('.era-btn[data-era="All"]').classList.add("active");
}

function focusSite(site) {
  resetEraToAll();
  render();
  flyTo(globe, site.lat, site.lng);
  openSite(site);
}

// ---- Era filter ------------------------------------------------------------

document.getElementById("eras").addEventListener("click", (e) => {
  const btn = e.target.closest(".era-btn");
  if (!btn) return;
  activeEra = btn.dataset.era;
  document.querySelectorAll(".era-btn").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  render();
});

// ---- Search + autocomplete -------------------------------------------------

const searchInput = document.getElementById("search");
const suggestEl = document.getElementById("search-suggest");
let suggestions = [];
let suggestIndex = -1;

function closeSuggest() {
  suggestions = [];
  suggestIndex = -1;
  suggestEl.hidden = true;
  suggestEl.innerHTML = "";
  searchInput.setAttribute("aria-expanded", "false");
}

// De-duplicate by genus so the list isn't 40 rows of "Tyrannosaurus rex".
function uniqueByName(sites, limit) {
  const seen = new Set();
  const out = [];
  for (const s of sites) {
    if (seen.has(s.name)) continue;
    seen.add(s.name);
    out.push(s);
    if (out.length >= limit) break;
  }
  return out;
}

function renderSuggest() {
  if (suggestions.length === 0) return closeSuggest();
  suggestEl.innerHTML = suggestions
    .map(
      (s, i) =>
        `<li role="option" id="suggest-${i}" class="suggest-item${i === suggestIndex ? " active" : ""}" data-i="${i}">` +
        `<span class="suggest-name">${s.name}</span><span class="suggest-era" data-era="${s.era}">${s.era}</span></li>`
    )
    .join("");
  suggestEl.hidden = false;
  searchInput.setAttribute("aria-expanded", "true");
}

searchInput.addEventListener("input", () => {
  const q = searchInput.value.trim();
  suggestions = q ? uniqueByName(searchSites(allSites, q), 8) : [];
  suggestIndex = -1;
  renderSuggest();
});

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "ArrowDown" && suggestions.length) {
    e.preventDefault();
    suggestIndex = (suggestIndex + 1) % suggestions.length;
    renderSuggest();
    return;
  }
  if (e.key === "ArrowUp" && suggestions.length) {
    e.preventDefault();
    suggestIndex = (suggestIndex - 1 + suggestions.length) % suggestions.length;
    renderSuggest();
    return;
  }
  if (e.key === "Escape") {
    closeSuggest();
    return;
  }
  if (e.key !== "Enter") return;

  // Enter: take the highlighted suggestion, else the best text match.
  const chosen = suggestIndex >= 0 ? suggestions[suggestIndex] : searchSites(allSites, searchInput.value)[0];
  if (!chosen) {
    showStatus(`No sites found for "${searchInput.value.trim()}".`);
    return;
  }
  searchInput.value = chosen.name;
  closeSuggest();
  showStatus(`Found ${chosen.name}.`);
  focusSite(chosen);
});

suggestEl.addEventListener("click", (e) => {
  const li = e.target.closest(".suggest-item");
  if (!li) return;
  const chosen = suggestions[Number(li.dataset.i)];
  if (!chosen) return;
  searchInput.value = chosen.name;
  closeSuggest();
  focusSite(chosen);
});

document.addEventListener("click", (e) => {
  if (!e.target.closest(".search-wrap")) closeSuggest();
});

// ---- Surprise me -----------------------------------------------------------

document.getElementById("surprise").addEventListener("click", () => {
  const pool = visibleSites();
  const from = pool.length ? pool : allSites;
  if (!from.length) return;
  const pick = from[Math.floor(Math.random() * from.length)];
  showStatus(`A random find: ${pick.name}.`);
  flyTo(globe, pick.lat, pick.lng);
  openSite(pick);
});

// ---- Near me ---------------------------------------------------------------

document.getElementById("nearme").addEventListener("click", () => {
  if (!("geolocation" in navigator)) {
    showStatus("Geolocation isn't available in this browser.");
    return;
  }
  showStatus("Finding the digs nearest you…", true);
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const near = nearestSites(allSites, pos.coords.latitude, pos.coords.longitude, 5);
      if (!near.length) {
        showStatus("No fossil sites to locate.");
        return;
      }
      const top = near[0];
      showStatus(`Nearest dig: ${top.name}, about ${Math.round(top.distanceKm).toLocaleString()} km away.`);
      focusSite(top);
    },
    (err) => showStatus(`Location unavailable — ${err.message}.`)
  );
});

// ---- Day / night globe -----------------------------------------------------

let night = false;
const dayNightBtn = document.getElementById("daynight");
dayNightBtn.addEventListener("click", () => {
  night = !night;
  setGlobeMode(globe, night ? "night" : "day");
  dayNightBtn.textContent = night ? "Night" : "Day";
  dayNightBtn.setAttribute("aria-pressed", String(night));
});

// ---- Timeline scrubber -----------------------------------------------------

function periodOf(ma) {
  if (ma <= 145) return "Cretaceous";
  if (ma <= 201) return "Jurassic";
  return "Triassic";
}

const timelineEl = document.getElementById("timeline");
const timelineToggle = document.getElementById("timeline-toggle");
const timelineRange = document.getElementById("timeline-range");
const timelineReadout = document.getElementById("timeline-readout");

function updateReadout() {
  const ma = Number(timelineRange.value);
  timelineReadout.textContent = `${ma} Ma · ${periodOf(ma)}`;
}

timelineToggle.addEventListener("click", () => {
  const on = timelineEl.hidden; // about to turn on
  timelineEl.hidden = !on;
  timelineEl.setAttribute("aria-hidden", String(!on));
  timelineToggle.setAttribute("aria-pressed", String(on));
  timelineToggle.classList.toggle("active", on);
  activeMa = on ? Number(timelineRange.value) : null;
  updateReadout();
  render();
});

timelineRange.addEventListener("input", () => {
  activeMa = Number(timelineRange.value);
  updateReadout();
  render();
});
updateReadout();

// ---- Boot ------------------------------------------------------------------

loadSites().then(({ sites, source }) => {
  allSites = sites;
  showStatus(`Loaded ${sites.length} sites from ${source}.`);
  render();

  // Open a shared record if the URL carries one.
  const wanted = parseDeepLink(location.hash);
  if (wanted) {
    const hit = searchSites(allSites, wanted)[0];
    if (hit) focusSite(hit);
  }
});
