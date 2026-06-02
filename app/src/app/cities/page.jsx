import Link from "next/link";
import { JsonLd } from "@/app/components/json-ld";
import { getSiteUrl, getLanguageAlternates } from "@/app/utils/constants";
import { httpService } from "@/services/httpService";
import { slugifyCity } from "@/lib/utils";

const SITE_URL = getSiteUrl();

export const metadata = {
  title: "Browse by city",
  description:
    "Find co-founders in your city. Browse founders by location on findyourcofounder.",
  alternates: { canonical: "/cities", languages: getLanguageAlternates("/cities") },
  openGraph: {
    title: "Browse co-founders by city",
    description: "Find co-founders in your city.",
    url: "/cities",
    type: "website",
  },
};

async function getCityCounts() {
  try {
    const { ok, data } = await httpService.post(
      `/search?timestamp=${Date.now()}`,
      { per_page: 1000 },
    );
    if (!ok) return [];
    const counts = new Map();
    for (const u of data?.users || []) {
      const city = (u.city || "").trim();
      if (!city) continue;
      counts.set(city, (counts.get(city) || 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count || a.city.localeCompare(b.city));
  } catch {
    return [];
  }
}

export default async function CitiesIndex() {
  const cities = await getCityCounts();

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Cities with co-founders on findyourcofounder",
    inLanguage: "en",
    itemListElement: cities.slice(0, 50).map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/cities/${slugifyCity(c.city)}`,
      name: c.city,
    })),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Cities", item: `${SITE_URL}/cities` },
    ],
  };

  return (
    <main className="bg-bg min-h-screen pt-[100px] pb-24 px-6 lg:px-10">
      <JsonLd data={itemListLd} />
      <JsonLd data={breadcrumbLd} />
      <section className="max-w-[1100px] mx-auto">
        <div className="mb-10 max-w-[760px]">
          <div className="font-mono text-[11.5px] tracking-[0.18em] uppercase text-accent mb-4">
            Browse by city
          </div>
          <h1 className="font-display font-bold text-[48px] lg:text-[64px] leading-[1] tracking-[-0.035em] text-ink m-0">
            Co-founders{" "}
            <span className="font-serif italic font-normal text-accent">
              near you
            </span>
            .
          </h1>
        </div>

        {cities.length > 0 ? (
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {cities.map(({ city, count }) => (
              <li key={city}>
                <Link
                  href={`/cities/${slugifyCity(city)}`}
                  className="block bg-paper rounded-2xl border-[1.5px] border-ink p-4 hover:shadow-card-sm transition-shadow"
                >
                  <div className="font-display font-bold text-base tracking-tight text-ink truncate">
                    {city}
                  </div>
                  <div className="font-mono text-[10.5px] tracking-[0.18em] uppercase text-muted mt-1">
                    {count} founder{count === 1 ? "" : "s"}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted font-serif italic text-lg">
            No cities yet — check back soon.
          </p>
        )}

        <aside className="mt-16 bg-paper rounded-[22px] border-[1.5px] border-ink shadow-card p-8 lg:p-10 text-center">
          <h2 className="font-display font-bold text-[28px] lg:text-[34px] tracking-[-0.02em] text-ink m-0">
            Don&apos;t see your city?
          </h2>
          <p className="mt-3 text-base text-ink-2 max-w-[520px] mx-auto leading-relaxed">
            Join the index — your city goes on the map the moment you do.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 mt-6 px-5 py-3 rounded-full bg-ink text-primary-ink text-[13.5px] font-semibold hover:bg-ink/90 transition-colors"
          >
            Join the index
          </Link>
        </aside>
      </section>
    </main>
  );
}
