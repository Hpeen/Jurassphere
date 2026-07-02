// Wraps the global `Globe` from the globe.gl CDN script.
const ERA_COLORS = {
  Triassic: "#d8a63a",  // amber / resin
  Jurassic: "#8bbf5a",  // fern green
  Cretaceous: "#c2542f" // terracotta rust
};

const IMG = "//unpkg.com/three-globe/example/img";

export function createGlobe(el, onPointClick) {
  const globe = Globe()(el)
    // A living daytime Earth instead of the old near-black night texture,
    // with topographic relief and a starfield so the globe never floats in a void.
    .globeImageUrl(`${IMG}/earth-blue-marble.jpg`)
    .bumpImageUrl(`${IMG}/earth-topology.png`)
    .backgroundImageUrl(`${IMG}/night-sky.png`)
    .showAtmosphere(true)
    .atmosphereColor("#9db8d4")
    .atmosphereAltitude(0.16)
    .pointAltitude(0.02)
    .pointRadius(0.34)
    .pointColor((d) => ERA_COLORS[d.era] || "#d8a63a")
    .pointLabel((d) => `${d.title} — ${d.era}`)
    .onPointClick((d) => onPointClick(d));

  // Auto-spin until the user interacts.
  const controls = globe.controls();
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.55;
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
