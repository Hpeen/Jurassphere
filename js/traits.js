// Curated size/diet/pronunciation data for common genera, used to build the
// size chart and trait badges. Genera we don't have simply skip those bits.
import { genusOf } from "./enrich.js";

let table = null;

export async function loadTraits() {
  if (table) return table;
  try {
    const res = await fetch("data/traits.json");
    table = await res.json();
  } catch {
    table = {};
  }
  return table;
}

export function getTraits(name) {
  if (!table) return null;
  return table[genusOf(name).toLowerCase()] || null;
}
