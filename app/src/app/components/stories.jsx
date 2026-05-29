// Testimonial section — "What the index sounds like." Three quote cards.
// First card is the dark variant (bg-ink), other two are paper with a
// Humaaans avatar circle. Copy mirrors the reference design — swap to live
// quotes once we have permission from real founders.

import { HmnSpectacles, HmnBuzz, HmnWave } from "./humaaans/avatars";
import { getHumaaansPalette } from "./humaaans/palette";

const QUOTES = [
  {
    variant: "dark",
    body:
      "I've been a data and AI builder my whole career. Started my first company, grew it, and sold it. I see systems where others see chaos.",
    author: "Erwin Berkouwer",
    meta: "Business · Tech · Product · Utrecht",
    Avatar: HmnSpectacles,
    color: "mint",
  },
  {
    variant: "paper",
    body:
      "The wellness industry is worth billions and most of it is noise. What motivates me is being the person who cuts through it, backed by 8 years of pharmaceutical standards.",
    author: "Marjan Razzaqee",
    meta: "Business · Marketing · Amsterdam",
    Avatar: HmnBuzz,
    color: "rose",
  },
  {
    variant: "paper",
    body:
      "I love to help people make evidence-based decisions in business. I love seeing the fruits of such collaborations when real people enjoy what we've made.",
    author: "Anton Hrabov",
    meta: "Product · Design · Marketing · Den Haag",
    Avatar: HmnWave,
    color: "violet",
  },
];

export function Stories() {
  return (
    <section id="stories" className="bg-bg-soft px-10 py-24">
      <div className="max-w-[1320px] mx-auto">
        <div className="max-w-[760px] mb-12">
          <div className="font-mono text-[11.5px] tracking-[0.18em] uppercase text-muted mb-4">
            So these are humans
          </div>
          <h2 className="font-display font-bold text-[48px] lg:text-[64px] leading-[1.02] tracking-[-0.035em] text-ink m-0">
            What the index{" "}
            <span className="font-serif italic font-normal">sounds</span> like.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {QUOTES.map((q) => (
            <QuoteCard key={q.author} {...q} />
          ))}
        </div>
      </div>
    </section>
  );
}

function QuoteCard({ variant, body, author, meta, Avatar, color }) {
  const palette = getHumaaansPalette(color);
  const isDark = variant === "dark";

  return (
    <article
      className={[
        "rounded-[22px] border-[1.5px] border-ink shadow-card p-7 flex flex-col gap-6",
        isDark ? "bg-ink text-primary-ink" : "bg-paper text-ink",
      ].join(" ")}
    >
      <div
        className={`font-serif italic text-3xl leading-none ${
          isDark ? "text-accent-2" : "text-accent"
        }`}
        aria-hidden="true"
      >
        &ldquo;
      </div>

      <p
        className={`text-[15px] leading-relaxed flex-1 ${
          isDark ? "text-primary-ink/85" : "text-ink-2"
        }`}
      >
        {body}
      </p>

      <div className="flex items-center gap-3 pt-2">
        <div
          className={`w-10 h-10 rounded-full overflow-hidden grid place-items-end shrink-0 ${
            isDark ? "bg-mint" : `bg-${color}`
          }`}
        >
          <Avatar size={40} palette={palette} />
        </div>
        <div className="min-w-0">
          <div
            className={`font-display font-bold text-sm tracking-tight truncate ${
              isDark ? "text-primary-ink" : "text-ink"
            }`}
          >
            {author}
          </div>
          <div
            className={`font-mono text-[10.5px] tracking-[0.14em] uppercase truncate ${
              isDark ? "text-primary-ink/55" : "text-muted"
            }`}
          >
            {meta}
          </div>
        </div>
      </div>
    </article>
  );
}
