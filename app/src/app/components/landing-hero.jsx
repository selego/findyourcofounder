// Landing hero — headline, dual CTA, Humaaans HeroDuo on the right.
// Server component (no hooks). Pure presentational.

import Link from "next/link";
import { HeroDuo } from "./humaaans/scenes";
import { HUMAAANS_PALETTE } from "./humaaans/palette";

export function LandingHero({ founderCount = 229 }) {
  return (
    <section id="top" className="relative pt-[140px] pb-20 px-10 bg-bg overflow-hidden">
      <div className="max-w-[1320px] mx-auto grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-paper border border-rule mb-6 font-mono text-[11.5px] tracking-wider uppercase text-ink-2">
            <span className="w-2 h-2 rounded-full bg-accent" />
            {founderCount} founders · 6 countries · live now
          </div>

          <h1 className="font-display font-bold text-[64px] sm:text-[80px] lg:text-[96px] leading-[0.95] tracking-[-0.045em] text-ink m-0">
            Find the<br />
            person you&apos;d<br />
            build it{" "}
            <span className="relative inline-block">
              <span className="font-serif italic font-normal text-accent">with</span>
              <svg
                viewBox="0 0 220 24"
                className="absolute left-[-6px] -bottom-4 w-[108%] h-[18px]"
                aria-hidden="true"
              >
                <path d="M4 14 Q 110 0 216 14" stroke="#ff5a36" strokeWidth="4" fill="none" strokeLinecap="round" />
              </svg>
            </span>
            .
          </h1>

          <p className="font-sans text-[19px] leading-relaxed text-ink-2 max-w-[540px] mt-9">
            A small, no-bullshit index of founders looking for a cofounder. Real names, real budgets, real motivations. Skip the LinkedIn small talk — meet someone you&apos;d actually build a company with.
          </p>

          <div className="flex flex-wrap gap-3.5 mt-9">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 px-7 py-4 rounded-full bg-ink text-primary-ink font-semibold text-base hover:bg-ink-2 transition-colors shadow-[0_8px_24px_rgba(14,20,16,0.18)]"
            >
              Browse the index <span className="font-serif italic">→</span>
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2.5 px-7 py-4 rounded-full bg-transparent text-ink font-medium text-base border-[1.5px] border-ink hover:bg-ink hover:text-primary-ink transition-colors"
            >
              Add your profile
            </Link>
          </div>

          <div className="flex items-center gap-4 mt-9 text-sm text-muted">
            <div className="flex">
              {["salmon", "violet", "mustard", "mint"].map((c, i) => (
                <span
                  key={c}
                  className="w-[30px] h-[30px] rounded-full border-2 border-bg"
                  style={{
                    background: HUMAAANS_PALETTE[c].clothes,
                    marginLeft: i === 0 ? 0 : -10,
                  }}
                />
              ))}
            </div>
            <span>+225 founders joined in the last 90 days</span>
          </div>
        </div>

        <div className="relative min-h-[420px] lg:min-h-[520px]">
          <HeroDuo width="100%" height={560} />
        </div>
      </div>

      {/* Cities marquee */}
      <div className="mt-[60px] -mx-10 py-4 border-t border-b border-rule overflow-hidden whitespace-nowrap">
        <div className="inline-block animate-fyc-marquee">
          <CitiesRow />
          <CitiesRow />
        </div>
      </div>
    </section>
  );
}

function CitiesRow() {
  const cities = [
    "Amsterdam",
    "Rotterdam",
    "Utrecht",
    "Den Haag",
    "Leiden",
    "Eindhoven",
    "Arnhem",
    "Almere",
  ];
  return (
    <span className="font-display font-semibold text-[22px] tracking-tight text-ink">
      {cities.map((c, i) => (
        <span key={c} className="inline-flex items-center">
          <span className="mr-6">{c}</span>
          <span
            className={`mr-6 ${
              i === cities.length - 1 ? "" : "font-serif italic text-accent"
            }`}
          >
            ·
          </span>
        </span>
      ))}
    </span>
  );
}
