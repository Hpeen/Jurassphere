export function filterByEra(sites, era) {
  if (era === "All") return sites.slice();
  return sites.filter((s) => s.era === era);
}

export function searchSites(sites, query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return sites.filter((s) => s.name.toLowerCase().includes(q));
}

// Keep only sites alive `ma` million years ago — i.e. whose age window
// [minMa, maxMa] contains ma. A null/undefined ma means "no time filter".
// Sites missing numeric ages are never hidden (we simply can't place them).
export function filterByTime(sites, ma) {
  if (ma == null) return sites.slice();
  return sites.filter((s) => {
    const min = Number(s.minMa);
    const max = Number(s.maxMa);
    if (Number.isNaN(min) || Number.isNaN(max)) return true;
    return ma >= min && ma <= max;
  });
}
