import { notFound } from "next/navigation";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa6";
import { Card } from "@/app/components/card";
import { JsonLd } from "@/app/components/json-ld";
import { httpService } from "@/services/httpService";
import { getSiteUrl, getLanguageAlternates } from "@/app/utils/constants";
import { PaginationWrapper } from "@/app/components/ui/pagination";
import { slugifyCity } from "@/lib/utils";
import { CityHubPing } from "./city-hub-ping";

const SITE_URL = getSiteUrl();
const PER_PAGE = 16;

const titleCase = (slug) =>
  decodeURIComponent(slug)
    .split(/[-\s]+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : ""))
    .join(" ");

async function fetchFounders() {
  try {
    const { ok, data } = await httpService.post(
      `/search?timestamp=${Date.now()}`,
      { per_page: 1000 },
    );
    if (!ok) return [];
    return data?.users || [];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }) {
  const cityName = titleCase(params.city);
  const title = `Co-founders in ${cityName}`;
  const description = `Founders in ${cityName} open to meeting a co-founder. Updated daily on findyourcofounder.`;
  const path = `/cities/${params.city.toLowerCase()}`;
  return {
    title,
    description,
    alternates: { canonical: path, languages: getLanguageAlternates(path) },
    openGraph: { title, description, url: path, type: "website" },
  };
}

export default async function CityHub({ params, searchParams }) {
  const all = await fetchFounders();
  const targetSlug = decodeURIComponent(params.city).toLowerCase();
  const matching = all.filter((u) => slugifyCity(u.city) === targetSlug);
  if (matching.length === 0) notFound();
  const canonicalCity = matching[0].city || titleCase(params.city);

  const currentPage = parseInt(searchParams.page) || 1;
  const start = (currentPage - 1) * PER_PAGE;
  const users = matching.slice(start, start + PER_PAGE);

  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Co-founders in ${canonicalCity}`,
    url: `${SITE_URL}/cities/${params.city.toLowerCase()}`,
    inLanguage: "en",
    keywords: [
      `co-founder in ${canonicalCity.toLowerCase()}`,
      `${canonicalCity.toLowerCase()} startup co-founder`,
      "find a co-founder",
    ],
    isPartOf: { "@type": "WebSite", name: "findyourcofounder", url: SITE_URL },
    about: { "@type": "Place", name: canonicalCity },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: matching.length,
      itemListElement: users.slice(0, 10).map((u, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/contact/${u.slug}`,
        name: `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim(),
      })),
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Cities", item: `${SITE_URL}/cities` },
      { "@type": "ListItem", position: 3, name: canonicalCity, item: `${SITE_URL}/cities/${params.city.toLowerCase()}` },
    ],
  };

  return (
    <main className="bg-bg min-h-screen pt-[100px] pb-24 px-6 lg:px-10">
      <JsonLd data={collectionLd} />
      <JsonLd data={breadcrumbLd} />
      <CityHubPing city={canonicalCity} count={matching.length} />
      <section className="max-w-[1320px] mx-auto">
        <Link
          href="/cities"
          className="inline-flex items-center gap-2 font-mono text-[11.5px] tracking-[0.18em] uppercase text-muted hover:text-ink transition-colors mb-6 group"
        >
          <FaArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
          All cities
        </Link>
        <div className="mb-10 max-w-[860px]">
          <div className="font-mono text-[11.5px] tracking-[0.18em] uppercase text-accent mb-4">
            {canonicalCity} · {matching.length} founders
          </div>
          <h1 className="font-display font-bold text-[48px] lg:text-[64px] leading-[1] tracking-[-0.035em] text-ink m-0">
            Co-founders in{" "}
            <span className="font-serif italic font-normal text-accent">
              {canonicalCity}
            </span>
          </h1>
          <p className="mt-5 text-lg text-ink-2 leading-relaxed">
            {matching.length} founder{matching.length === 1 ? "" : "s"} based in{" "}
            {canonicalCity}, open to meeting a co-founder right now. Browse their
            answers below — what motivates them, the kind of partner they want, the
            business they&apos;d build — and reach out directly.
          </p>
          <p className="mt-3 text-base text-muted leading-relaxed">
            Looking in person beats looking online. The shorter the commute to
            the first coffee, the more often the second one happens.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
          {users.map((u, i) => (
            <Card user={u} idx={start + i} key={u._id || u.slug} />
          ))}
        </div>

        <div className="mt-14">
          <PaginationWrapper
            currentPage={currentPage}
            totalItems={matching.length}
            itemsPerPage={PER_PAGE}
          />
        </div>

        <aside className="mt-20 bg-paper rounded-[22px] border-[1.5px] border-ink shadow-card p-8 lg:p-10 text-center">
          <div className="font-mono text-[11.5px] tracking-[0.18em] uppercase text-accent mb-3">
            Also in {canonicalCity}?
          </div>
          <h2 className="font-display font-bold text-[28px] lg:text-[34px] tracking-[-0.02em] text-ink m-0">
            Add yourself to the index.
          </h2>
          <p className="mt-3 text-base text-ink-2 max-w-[520px] mx-auto leading-relaxed">
            Three questions, six minutes. Free. Your future co-founder might be
            two metro stops away.
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
