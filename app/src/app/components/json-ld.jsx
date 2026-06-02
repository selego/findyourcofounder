// JSON-LD payloads may include user-supplied strings (founder bios, names).
// Escape `<`, `>`, and `&` so the JSON literal can't close the <script> tag
// or smuggle HTML — the safe, dependency-free way to embed structured data.
const escapeJsonLd = (json) =>
  json.replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");

export function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: escapeJsonLd(JSON.stringify(data)) }}
    />
  );
}
