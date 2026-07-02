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

// --- Size sketch ------------------------------------------------------
// An illustrated field sketch: inked silhouettes of the animal and a
// 1.8 m person on a shared ground line, drawn to a common scale.
// Each silhouette lives in its own design box (`w` × `h`, arbitrary
// units); the scene scales it so its length equals the real lengthM.

const HUMAN_ART =
  "<circle cx='15' cy='13' r='6.8'/>" +
  "<path d='M15 19 C10 19 7.4 22 6.8 26.6 L4.2 48 L7.8 48.8 L10.2 32 L10.2 51 " +
  "L8.6 100 L13.6 100 L15 62 L16.4 100 L21.4 100 L19.8 51 L19.8 32 L22.2 48.8 " +
  "L25.8 48 L23.2 26.6 C22.6 22 20 19 15 19 Z'/>";

const SILHOUETTES = {
  theropod: {
    name: "theropod dinosaur", w: 220, h: 84,
    art:
      "<ellipse cx='112' cy='44' rx='46' ry='20' transform='rotate(-6 112 44)'/>" +
      "<ellipse cx='138' cy='42' rx='24' ry='18'/>" +
      "<path d='M132 30 C166 29 198 38 218 48 C198 52 162 54 130 52 Z'/>" +
      "<ellipse cx='84' cy='50' rx='16' ry='14'/>" +
      "<path d='M40 16 C58 20 72 32 82 48 L62 60 C56 42 48 30 34 26 Z'/>" +
      "<path d='M16 18 C20 10 32 7 43 10 C51 13 55 19 53 26 C49 33 40 35 31 33 L14 29 C12 25 13 21 16 18 Z'/>" +
      "<path d='M15 30 L36 34 C32 39 24 40 18 37 Z'/>" +
      "<path d='M82 50 C82 57 79 62 74 66 L70 62 C74 58 76 53 76 48 Z'/>" +
      "<ellipse cx='124' cy='54' rx='15' ry='17'/>" +
      "<path d='M117 60 C115 70 116 77 114 82 L112 84 L134 84 L131 80 C129 71 130 62 134 57 Z'/>" +
      "<path d='M104 57 C100 66 99 75 96 82 L94 84 L112 84 L110 80 C108 70 109 61 112 55 Z' opacity='.55'/>" +
      "<circle class='sf-eye' cx='37' cy='17' r='2.2'/>",
  },
  sauropod: {
    name: "sauropod dinosaur", w: 300, h: 130,
    art:
      "<ellipse cx='172' cy='86' rx='60' ry='28'/>" +
      "<path d='M148 72 C112 62 76 40 52 12 L64 4 C90 30 124 52 156 62 Z'/>" +
      "<ellipse cx='55' cy='9' rx='13' ry='7'/>" +
      "<path d='M222 74 C252 82 278 96 296 112 C274 108 244 100 216 94 Z'/>" +
      "<path d='M136 96 L134 130 L152 130 L154 100 Z'/>" +
      "<path d='M196 96 L192 130 L210 130 L214 100 Z'/>" +
      "<path d='M118 98 L118 130 L132 130 L132 102 Z' opacity='.55'/>" +
      "<path d='M216 96 L214 130 L228 130 L230 98 Z' opacity='.55'/>" +
      "<circle class='sf-eye' cx='57' cy='8' r='2'/>",
  },
  quad: {
    name: "four-legged dinosaur", w: 220, h: 80,
    art:
      "<path d='M70 26 Q78 17 86 25 Q95 14 106 23 Q116 13 128 21 Q138 15 146 25 Q154 20 160 29 L154 34 L74 33 Z'/>" +
      "<ellipse cx='112' cy='46' rx='56' ry='25'/>" +
      "<ellipse cx='58' cy='48' rx='20' ry='16'/>" +
      "<ellipse cx='30' cy='52' rx='17' ry='11'/>" +
      "<path d='M162 38 C188 42 206 52 218 64 C198 60 178 58 158 56 Z'/>" +
      "<path d='M70 60 L68 80 L84 80 L86 64 Z'/>" +
      "<path d='M138 62 L136 80 L152 80 L154 64 Z'/>" +
      "<path d='M54 60 L54 80 L66 80 L66 62 Z' opacity='.55'/>" +
      "<path d='M156 58 L154 80 L166 80 L168 60 Z' opacity='.55'/>" +
      "<circle class='sf-eye' cx='26' cy='50' r='2'/>",
  },
};

function pickSilhouette(t) {
  if (t.diet === "Herbivore") return t.lengthM >= 14 ? SILHOUETTES.sauropod : SILHOUETTES.quad;
  return SILHOUETTES.theropod;
}

function renderSize(t) {
  if (!t || !t.lengthM) {
    els.size.innerHTML = "";
    els.size.style.display = "none";
    return;
  }
  els.size.style.display = "";

  const len = t.lengthM;
  const sil = pickSilhouette(t);

  // Scene units: 10 per metre, so both figures share one honest scale.
  const HUMAN_H = 18, HUMAN_W = 6, PAD = 4, GAP = 7;
  const dinoW = len * 10;
  const dinoH = dinoW * (sil.h / sil.w);
  const tallest = Math.max(dinoH, HUMAN_H);
  const contentW = PAD + HUMAN_W + GAP + dinoW + PAD;

  // Settle the frame: font size tracks the frame width so labels render at
  // roughly the same on-screen size whether the animal is 0.5 m or 26 m.
  let viewW = Math.max(contentW, (tallest + 24) * 2.3);
  let fs = 0, topPad = 0, groundY = 0, viewH = 0;
  for (let i = 0; i < 3; i++) {
    fs = viewW * 0.036;
    topPad = fs * 2.6;
    groundY = topPad + tallest;
    viewH = groundY + fs * 2.2;
    viewW = Math.max(contentW, viewH * 2.3);
  }

  const humanX = PAD, humanY = groundY - HUMAN_H;
  const dinoX = PAD + HUMAN_W + GAP, dinoY = groundY - dinoH;
  const measureY = Math.max(dinoY - fs * 0.7, fs * 1.7);
  const tick = fs * 0.5;

  const people = Math.max(1, Math.round(len / 1.8));
  const note =
    len < 1.8
      ? "Shorter than an adult person."
      : `As long as about ${people} ${people === 1 ? "person" : "people"} lying head to toe.`;

  els.size.innerHTML =
    `<div class="size-label">Size · ${len} m long</div>` +
    `<svg class="size-figure" viewBox="0 0 ${viewW.toFixed(1)} ${viewH.toFixed(1)}"` +
    ` preserveAspectRatio="xMinYMax meet" style="aspect-ratio:${viewW.toFixed(1)}/${viewH.toFixed(1)}"` +
    ` role="img" aria-label="A ${len} metre long ${sil.name} drawn beside a 1.8 metre tall person">` +
    `<line class="sf-ground" x1="0" y1="${groundY.toFixed(1)}" x2="${viewW.toFixed(1)}" y2="${groundY.toFixed(1)}"/>` +
    `<g class="sf-measure">` +
    `<line x1="${dinoX.toFixed(1)}" y1="${measureY.toFixed(1)}" x2="${(dinoX + dinoW).toFixed(1)}" y2="${measureY.toFixed(1)}"/>` +
    `<line x1="${dinoX.toFixed(1)}" y1="${(measureY - tick).toFixed(1)}" x2="${dinoX.toFixed(1)}" y2="${(measureY + tick).toFixed(1)}"/>` +
    `<line x1="${(dinoX + dinoW).toFixed(1)}" y1="${(measureY - tick).toFixed(1)}" x2="${(dinoX + dinoW).toFixed(1)}" y2="${(measureY + tick).toFixed(1)}"/>` +
    `</g>` +
    `<text class="sf-tag" x="${(dinoX + dinoW / 2).toFixed(1)}" y="${(measureY - fs * 0.55).toFixed(1)}" text-anchor="middle" font-size="${fs.toFixed(2)}">${len} m</text>` +
    `<g transform="translate(${dinoX.toFixed(1)} ${dinoY.toFixed(1)}) scale(${(dinoW / sil.w).toFixed(4)})"><g class="sf-dino">${sil.art}</g></g>` +
    `<g transform="translate(${humanX} ${humanY.toFixed(1)}) scale(${(HUMAN_H / 100).toFixed(4)})"><g class="sf-human">${HUMAN_ART}</g></g>` +
    `<text class="sf-tag" x="0.5" y="${(groundY + fs * 1.5).toFixed(1)}" text-anchor="start" font-size="${fs.toFixed(2)}">you · 1.8 m</text>` +
    `</svg>` +
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
