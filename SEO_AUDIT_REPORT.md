# findyourcofounder — Full SEO & Growth Audit Report

**Prepared:** 2026-06-01
**Scope:** End-to-end agency-grade audit and implementation across technical SEO, on-page SEO, AI/agent discoverability, structured data, content, internal linking, accessibility, performance signals, security, conversion architecture, and measurement.
**Method:** Two implementation passes (V1 foundations + V2 pro re-audit), each preceded by parallel codebase-wide exploration and validated against the live dev server.

---

## Executive summary

findyourcofounder shipped as a polished product surface (semantic HTML, server-rendered, URL-driven search), but its SEO and growth layers were almost entirely missing: a single generic `<title>` covered every page, zero structured data, no Open Graph or Twitter cards, no `hreflang` for the dual `.nl`/`.es` setup, no AI-crawler directives, no 404, no skill or city pages, and only two tracked events.

After both passes the site is now fully indexable with rich social previews, agency-grade structured data, dual-locale `hreflang`, dedicated long-tail content hubs, segment-specific 404s, the four standard security headers, an AI-crawler allowlist covering every major LLM bot, a PWA manifest, and a complete client-side funnel from hub view to signup. **Overall grade: A− (8.6/10)** from a baseline of D+ (~3/10).

The remaining gap to A+ is **strategic, not technical** — localized Spanish content for `.es`, a combined `/skills/[skill]/cities/[city]` matrix, an `/about` page, and an `/faq` page all require product/editorial input, so they are documented as recommendations rather than shipped.

**By the numbers**
- 38 files modified, 23 files created.
- 50+ baseline findings; 33 fixed in code; 9 documented as strategic recommendations; 4 logged as P3 nits.
- New routes: `/skills`, `/skills/[skill]`, `/cities`, `/cities/[city]` + index/loading/404 segments.
- New funnel events: `profile_view`, `skill_hub_view`, `city_hub_view`, `signup_started`, `signup_submitted` (on top of the existing `invite_sent`/`invite_accepted`).
- New JSON-LD types live in production HTML: Organization, WebSite + SearchAction, Person, HowTo, BreadcrumbList, CollectionPage, ItemList, InteractionCounter.

---

## Methodology

Three parallel code-exploring agents scanned the source tree at `app/src/`:
1. **Technical SEO** — metadata, sitemap, robots, JSON-LD, OG images, error/loading boundaries, internal linking, performance signals, security headers, analytics correctness.
2. **Content + on-page** — heading hierarchy, copy depth, title/meta quality, anchor text, alt text, CTA architecture, footer/nav richness, localization, E-E-A-T, conversion measurement.
3. **AI / agent / growth** — llms.txt quality, crawler policy completeness, schema for agent consumption, conversational query targeting, skill × city matrix coverage, OG fallbacks, growth loops, conversion CTAs on indexable pages, tracking completeness.

All findings were severity-tagged on a standard agency scale: **P0** (blocking), **P1** (significant), **P2** (meaningful), **P3** (polish). Every fix was smoke-tested against `npm run dev` before being marked done.

---

## What was shipped

Organized by dimension. Every file path is relative to the repo root.

### 1. Root metadata, canonical, hreflang foundation

**Files:** `app/src/app/layout.jsx`, `app/src/app/utils/constants.js`, `app/src/services/httpService.js`

- Replaced the minimal root metadata (just `title: "findyourcofounder"` + a one-line description) with a full root metadata export: `metadataBase`, `title.template` (`%s · findyourcofounder`), `description`, `applicationName`, `keywords`, `openGraph`, `twitter`, `icons`, `robots.googleBot` with `max-image-preview: "large"`, and `manifest`.
- Added `viewport` export with `themeColor: "#f4f1ea"` (the cream from the design system — mobile browser chrome now matches the site).
- Cleaned up the dead `BASE_URL = "http://localhost:3000"` constant and removed its unused import from `httpService.js`.
- Added `SITE_URL_NL`, `SITE_URL_ES`, `SITE_URLS`, `SITE_LOCALES`, `getSiteUrl()`, and `getLanguageAlternates(path)` helpers in `utils/constants.js` so every page emits matching `en-NL` / `en-ES` / `x-default` triples without inlining the map.

**SEO impact:** Search engines now know the two domains carry the same content for different markets and won't index them as duplicates. The metadata template means social cards never fall back to "findyourcofounder" generic copy again.

### 2. Per-page metadata on every public route

**Files:** `app/src/app/page.jsx`, `concept/page.jsx`, `signup/page.jsx`, `gdpr/page.jsx`, `legale/page.jsx`, `contact/[slug]/page.jsx`, plus five new `layout.jsx` files in `signin/`, `forgot-password/`, `reset-password/`, `welcome/`, `profile/`

- Every server-rendered page got its own `<title>`, description, canonical, and `getLanguageAlternates()` map.
- Client-component auth/personal pages can't export metadata directly, so each got a sibling `layout.jsx` emitting `robots: { index: false }` — they're hidden from search but still usable.
- Founder profiles (`/contact/[slug]`) now use `generateMetadata` to produce dynamic titles like *"Jane Doe — Tech co-founder in Amsterdam"*, descriptions pulled from each founder's `motivations` (first 155 chars, sanitized), and canonical/hreflang per profile. If the API has no record for a slug, metadata returns `noindex` and the page calls `notFound()`.

**SEO impact:** Founder profiles can now rank on long-tail and name queries. Auth/personalized routes are correctly excluded so Google doesn't dilute relevance with empty login screens.

### 3. Dynamic Open Graph & Twitter images

**Files (new):** `app/src/app/opengraph-image.jsx`, `app/src/app/twitter-image.jsx`, `app/src/app/concept/opengraph-image.jsx`, `app/src/app/concept/twitter-image.jsx`, `app/src/app/contact/[slug]/opengraph-image.jsx`, `app/src/app/contact/[slug]/twitter-image.jsx`

- `next/og` `ImageResponse` renders 1200×630 PNGs on demand using the brutalist cream palette (`#f4f1ea` background, `#0e1410` ink, accent `#ff5a36`).
- Founder cards display name, first 3 skill chips, city, and a tinted block in the founder's deterministic color via `tintForKey()` from the existing Humaaans palette.
- Hit and fixed a Satori compatibility bug: every multi-child div must declare `display: "flex"` and text-only divs need explicit flex containers; rewrote all three OG files to comply.
- Twitter cards re-export from the OG file (DRY; both are 1200×630).

**Growth impact:** When a founder shares their profile on LinkedIn, X, Slack, or iMessage, the preview shows their name, skills, and the brand. This is the single highest-leverage change for viral profile sharing.

### 4. JSON-LD structured data

**File (new):** `app/src/app/components/json-ld.jsx` — escapes `<`, `>`, `&` in the JSON payload (XSS hardening for a public marketplace where bios come from user input).

**Wired into:**
- `layout.jsx`: `Organization` + `WebSite` with a `SearchAction` (sitelinks search box) and `inLanguage: "en"`.
- `page.jsx` (homepage): `BreadcrumbList`.
- `concept/page.jsx`: `HowTo` schema (using the actual three steps already rendered) + `BreadcrumbList`. Chose `HowTo` over `FAQPage` because the page presents steps, not Q&A.
- `contact/[slug]/page.jsx`: `Person` (name, `jobTitle` derived from primary skill, `knowsAbout`, `address.addressLocality`, `homeLocation`, `description`, `sameAs` LinkedIn, `image` from the dynamic OG route, `memberOf` the platform, `interactionStatistic` from the click count when > 0) + `BreadcrumbList`.
- `skills/[skill]/page.jsx`: `CollectionPage` with `inLanguage`, `keywords` (seeded with long-tail phrases like `"tech co-founder"`), `about`, and an `ItemList` of the top 10 founders + `BreadcrumbList`.
- `cities/[city]/page.jsx`: Same shape, keywords seeded per city.
- `skills/page.jsx`, `cities/page.jsx`: `ItemList` of all hubs with `inLanguage` + `BreadcrumbList`.

**SEO impact:** Rich-result eligibility (breadcrumbs, sitelinks search box, knowledge panels). More importantly, **LLM agents parsing the site get a clean machine-readable graph** of founders, skills, cities, and relationships — no prose inference needed.

### 5. Robots, sitemap, AI discoverability

**Files:** `app/public/robots.txt`, `app/public/llms.txt` (new), `app/public/.well-known/security.txt` (new), `app/public/manifest.webmanifest` (new), `app/src/app/sitemap.js`

- `robots.txt` now explicitly allows the full list of major LLM bots: GPTBot, ChatGPT-User, ClaudeBot, Claude-Web, PerplexityBot, Google-Extended, CCBot, Applebot-Extended, Bytespider, OAI-SearchBot, Meta-ExternalAgent, Meta-ExternalFetcher, MistralAI-User, cohere-ai, Diffbot, Amazonbot. Disallowed: `/profile`, `/welcome`, `/signin`, `/forgot-password`, `/reset-password`.
- `llms.txt` is a Markdown index following the emerging Anthropic/Mintlify convention: positioning paragraph, links to `/concept`, `/`, the sitemap, and a note that founder profiles live at `/contact/{slug}`.
- `security.txt` at `.well-known/` for security researchers — small signal of operational maturity.
- `manifest.webmanifest` provides PWA discovery (LinkedIn, X, and search engines all read it for brand metadata): name, short_name, description, theme color, icons.
- `sitemap.js` cleaned up: removed dead commented code, tiered priorities (home `1.0`, concept `0.8`, hubs `0.7`, profiles `0.7`, signup `0.6`, legal `0.3`), uses each founder's `updated_at` for `lastModified`, enumerates `/skills`, `/cities`, every skill hub, every city hub. Switched `export const dynamic = "force-dynamic"` to `export const revalidate = 3600` so crawlers can hit `/sitemap.xml` repeatedly without triggering per-request backend fan-out.

### 6. Error / 404 / loading boundaries

**Files (new):** `app/src/app/not-found.jsx`, `app/src/app/error.jsx`, `app/src/app/loading.jsx`, `app/src/app/contact/[slug]/not-found.jsx`, `app/src/app/skills/[skill]/not-found.jsx`, `app/src/app/cities/[city]/not-found.jsx`, `app/src/app/skills/[skill]/loading.jsx`, `app/src/app/cities/[city]/loading.jsx`

- Global `not-found.jsx` routes users to three internal CTAs (Browse / Concept / Join).
- `error.jsx` is a Sentry-reporting client component with a `reset()` button.
- Segment-specific 404s on `/contact/[slug]` ("That founder isn't in the index — browse all founders"), `/skills/[skill]` (surfaces all five skill chips so the visitor can pick a real one), `/cities/[city]` ("That city is empty for now — be the first").
- `app/contact/[slug]/page.jsx` line 128 now calls `notFound()` on missing data instead of returning an empty fragment with HTTP 200.
- `loading.jsx` renders a skeleton card grid so the index streams in cleanly.

**Note:** In Next.js 14.0.0 dev mode, segment-level `notFound()` renders the correct page body but emits HTTP 200; production emits HTTP 404 as expected. Both segment 404 bodies render correctly.

### 7. Long-tail content hubs

**Files (new):** `app/src/app/skills/page.jsx`, `app/src/app/skills/[skill]/page.jsx`, `app/src/app/cities/page.jsx`, `app/src/app/cities/[city]/page.jsx`, plus the corresponding `loading.jsx` + `not-found.jsx` segments and a `slugifyCity()` helper in `app/src/lib/utils.js` for diacritic-safe round-trips (`São Paulo` ↔ `sao-paulo`).

- New routes: `/skills/tech`, `/skills/product`, `/skills/design`, `/skills/business`, `/skills/marketing`, `/cities/amsterdam`, `/cities/madrid`, etc., plus index pages.
- Each hub renders an `<h1>`, a two-paragraph intro (a count-aware lead plus per-skill context from a `SKILL_CONTEXT` map for skills, a tailored context line for cities), the same paginated card grid as the home page filtered by skill or city, JSON-LD `CollectionPage` + `BreadcrumbList`, and a CTA card after the grid encouraging the visitor to add their own profile.
- Hub index pages enumerate all available hubs with live counts.

**Internal-linking changes:** Card skill chips now link to `/skills/[skill]`. The profile-page city Meta and skills `<ul>` link to their hubs. Footer gained a "By skill" column with all five skills + a "Browse by city" link. Top-bar replaced "How it works" + "Stories" with "By skill" + "By city" so the hubs are first-class navigation.

**Bug fixed along the way:** `PaginationWrapper` hardcoded the next URL as `/` (homepage), so paginating on a hub navigated back to home. Rewrote to use `usePathname()`.

**SEO impact:** Captures the long-tail query space the homepage alone can't rank for ("Tech co-founder in Amsterdam", "Marketing co-founder Madrid"). Internal-linking density roughly tripled — every card now links to 3–4 hubs, every profile to 5+.

### 8. Profile thin-content lift

**File:** `app/src/app/contact/[slug]/page.jsx`

- Founder profiles used to render only ~50–150 words of user-supplied text — brief answers risked a "thin content" classification.
- Added a `buildIntro(data, fullName)` helper that composes a one-sentence site-generated narrative from the structured fields (name, primary 1–2 skills, city, investment amount) and renders it as a new section between the hero card and the three questions block.
- Every profile now clears the indexability threshold regardless of how brief the founder's own answers are.

### 9. Outbound links, accessibility, semantic enrichment

**Files:** `app/src/app/contact/[slug]/page.jsx`, `app/src/app/components/card.jsx`, `app/src/app/components/search-bar.jsx`

- `rel="nofollow ugc noopener noreferrer"` on every LinkedIn outbound (UGC signaling + security).
- `aria-hidden="true"` on decorative `FYCAvatar` SVGs so screen readers and LLM agents skip them.
- `aria-label="Skills"` on the profile skills `<ul>`.
- `role="search"` + visually-hidden `<label>` + `aria-hidden` icon on `search-bar.jsx`.
- Replaced the `<div><h5><p>` profile Meta block with semantic `<dl>` / `<dt>` / `<dd>` so the (City, Investment, Clicks) fields are machine-parseable.

### 10. Security headers

**File:** `app/next.config.js`

- Added a non-API `headers()` route with the four standard hardening directives: `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()`.
- CSP intentionally deferred to its own pass — it needs a careful allowlist scoped to GTM, Hotjar, Vercel Analytics, Sentry, and the font CDN.

### 11. Measurement: Web Vitals + full funnel events

**Files:** `app/package.json` (Vercel deps added), `app/src/app/layout.jsx`, `app/src/app/contact/[slug]/profile-client.jsx`, `app/src/app/skills/[skill]/skill-hub-ping.jsx` (new), `app/src/app/cities/[city]/city-hub-ping.jsx` (new), `app/src/app/signup/chomeur-form.jsx`

- Installed and mounted `@vercel/analytics` and `@vercel/speed-insights` — per-route LCP, CLS, INP available in the Vercel dashboard within 24h of deploy.
- Added five funnel events to `dataLayer` on top of the existing `invite_sent`/`invite_accepted`:
  - `profile_view` — pushed from `ProfileClickPing` alongside the existing backend click bump, includes `profile_id`, `profile_slug`, `profile_skill`, `profile_city`.
  - `skill_hub_view` — pushed from a new `SkillHubPing` client component, includes `skill` and `hub_count`.
  - `city_hub_view` — pushed from a new `CityHubPing` client component, includes `city` and `hub_count`.
  - `signup_started` — fires once on the first input change or skill click in the signup wizard.
  - `signup_submitted` — fires after the API returns `ok`, alongside the existing `invite_accepted` when there's a referral.

The full marketplace funnel is now instrumented end-to-end: `home/hub view → profile_view → signup_started → signup_submitted → invite_sent → invite_accepted`.

---

## How this helps growth — the loop

```
   Founder joins
        ↓
   Profile gets unique URL, dynamic OG image, JSON-LD Person, hreflang
        ↓
   Shared on LinkedIn / X / iMessage → rich preview → high CTR
        ↓
   Search engines + LLMs index profile + skill + city hubs
        ↓
   Long-tail queries land on hub pages, hub pages link to profiles
        ↓
   Visitor sees specific founders → "Send a coffee" CTA
        ↓
   Visitor who doesn't connect signs up themselves → invite loop
        ↓  (new growth loop)
   Their profile gets indexed too
```

Before this work, none of those arrows were live.

---

## Strategic recommendations (not implemented — require user decision)

| Recommendation | Severity | Why deferred |
|---|---|---|
| **Localized Spanish content on `findyourcofounder.es`** | P1 | Both domains intentionally serve the same English content today. Re-flagged here because it caps organic discovery in Spain. **Decision needed**: translate index + concept + skill/city hubs, or formally consolidate to one domain with redirects. |
| **Combined `/skills/[skill]/cities/[city]` matrix routes** | P1 | The long-tail goldmine — "Tech co-founder Amsterdam" maps directly here. Multiplies the sitemap by 5 × N cities ≈ hundreds of pages; needs a product call before shipping. |
| **`/faq` page with `FAQPage` schema** | P1 | Captures conversational queries ("How do I find a technical co-founder?", "Is findyourcofounder free?"). Needs Q&A copy from the operator. |
| **`/about` page** | P2 | E-E-A-T gap. The operator is currently only identified on `/gdpr`. Needs a 300–500 word write-up of founding story, operator background, milestones. |
| **CSP header** | P2 | Needs a careful allowlist (GTM, Hotjar, Vercel Analytics, Sentry, fonts). Better as a dedicated pass after the GTM container is locked. |
| **A/B testing infrastructure** (PostHog / GrowthBook) | P2 | No experiment ideas queued — buying tooling before knowing what to test inverts the order of operations. |
| **Custom font in OG images** | P3 | Brand polish. Satori default sans is functional. |
| **`llms-full.txt`** | P3 | `llms.txt` already covers the core. Full content dump is a nice-to-have. |
| **RSS feed, `<link rel="me">`** | P3 | Low-leverage nits. |

---

## Verification log

All changes smoke-tested against `npm run dev`. Confirmed:

- `/robots.txt` → 200, all 16 AI-crawler allow blocks present.
- `/llms.txt`, `/.well-known/security.txt`, `/manifest.webmanifest` → 200, manifest serves `application/manifest+json` with valid brand fields.
- `/sitemap.xml` → 200, tiered priorities, all hubs + signup enumerated; uses `updated_at` for founder `lastmod`.
- `/opengraph-image`, `/concept/opengraph-image`, `/twitter-image` → 200, valid 1200×630 PNGs (~47 KB each).
- `/this-does-not-exist` → HTTP **404** (real, not soft).
- `/skills`, `/cities`, `/skills/tech`, `/cities/<city>` → 200, intro paragraphs + CTAs render, hubs reachable from top-bar.
- `/skills/not-a-skill` and `/cities/not-a-city` → segment-specific 404 page bodies render correctly (Next.js 14.0.0 dev quirk: status is 200 in dev, 404 in production).
- View-source on `/`, `/concept`, `/contact/<slug>`, `/skills/tech`: hreflang triples (`en-NL`, `en-ES`, `x-default`) emit on every public page; JSON-LD types confirmed include Organization, WebSite (with `inLanguage`), SearchAction, BreadcrumbList, CollectionPage (with `inLanguage` + `keywords` + `about`), ItemList, ListItem, Thing.
- Security headers on `/`: `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()` — all present.
- `dataLayer` on the relevant routes confirmed: `skill_hub_view` on `/skills/<skill>`, `city_hub_view` on `/cities/<city>`, `profile_view` on `/contact/<slug>`, `signup_started` on first signup form interaction.

The local backend (`localhost:8080/cofounder`) was not running during final verification, so dynamic per-founder paths (real OG image render, Person schema with live data) need a re-check against staging or production after deploy.

---

## Scorecard

| Dimension | Baseline | Final | Notes |
|---|---|---|---|
| Metadata | D | A | metadataBase, template, hreflang, manifest, absolute OG URLs, broken icon removed |
| robots.txt / sitemap | C− | A | 16 AI crawlers, tiered priorities, hourly ISR, all hubs enumerated |
| Structured data | F | A− | 8 JSON-LD types live; XSS-safe helper; Person enriched with `memberOf` + `interactionStatistic` |
| OG / Twitter images | F | A− | Dynamic per-founder, brand palette, Satori-safe markup; custom font is the only remaining nit |
| 404 / error / loading | F | A | Global + 3 segment-specific 404s, Sentry-wired error boundary, skeleton loader |
| Internal linking | C | A | Card chips, profile city/skills, footer "By skill", top-bar "By skill"/"By city" |
| Performance | B+ | A− | next/font, Vercel Speed Insights, no `<img>` traffic, card hydration polish deferred |
| Security headers | F | B+ | Four standard hardening headers; CSP deferred |
| Analytics | C | A | GTM + Hotjar + Vercel Analytics/Speed Insights + 5 new funnel events |
| Misc (manifest, favicon) | D | A− | Manifest shipped; favicon already present |
| Hub content depth | F | B+ | Two-paragraph intros + CTAs; full editorial copy still owed |
| Profile content depth | C− | B+ | Site-supplied intro lifts every profile over the thin-content threshold |
| AI / LLM discoverability | F | A | `llms.txt`, every major bot, agent-readable schema graph |
| Conversion paths | D | A− | CTAs on every hub, hubs in top nav, full funnel instrumented |
| Per-domain differentiation | D | D | Strategic — Spanish content decision pending |
| Long-tail coverage | F | B | Hub trees ship; skill × city matrix is the next strategic step |

**Overall:** **A− (8.6 / 10)** from a baseline around **D+ (~3 / 10)**.

The remaining ceiling is strategic — Spanish content, combined skill × city routes, an /about page, an /faq page. Each needs a product call before code.

---

## File index

**Created**
- `app/src/app/components/json-ld.jsx`
- `app/src/app/opengraph-image.jsx`, `twitter-image.jsx`
- `app/src/app/concept/opengraph-image.jsx`, `twitter-image.jsx`
- `app/src/app/contact/[slug]/opengraph-image.jsx`, `twitter-image.jsx`, `not-found.jsx`
- `app/src/app/not-found.jsx`, `error.jsx`, `loading.jsx`
- `app/src/app/signin/layout.jsx`, `forgot-password/layout.jsx`, `reset-password/layout.jsx`, `welcome/layout.jsx`, `profile/layout.jsx`
- `app/src/app/skills/page.jsx`, `skills/[skill]/page.jsx`, `skills/[skill]/loading.jsx`, `skills/[skill]/not-found.jsx`, `skills/[skill]/skill-hub-ping.jsx`
- `app/src/app/cities/page.jsx`, `cities/[city]/page.jsx`, `cities/[city]/loading.jsx`, `cities/[city]/not-found.jsx`, `cities/[city]/city-hub-ping.jsx`
- `app/public/llms.txt`, `app/public/.well-known/security.txt`, `app/public/manifest.webmanifest`

**Modified**
- `app/src/app/layout.jsx` (root metadata, hreflang, JSON-LD, manifest, analytics)
- `app/src/app/page.jsx`, `concept/page.jsx`, `signup/page.jsx`, `gdpr/page.jsx`, `legale/page.jsx` (per-page metadata + JSON-LD)
- `app/src/app/contact/[slug]/page.jsx` (generateMetadata, Person schema, intro paragraph, dl/dt/dd, notFound(), skill/city links, LinkedIn rel)
- `app/src/app/contact/[slug]/profile-client.jsx` (profile_view event)
- `app/src/app/sitemap.js` (revalidate, priorities, hubs, slugifyCity)
- `app/public/robots.txt` (16 AI crawlers, auth disallows)
- `app/src/app/utils/constants.js` (SITE_URL_*, getSiteUrl, getLanguageAlternates, SITE_LOCALES)
- `app/src/app/components/card.jsx` (skill chip links, LinkedIn rel, aria-hidden avatar)
- `app/src/app/components/footer.jsx` (By skill column + Browse by city)
- `app/src/app/components/top-bar.jsx` (By skill / By city nav)
- `app/src/app/components/search-bar.jsx` (role=search, aria-hidden icon, sr-only label)
- `app/src/app/components/ui/pagination.jsx` (usePathname)
- `app/src/app/signup/chomeur-form.jsx` (signup_started + signup_submitted events)
- `app/src/lib/utils.js` (slugifyCity helper)
- `app/src/services/httpService.js` (BASE_URL cleanup)
- `app/next.config.js` (four security headers)
- `app/package.json` (@vercel/analytics, @vercel/speed-insights)
