// Great-circle distance and nearest-site helpers for the "near me" feature.
// Pure functions so they can be unit-tested without a browser/geolocation.

const R_KM = 6371; // mean Earth radius

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

// Haversine distance in kilometres between two lat/lng points.
export function haversineKm(lat1, lng1, lat2, lng2) {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R_KM * Math.asin(Math.min(1, Math.sqrt(a)));
}

// Return the `n` sites closest to (lat,lng), each annotated with `distanceKm`,
// nearest first. Sites with invalid coords are skipped.
export function nearestSites(sites, lat, lng, n = 5) {
  return sites
    .filter((s) => Number.isFinite(s.lat) && Number.isFinite(s.lng))
    .map((s) => ({ ...s, distanceKm: haversineKm(lat, lng, s.lat, s.lng) }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, n);
}
