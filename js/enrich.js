// Pull a plain-language description + image from Wikipedia's free REST summary
// endpoint. Keyed by genus (the first word of the name), cached per genus so
// repeat clicks are instant. Any failure resolves to null and the caller keeps
// its curated content.
const cache = new Map();

export function genusOf(name) {
  return String(name || "").trim().split(/\s+/)[0] || "";
}

export function fetchWikiSummary(name) {
  const genus = genusOf(name);
  if (!genus) return Promise.resolve(null);
  if (cache.has(genus)) return cache.get(genus);

  const promise = (async () => {
    try {
      const url =
        "https://en.wikipedia.org/api/rest_v1/page/summary/" +
        encodeURIComponent(genus);
      const res = await fetch(url, { headers: { accept: "application/json" } });
      if (!res.ok) return null;
      const j = await res.json();
      if (j.type === "disambiguation" || !j.extract) return null;
      return {
        extract: j.extract,
        image:
          (j.thumbnail && j.thumbnail.source) ||
          (j.originalimage && j.originalimage.source) ||
          null,
        url:
          (j.content_urls &&
            j.content_urls.desktop &&
            j.content_urls.desktop.page) ||
          null
      };
    } catch {
      return null;
    }
  })();

  cache.set(genus, promise);
  return promise;
}
