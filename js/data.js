// Geologic period boundaries (millions of years ago)
export function classifyEra(maxMa, minMa) {
  const mid = (Number(maxMa) + Number(minMa)) / 2;
  if (mid >= 66 && mid <= 145) return "Cretaceous";
  if (mid > 145 && mid <= 201.4) return "Jurassic";
  if (mid > 201.4 && mid <= 251.9) return "Triassic";
  return "Other";
}

export function normalizeOccurrence(record) {
  const lat = parseFloat(record.lat);
  const lng = parseFloat(record.lng);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;

  const name = record.accepted_name || record.identified_name || "Unknown taxon";
  const location =
    [record.state, record.cc].filter(Boolean).join(", ") || "Unknown location";

  return {
    id: String(record.occurrence_no),
    name,
    title: name,
    lat,
    lng,
    era: classifyEra(record.max_ma, record.min_ma),
    location,
    description: `${name} — found in rocks dated about ${record.max_ma}–${record.min_ma} million years ago.`,
    image: null
  };
}

const TARGET_ERAS = new Set(["Triassic", "Jurassic", "Cretaceous"]);

export function normalizeAll(records) {
  const out = [];
  for (const rec of records) {
    const site = normalizeOccurrence(rec);
    if (site && TARGET_ERAS.has(site.era)) out.push(site);
  }
  return out;
}
