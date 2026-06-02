export const skillsColors = {
  Business: "bg-business",
  Design: "bg-design",
  Marketing: "bg-marketing",
  Product: "bg-product",
  Tech: "bg-tech",
};

// Skill chip tint — bg colour + matching text colour for legibility.
// Single source of truth shared by card, signup, profile, and contact pages.
export const SKILL_TINT = {
  Tech: "bg-tech text-white",
  Product: "bg-product text-white",
  Design: "bg-design text-white",
  Business: "bg-business text-ink",
  Marketing: "bg-marketing text-white",
};

export const SERVER_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://api-cofounder.cleverapps.io/cofounder"
    : "http://localhost:8080/cofounder";

// Canonical production URLs per country domain. The same English content is
// served from both — search engines need hreflang alternates to dedupe them.
export const SITE_URL_NL = "https://findyourcofounder.nl";
export const SITE_URL_ES = "https://findyourcofounder.es";

export const SITE_URLS = {
  nl: SITE_URL_NL,
  es: SITE_URL_ES,
};

export const SITE_LOCALES = {
  nl: "en_NL",
  es: "en_ES",
};

// Server-side canonical resolver. APP_COUNTRY's window-based fallback returns
// "es" on the server, so we read directly from the env var here.
export function getSiteUrl(country = process.env.APP_COUNTRY) {
  return SITE_URLS[country] ?? SITE_URL_NL;
}

// hreflang alternates for a given path. Next.js metadata's `alternates` object
// is replaced (not merged) when a child page sets its own canonical, so every
// public page must spread these `languages` into its own `alternates`.
export function getLanguageAlternates(path = "/") {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return {
    "en-NL": `${SITE_URL_NL}${normalized}`,
    "en-ES": `${SITE_URL_ES}${normalized}`,
    "x-default": `${SITE_URL_NL}${normalized}`,
  };
}
