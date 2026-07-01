const els = {};

export function initPanel() {
  els.panel = document.getElementById("panel");
  els.image = document.getElementById("panel-image");
  els.title = document.getElementById("panel-title");
  els.era = document.getElementById("panel-era");
  els.location = document.getElementById("panel-location");
  els.desc = document.getElementById("panel-desc");
  document.getElementById("panel-close").addEventListener("click", closePanel);
}

export function openPanel(site) {
  els.title.textContent = site.title;
  els.era.textContent = site.era;
  els.era.dataset.era = site.era;
  els.location.textContent = site.location;
  els.desc.textContent = site.description;
  if (site.image) {
    els.image.style.backgroundImage = `url("${site.image}")`;
    els.image.classList.remove("placeholder");
  } else {
    els.image.style.backgroundImage = "";
    els.image.classList.add("placeholder");
    els.image.textContent = "🦕";
  }
  els.panel.classList.add("open");
  els.panel.setAttribute("aria-hidden", "false");
}

export function closePanel() {
  els.panel.classList.remove("open");
  els.panel.setAttribute("aria-hidden", "true");
}
