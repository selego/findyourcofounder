import { notFound } from "next/navigation";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa6";
import { Card } from "@/app/components/card";
import { JsonLd } from "@/app/components/json-ld";
import { httpService } from "@/services/httpService";
import { SKILL_TINT, getSiteUrl, getLanguageAlternates } from "@/app/utils/constants";
import { PaginationWrapper } from "@/app/components/ui/pagination";
import { SkillHubPing } from "./skill-hub-ping";

const SITE_URL = getSiteUrl();
const VALID_SKILLS = Object.keys(SKILL_TINT);
const PER_PAGE = 16;

// Per-skill context line that gives each hub unique editorial copy
// (helps lift the page above the "thin content" threshold).
const SKILL_CONTEXT = {
  Tech: "Engineering co-founders who can build the product — backend systems, infrastructure, the technical foundation a startup actually runs on.",
  Product: "Product-minded co-founders who decide what to build, talk to users, and shape every detail of the experience.",
  Design: "Design co-founders shaping how the product looks, feels, and earns trust — from brand to interface.",
  Business: "Business co-founders driving sales, operations, partnerships, fundraising — the side of the company that isn't code.",
  Marketing: "Marketing co-founders telling the story, finding the audience, and turning early traction into growth.",
};

function matchSkill(param) {
  const lowered = param.toLowerCase();
  return VALID_SKILLS.find((s) => s.toLowerCase() === lowered) || null;
}

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
  const skill = matchSkill(params.skill);
  if (!skill) return { title: "Skill not found", robots: { index: false, follow: true } };
  const title = `${skill} co-founders`;
  const description = `Browse founders skilled in ${skill} who are open to meeting a co-founder. Updated daily on findyourcofounder.`;
  const path = `/skills/${skill.toLowerCase()}`;
  return {
    title,
    description,
    alternates: { canonical: path, languages: getLanguageAlternates(path) },
    openGraph: { title, description, url: path, type: "website" },
  };
}

export default async function SkillHub({ params, searchParams }) {
  const skill = matchSkill(params.skill);
  if (!skill) notFound();

  const all = await fetchFounders();
  const matching = all.filter((u) => (u.skills || []).includes(skill));
  const currentPage = parseInt(searchParams.page) || 1;
  const start = (currentPage - 1) * PER_PAGE;
  const users = matching.slice(start, start + PER_PAGE);

  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${skill} co-founders on findyourcofounder`,
    url: `${SITE_URL}/skills/${skill.toLowerCase()}`,
    inLanguage: "en",
    keywords: [
      `${skill.toLowerCase()} co-founder`,
      `${skill.toLowerCase()} founder`,
      "find a co-founder",
      "startup co-founder",
    ],
    about: { "@type": "Thing", name: `${skill} co-founders` },
    isPartOf: { "@type": "WebSite", name: "findyourcofounder", url: SITE_URL },
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
      { "@type": "ListItem", position: 2, name: "Skills", item: `${SITE_URL}/skills` },
      { "@type": "ListItem", position: 3, name: skill, item: `${SITE_URL}/skills/${skill.toLowerCase()}` },
    ],
  };

  return (
    <main className="bg-bg min-h-screen pt-[100px] pb-24 px-6 lg:px-10">
      <JsonLd data={collectionLd} />
      <JsonLd data={breadcrumbLd} />
      <SkillHubPing skill={skill} count={matching.length} />
      <section className="max-w-[1320px] mx-auto">
        <Link
          href="/skills"
          className="inline-flex items-center gap-2 font-mono text-[11.5px] tracking-[0.18em] uppercase text-muted hover:text-ink transition-colors mb-6 group"
        >
          <FaArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
          All skills
        </Link>
        <div className="mb-10 max-w-[860px]">
          <div className="font-mono text-[11.5px] tracking-[0.18em] uppercase text-accent mb-4">
            {skill} · {matching.length} founders
          </div>
          <h1 className="font-display font-bold text-[48px] lg:text-[64px] leading-[1] tracking-[-0.035em] text-ink m-0">
            {skill}{" "}
            <span className="font-serif italic font-normal text-accent">
              co-founders
            </span>
          </h1>
          <p className="mt-5 text-lg text-ink-2 leading-relaxed">
            {matching.length} founder{matching.length === 1 ? "" : "s"} with{" "}
            {skill.toLowerCase()} as a core strength, all open to meeting a co-founder
            right now. Read what motivates them, the kind of partner they want, and
            the business they&apos;d build — then reach out directly.
          </p>
          <p className="mt-3 text-base text-muted leading-relaxed">
            {SKILL_CONTEXT[skill]}
          </p>
        </div>

        {users.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
            {users.map((u, i) => (
              <Card user={u} idx={start + i} key={u._id || u.slug} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted mt-8 font-serif italic text-lg">
            No {skill.toLowerCase()} founders on the index yet — check back soon.
          </p>
        )}

        <div className="mt-14">
          <PaginationWrapper
            currentPage={currentPage}
            totalItems={matching.length}
            itemsPerPage={PER_PAGE}
          />
        </div>

        <aside className="mt-20 bg-paper rounded-[22px] border-[1.5px] border-ink shadow-card p-8 lg:p-10 text-center">
          <div className="font-mono text-[11.5px] tracking-[0.18em] uppercase text-accent mb-3">
            Don&apos;t see your match?
          </div>
          <h2 className="font-display font-bold text-[28px] lg:text-[34px] tracking-[-0.02em] text-ink m-0">
            Add yourself to the index.
          </h2>
          <p className="mt-3 text-base text-ink-2 max-w-[520px] mx-auto leading-relaxed">
            Three questions, six minutes. Free. The next {skill.toLowerCase()} co-founder
            looking for someone like you sees your profile the day after you join.
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
