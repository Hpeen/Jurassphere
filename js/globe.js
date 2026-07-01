// Wraps the global `Globe` from the globe.gl CDN script.
const ERA_COLORS = {
  Triassic: "#c9a24a",  // ochre
  Jurassic: "#7f9b63",  // moss
  Cretaceous: "#c25a34" // rust
};

export function createGlobe(el, onPointClick) {
  const globe = Globe()(el)
    .globeImageUrl("//unpkg.com/three-globe/example/img/earth-dark.jpg")
    .backgroundColor("rgba(0,0,0,0)")
    .pointAltitude(0.01)
    .pointRadius(0.35)
    .pointColor((d) => ERA_COLORS[d.era] || "#f0a437")
    .pointLabel((d) => `${d.title} — ${d.era}`)
    .onPointClick((d) => onPointClick(d));

  // Auto-spin until the user interacts.
  const controls = globe.controls();
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.6;
  el.addEventListener("pointerdown", () => (controls.autoRotate = false), { once: true });

  window.addEventListener("resize", () => {
    globe.width(el.clientWidth).height(el.clientHeight);
  });
  globe.width(el.clientWidth).height(el.clientHeight);

  return globe;
}

export function setPoints(globe, sites) {
  globe.pointsData(sites);
}

export function flyTo(globe, lat, lng) {
  globe.pointOfView({ lat, lng, altitude: 1.6 }, 1200);
}
