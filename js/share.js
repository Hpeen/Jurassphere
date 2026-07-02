// Shareable deep links. A record is encoded in the URL hash as `#dino=<name>`
// so a pasted link reopens that fossil's field record. Pure parse/format
// helpers here; the wiring (reading location.hash, opening the panel) lives in
// main.js.

// Build the hash fragment (including the leading "#") for a fossil name.
export function deepLinkFor(name) {
  const n = String(name || "").trim();
  if (!n) return "";
  return "#dino=" + encodeURIComponent(n);
}

// Parse a hash string (e.g. "#dino=Tyrannosaurus%20rex") back to a name, or
// null if it carries no dino reference.
export function parseDeepLink(hash) {
  const raw = String(hash || "").replace(/^#/, "");
  if (!raw) return null;
  for (const part of raw.split("&")) {
    const [key, value] = part.split("=");
    if (key === "dino" && value) {
      try {
        return decodeURIComponent(value);
      } catch {
        return null;
      }
    }
  }
  return null;
}
