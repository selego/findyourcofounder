# findyourcofounder — SEO & Growth Audit Summary

**Date:** 2026-06-01

## The headline

findyourcofounder went from **D+ (3/10)** to **A− (8.6/10)** on a standard agency SEO scorecard. Every public page is now indexable with rich social previews and structured data, the site is fully prepared for AI-driven discovery, and the full signup funnel is measurable end-to-end.

The remaining gap to A+ is **strategic**, not technical — three items below need a product call before we can ship them.

## What was broken

Before this work, the site shipped with a polished product but an empty SEO surface:

- One generic title and description covered every page, including founder profiles (the highest-value SEO surface).
- Zero structured data, zero Open Graph or Twitter cards, no `hreflang` for the dual `.nl`/`.es` domains.
- Broken founder URLs returned blank pages with HTTP 200 — Google was silently indexing them.
- No skill or city pages — we couldn't rank for "tech co-founder in Amsterdam" or any long-tail query.
- AI crawlers (ChatGPT, Claude, Perplexity, Google AI) had no guidance on how to read the site.
- Only two events were tracked, so we had no funnel visibility.

## What we shipped

1. **Per-page metadata and dual-domain `hreflang`.** Every public route has its own title, description, canonical, and language alternates. Founder profiles get dynamic titles like *"Jane Doe — Tech co-founder in Amsterdam"* generated from the data.

2. **Dynamic social previews.** Every shared founder URL on LinkedIn, X, Slack, or iMessage now renders a branded 1200×630 preview with the founder's name, skills, and city. This is the single highest-leverage change for viral sharing.

3. **Structured data for both Google and AI agents.** Eight schema types live in the HTML — Organization, WebSite with sitelinks search, Person (per founder, with skills, city, LinkedIn, click count), BreadcrumbList, HowTo, CollectionPage, ItemList. LLM crawlers can now build a clean machine-readable index of every founder.

4. **AI-crawler discoverability.** `robots.txt` explicitly welcomes all 16 major LLM crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Meta, Mistral, Cohere, and the rest). A new `llms.txt` summarises the site for agents in the emerging Anthropic/Mintlify format.

5. **Long-tail content hubs.** New routes at `/skills/tech`, `/skills/product`, `/skills/design`, `/skills/business`, `/skills/marketing`, and `/cities/<city>` for every city represented on the platform — each with its own metadata, structured data, intro copy, and conversion CTA. These hubs are now reachable from the top-bar nav and footer.

6. **Conversion architecture.** Every hub page has a "Add yourself to the index" CTA card after the founder grid. Card skill chips, profile city, and profile skills all link to the relevant hubs — internal linking density roughly tripled.

7. **Real 404s and recovery pages.** Broken founder slugs now return proper HTTP 404 with a branded page that routes the visitor back into the index. Skill and city segments have their own topic-specific 404s.

8. **Security and operational basics.** Four standard hardening headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy). PWA manifest for app-store/LinkedIn brand discovery. Sitemap switched from per-request to hourly caching so crawler traffic doesn't hammer the backend.

9. **Full funnel measurement.** Vercel Speed Insights for per-route Core Web Vitals (LCP / CLS / INP). Five new GTM events — `profile_view`, `skill_hub_view`, `city_hub_view`, `signup_started`, `signup_submitted` — close the loop from landing to converted founder.

## What this unlocks

- **Organic discovery in search.** Founders rank individually on long-tail queries; hub pages catch the "tech co-founder in Amsterdam" style traffic the homepage alone never could.
- **Viral profile sharing.** Every shared founder link now carries a rich preview with name, skills, and brand — multi-x CTR vs. an unconfigured share.
- **AI-driven traffic.** When a user asks ChatGPT, Claude, or Perplexity "Who can I meet to co-found a startup in [city]?", findyourcofounder profiles are now citable.
- **Measurable growth.** We can see conversion at every funnel step and finally diagnose where founders drop off.

## What's still pending — needs a decision

These are the highest-value remaining moves, but each needs a product/business call before we can ship them.

| Item | Why it matters | What we need |
|---|---|---|
| **Spanish-language content on `.es`** | The Spain market currently sees only English copy, capping organic discovery in Madrid, Barcelona, Valencia. | Decision: translate the core pages or consolidate to one domain. |
| **Combined skill × city pages** (e.g. `/skills/tech/cities/amsterdam`) | The single biggest long-tail opportunity — hundreds of high-intent pages. | Sign-off to ship; doubles the sitemap surface and adds light maintenance. |
| **`/about` and `/faq` pages** | E-E-A-T (trust) signals; Google and LLMs both look for them. | Operator background, founding story, and a handful of Q&A pairs. |

## Files

Two reports live in the repo:
- `SEO_AUDIT_SUMMARY.md` — this document.
- `SEO_AUDIT_REPORT.md` — the full technical audit with every file path, severity tag, verification step, and scorecard.
