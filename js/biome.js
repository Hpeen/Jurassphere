// Classify a dig site into a broad biome from its modern coordinates.
// Deliberately coarse: enough to change the scene's mood (jungle / desert /
// polar / plains), not a climate model. Many famous digs sit in arid badlands,
// so those boxes are listed explicitly.

// [latMin, latMax, lngMin, lngMax] boxes that read as "desert / arid badlands".
const ARID_BOXES = [
  [12, 33, -17, 55],     // Sahara, Arabia
  [36, 50, 85, 112],     // Gobi, Central Asia
  [34, 49, -116, -100],  // US interior west: Montana, Wyoming, Utah, Dakotas
  [38, 48, 55, 85],      // Kazakh / Uzbek deserts
  [-35, -22, -70, -63],  // Argentine northwest (Ischigualasto / Cuyo)
  [-55, -36, -73, -62],  // Patagonia
  [-33, -18, 118, 146]   // Australian outback
];

function inBox(lat, lng, [latMin, latMax, lngMin, lngMax]) {
  return lat >= latMin && lat <= latMax && lng >= lngMin && lng <= lngMax;
}

// Returns one of: "jungle" | "desert" | "polar" | "plains".
export function classifyBiome(lat, lng) {
  const la = Number(lat);
  const ln = Number(lng);
  if (Number.isNaN(la) || Number.isNaN(ln)) return "jungle";
  if (Math.abs(la) > 66.5) return "polar";
  if (ARID_BOXES.some((box) => inBox(la, ln, box))) return "desert";
  if (Math.abs(la) <= 23.5) return "jungle"; // humid tropics
  return "plains"; // temperate default
}
