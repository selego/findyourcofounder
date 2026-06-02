// app/sitemap.js
//
// Dynamic sitemap. One sitemap per country domain (`.nl` or `.es`) — the
// build env's APP_COUNTRY decides which TLD this build emits. Robots.txt
// advertises both sitemap URLs so search engines fetch each from its own host.

import { httpService } from "@/services/httpService";
import { APP_COUNTRY } from "@/app/config";
import { getSiteUrl, SKILL_TINT } from "@/app/utils/constants";
import { slugifyCity } from "@/lib/utils";

// Hourly ISR — crawlers (especially Google) hit /sitemap.xml many times a day;
// force-dynamic would re-fetch the full founder list every request.
export const revalidate = 3600;

const PRIORITY = {
  home: 1.0,
  concept: 0.8,
  hubIndex: 0.7,
  hub: 0.6,
  profile: 0.7,
  signup: 0.6,
  legal: 0.3,
};

export default async function getSitemap() {
  const base = getSiteUrl(APP_COUNTRY);
  const now = new Date();

  const urls = [
    { url: `${base}`, lastModified: now, changeFrequency: "daily", priority: PRIORITY.home },
    { url: `${base}/concept`, lastModified: now, changeFrequency: "monthly", priority: PRIORITY.concept },
    { url: `${base}/signup`, lastModified: now, changeFrequency: "monthly", priority: PRIORITY.signup },
    { url: `${base}/skills`, lastModified: now, changeFrequency: "weekly", priority: PRIORITY.hubIndex },
    { url: `${base}/cities`, lastModified: now, changeFrequency: "weekly", priority: PRIORITY.hubIndex },
    { url: `${base}/gdpr`, lastModified: now, changeFrequency: "yearly", priority: PRIORITY.legal },
    { url: `${base}/legale`, lastModified: now, changeFrequency: "yearly", priority: PRIORITY.legal },
  ];

  for (const skill of Object.keys(SKILL_TINT)) {
    urls.push({
      url: `${base}/skills/${skill.toLowerCase()}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: PRIORITY.hub,
    });
  }

  try {
    const { ok, data } = await httpService.post(
      `/search?timestamp=${now.getTime()}`,
      { per_page: 1000 },
    );
    if (ok) {
      const cities = new Set();
      for (const user of data?.users || []) {
        if (user.slug) {
          const updated = user.updated_at ? new Date(user.updated_at) : now;
          urls.push({
            url: `${base}/contact/${user.slug}`,
            lastModified: updated,
            changeFrequency: "weekly",
            priority: PRIORITY.profile,
          });
        }
        if (user.city) cities.add(slugifyCity(user.city));
      }
      for (const citySlug of cities) {
        if (!citySlug) continue;
        urls.push({
          url: `${base}/cities/${citySlug}`,
          lastModified: now,
          changeFrequency: "weekly",
          priority: PRIORITY.hub,
        });
      }
    }
  } catch {
    // If the API is unreachable, still return the static pages above.
  }

  return urls;
}
