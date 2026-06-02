import Link from "next/link";
import { LandingHero } from "@/app/components/landing-hero";
import { TheCompany } from "@/app/components/the-company";
import { HowItWorks } from "@/app/components/how-it-works";
import { Stories } from "@/app/components/stories";
import { CtaBanner } from "@/app/components/cta-banner";
import { httpService } from "@/services/httpService";
import { JsonLd } from "@/app/components/json-ld";
import { getSiteUrl, getLanguageAlternates } from "@/app/utils/constants";

const SITE_URL = getSiteUrl();

const howToLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to find a co-founder on findyourcofounder",
  description:
    "Write a three-question profile, browse the index, and meet founders for coffee.",
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Write your profile",
      text: "Three questions. What motivates you, what kind of partner you want, the dream business you'd build. No buzzwords. Six minutes.",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Browse the index",
      text: "Filter by skills, sector, city, or capital. Read what drives every founder before you ever send a message.",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Meet for coffee",
      text: "Send a note, set a coffee, see if it clicks. We charge nothing to write. The hard part is the conversation.",
    },
  ],
};

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Concept", item: `${SITE_URL}/concept` },
  ],
};

export const metadata = {
  title: "How findyourcofounder works",
  description:
    "Why the index exists, how founders join, and how introductions happen. No intermediaries, no matching algorithms — just a curated list and a direct line.",
  alternates: { canonical: "/concept", languages: getLanguageAlternates("/concept") },
  openGraph: {
    title: "How findyourcofounder works",
    description:
      "Why the index exists, how founders join, and how introductions happen.",
    url: "/concept",
    type: "article",
  },
};

export default async function Concept() {
  const getCount = async () => {
    try {
      const { ok, data } = await httpService.post(`/search?timestamp=${new Date().getTime()}`, { per_page: 1 });
      if (!ok) return 0;
      return data.total || 0;
    } catch {
      return 0;
    }
  };
  const total = await getCount();

  return (
    <>
      <JsonLd data={howToLd} />
      <JsonLd data={breadcrumbLd} />
      <LandingHero founderCount={total} />

      <TheCompany founderCount={total} />

      <HowItWorks />

      <section className="bg-bg px-6 lg:px-10 py-24">
        <div className="max-w-[1320px] mx-auto">
          <div className="max-w-[760px] mb-14">
            <div className="font-mono text-[11.5px] tracking-[0.18em] uppercase text-accent mb-4">
              Beyond the index
            </div>
            <h2 className="font-display font-bold text-[48px] lg:text-[64px] leading-[1.02] tracking-[-0.035em] text-ink m-0">
              Once you&apos;re{" "}
              <span className="font-serif italic font-normal">on it</span>.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <article className="bg-paper rounded-[22px] border-[1.5px] border-ink shadow-card p-8 lg:p-10">
              <div className="font-mono text-[11.5px] tracking-[0.18em] uppercase text-muted mb-4">
                Stay updated
              </div>
              <h3 className="font-display font-bold text-3xl tracking-tight text-ink m-0 mb-4">
                Track who&apos;s reading you.
              </h3>
              <p className="text-[17px] leading-relaxed text-ink-2 m-0">
                With an account, you can see how many people are viewing your profile. Check back often —
                a project that aligns with your skills and needs your expertise might just be around the corner.
              </p>
            </article>

            <article className="bg-ink text-primary-ink rounded-[22px] border-[1.5px] border-ink shadow-card p-8 lg:p-10">
              <div className="font-mono text-[11.5px] tracking-[0.18em] uppercase text-accent-2 mb-4">
                Upcoming features
              </div>
              <h3 className="font-display font-bold text-3xl tracking-tight text-primary-ink m-0 mb-4">
                Ideas? Tell us.
              </h3>
              <p className="text-[17px] leading-relaxed text-primary-ink/75 m-0 mb-6">
                We&apos;re always looking to enhance the platform. If you have suggestions, we&apos;d love to hear them.
              </p>
              <Link
                href="mailto:sebastien@selego.co"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-accent text-accent-ink text-[13.5px] font-semibold hover:bg-accent/90 transition-colors"
              >
                sebastien@selego.co <span className="font-serif italic">→</span>
              </Link>
            </article>
          </div>
        </div>
      </section>

      <Stories />

      <CtaBanner />
    </>
  );
}
