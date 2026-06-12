const EUROPE_CC = new Set([
  "AL", "AD", "AT", "BA", "BE", "BG", "BY", "CH", "CY", "CZ",
  "DE", "DK", "EE", "ES", "FI", "FO", "FR", "GB", "GE", "GI",
  "GR", "HR", "HU", "IE", "IM", "IS", "IT", "LI", "LT", "LU",
  "LV", "MC", "MD", "ME", "MK", "MT", "NL", "NO", "PL", "PT",
  "RO", "RS", "RU", "SE", "SI", "SJ", "SK", "SM", "TR", "UA",
  "VA", "XK",
]);

const ENDPOINT = "https://photon.komoot.io/api/";

export async function searchEuropeanCities(query, { signal } = {}) {
  const q = (query || "").trim();
  if (q.length < 2) return [];
  const url = `${ENDPOINT}?q=${encodeURIComponent(q)}&limit=15&lang=en&osm_tag=place:city&osm_tag=place:town`;
  try {
    const res = await fetch(url, { signal });
    if (!res.ok) return [];
    const json = await res.json();
    const features = Array.isArray(json?.features) ? json.features : [];
    const out = [];
    const seen = new Set();
    for (const f of features) {
      const p = f?.properties || {};
      const cc = p.countrycode;
      const name = p.name;
      if (!name || !cc || !EUROPE_CC.has(cc)) continue;
      const key = `${name.toLowerCase()}|${cc}|${(p.state || "").toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({
        city: name,
        country: cc,
        region: p.state || "",
        label: [name, p.state, cc].filter(Boolean).join(", "),
      });
      if (out.length === 8) break;
    }
    return out;
  } catch {
    return [];
  }
}
