export function filterByEra(sites, era) {
  if (era === "All") return sites.slice();
  return sites.filter((s) => s.era === era);
}

export function searchSites(sites, query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return sites.filter((s) => s.name.toLowerCase().includes(q));
}
