import { classifyBiome } from "./biome.js";
import { getTraits } from "./traits.js";
import { fetchWikiSummary } from "./enrich.js";

const els = {};
let openToken = 0; // guards against a slow fetch overwriting a newer panel

export function initPanel() {
  els.panel = document.getElementById("panel");
  els.scroll = document.querySelector(".panel-scroll");
  els.image = document.getElementById("panel-image");
  els.title = document.getElementById("panel-title");
  els.say = document.getElementById("panel-say");
  els.phonetic = document.getElementById("panel-phonetic");
  els.era = document.getElementById("panel-era");
  els.badges = document.getElementById("panel-badges");
  els.size = document.getElementById("panel-size");
  els.coords = document.getElementById("panel-coords");
  els.age = document.getElementById("panel-age");
  els.location = document.getElementById("panel-location");
  els.desc = document.getElementById("panel-desc");
  els.source = document.getElementById("panel-source");
  document.getElementById("panel-close").addEventListener("click", closePanel);

  if (!("speechSynthesis" in window)) els.say.style.display = "none";
}

// Format a coordinate pair as e.g. "47.60°N, 106.60°W" (field-record style).
function formatCoords(lat, lng) {
  const ns = lat >= 0 ? "N" : "S";
  const ew = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(2)}°${ns}, ${Math.abs(lng).toFixed(2)}°${ew}`;
}

const ERA_RANGE = { Cretaceous: "66–145", Jurassic: "145–201", Triassic: "201–252" };
function ageLine(era) {
  const r = ERA_RANGE[era];
  return r ? `Lived ${r} million years ago` : "";
}

function formatWeight(kg) {
  if (kg >= 1000) {
    const t = kg / 1000;
    return `${t >= 10 ? Math.round(t) : t.toFixed(1)} t`;
  }
  return `${kg} kg`;
}

function setupPronounce(site, t) {
  const phon = t && t.phonetic ? t.phonetic : "";
  els.phonetic.textContent = phon;
  els.phonetic.style.display = phon ? "" : "none";
  els.say.onclick = () => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(site.name);
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  };
}

// Trait chips — built only from our own curated numeric/enum data.
function renderBadges(t) {
  const chips = [];
  if (t && t.diet) chips.push(`<span class="badge diet-${t.diet.toLowerCase()}">${t.diet}</span>`);
  if (t && t.lengthM) chips.push(`<span class="badge">${t.lengthM} m</span>`);
  if (t && t.weightKg) chips.push(`<span class="badge">${formatWeight(t.weightKg)}</span>`);
  els.badges.innerHTML = chips.join("");
  els.badges.style.display = chips.length ? "" : "none";
}

// A proportional length bar with a human reference, so scale is obvious to anyone.
function renderSize(t) {
  if (!t || !t.lengthM) {
    els.size.innerHTML = "";
    els.size.style.display = "none";
    return;
  }
  els.size.style.display = "";
  const len = t.lengthM;
  const maxLen = Math.max(len, 6);
  const dinoPct = Math.max(4, (len / maxLen) * 100);
  const humanPct = Math.min(100, (1.8 / maxLen) * 100);
  const people = Math.max(1, Math.round(len / 1.8));
  const note =
    len < 1.8
      ? "Shorter than an adult person."
      : `As long as about ${people} ${people === 1 ? "person" : "people"} lying head to toe.`;
  els.size.innerHTML =
    `<div class="size-label">Size · ${len} m long</div>` +
    `<div class="size-track">` +
    `<div class="size-dino" style="width:${dinoPct}%"></div>` +
    `<div class="size-human" style="left:${humanPct}%" title="An adult human, 1.8 m"></div>` +
    `</div>` +
    `<div class="size-note">${note}</div>`;
}

function setImage(src) {
  if (src) {
    els.image.style.backgroundImage = `url("${src}")`;
    els.image.classList.remove("placeholder");
  } else {
    els.image.style.backgroundImage = "";
    els.image.classList.add("placeholder");
  }
}

export function openPanel(site) {
  const token = ++openToken;

  // Reskin the scene to the site's biome (desert, jungle, polar, plains).
  document.body.dataset.biome = classifyBiome(site.lat, site.lng);

  const t = getTraits(site.name);

  els.title.textContent = site.title;
  setupPronounce(site, t);
  els.era.textContent = site.era;
  els.era.dataset.era = site.era;
  renderBadges(t);
  renderSize(t);
  els.coords.textContent = formatCoords(site.lat, site.lng);
  els.age.textContent = ageLine(site.era);
  els.location.textContent = site.location;
  els.desc.textContent = site.description;
  setImage(site.image);

  els.source.style.display = "none";
  els.source.textContent = "";
  els.source.removeAttribute("href");

  if (els.scroll) els.scroll.scrollTop = 0;
  els.panel.classList.add("open");
  els.panel.setAttribute("aria-hidden", "false");

  // Enrich from Wikipedia; ignore if a newer panel opened meanwhile.
  fetchWikiSummary(site.name).then((info) => {
    if (token !== openToken || !info) return;
    if (info.extract) els.desc.textContent = info.extract;
    if (info.image) setImage(info.image);
    if (info.url) {
      els.source.href = info.url;
      els.source.textContent = "Read more on Wikipedia";
      els.source.style.display = "";
    }
  });
}

export function closePanel() {
  els.panel.classList.remove("open");
  els.panel.setAttribute("aria-hidden", "true");
  delete document.body.dataset.biome; // back to the default jungle scene
}
