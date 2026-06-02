import Link from "next/link";
import { JsonLd } from "@/app/components/json-ld";
import { SKILL_TINT, getSiteUrl, getLanguageAlternates } from "@/app/utils/constants";
import { httpService } from "@/services/httpService";

const SITE_URL = getSiteUrl();
const SKILLS = Object.keys(SKILL_TINT);

export const metadata = {
  title: "Browse by skill",
  description:
    "Find co-founders by what they do best — Tech, Product, Design, Business, or Marketing. Curated, updated daily.",
  alternates: { canonical: "/skills", languages: getLanguageAlternates("/skills") },
  openGraph: {
    title: "Browse co-founders by skill",
    description:
      "Find co-founders by what they do best — Tech, Product, Design, Business, or Marketing.",
    url: "/skills",
    type: "website",
  },
};

async function countBySkill() {
  try {
    const { ok, data } = await httpService.post(
      `/search?timestamp=${Date.now()}`,
      { per_page: 1000 },
    );
    if (!ok) return {};
    const counts = Object.fromEntries(SKILLS.map((s) => [s, 0]));
    for (const u of data?.users || []) {
      for (const s of u.skills || []) {
        if (counts[s] !== undefined) counts[s] += 1;
      }
    }
    return counts;
  } catch {
    return {};
  }
}

export default async function SkillsIndex() {
  const counts = await countBySkill();

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Co-founder skills on findyourcofounder",
    inLanguage: "en",
    itemListElement: SKILLS.map((skill, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/skills/${skill.toLowerCase()}`,
      name: `${skill} co-founders`,
    })),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Skills", item: `${SITE_URL}/skills` },
    ],
  };

  return (
    <main className="bg-bg min-h-screen pt-[100px] pb-24 px-6 lg:px-10">
      <JsonLd data={itemListLd} />
      <JsonLd data={breadcrumbLd} />
      <section className="max-w-[1100px] mx-auto">
        <div className="mb-10 max-w-[760px]">
          <div className="font-mono text-[11.5px] tracking-[0.18em] uppercase text-accent mb-4">
            Browse by skill
          </div>
          <h1 className="font-display font-bold text-[48px] lg:text-[64px] leading-[1] tracking-[-0.035em] text-ink m-0">
            Co-founders by{" "}
            <span className="font-serif italic font-normal text-accent">
              what they do
            </span>
            .
          </h1>
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SKILLS.map((skill) => {
            const count = counts[skill] ?? 0;
            return (
              <li key={skill}>
                <Link
                  href={`/skills/${skill.toLowerCase()}`}
                  className="block bg-paper rounded-[22px] border-[1.5px] border-ink shadow-card p-7 hover:shadow-card-lg transition-shadow"
                >
                  <div
                    className={`inline-block text-xs font-medium py-1.5 px-3.5 rounded-full mb-4 ${SKILL_TINT[skill]}`}
                  >
                    {skill}
                  </div>
                  <div className="font-display font-bold text-2xl tracking-tight text-ink">
                    {skill} co-founders
                  </div>
                  <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-muted mt-2">
                    {count} on the index
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>

        <aside className="mt-16 bg-paper rounded-[22px] border-[1.5px] border-ink shadow-card p-8 lg:p-10 text-center">
          <h2 className="font-display font-bold text-[28px] lg:text-[34px] tracking-[-0.02em] text-ink m-0">
            Pick the skill you bring.
          </h2>
          <p className="mt-3 text-base text-ink-2 max-w-[520px] mx-auto leading-relaxed">
            Add your own profile and get matched with founders looking for the
            complementary skill.
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
