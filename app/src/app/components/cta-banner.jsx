// Full-bleed orange CTA banner that sits between the testimonials and the
// footer. Pushes guests to /signup.

import Link from "next/link";

export function CtaBanner() {
  return (
    <section className="relative bg-accent text-ink px-10 py-24 overflow-hidden">
      <div className="max-w-[920px] mx-auto text-center">
        <h2 className="font-display font-bold text-[56px] lg:text-[80px] leading-[1] tracking-[-0.04em] text-ink m-0">
          Your future cofounder<br />
          is reading this{" "}
          <span className="font-serif italic font-normal">too</span>
          .
        </h2>

        <p className="mt-7 max-w-[540px] mx-auto text-[15px] leading-relaxed text-ink/80">
          The index is free. The serious people are on it. Spend ten minutes
          writing the truth about what you&apos;d build, and let the right
          partner find you.
        </p>

        <Link
          href="/signup"
          className="mt-10 inline-flex items-center gap-2.5 px-7 py-4 rounded-full bg-ink text-primary-ink text-base font-semibold hover:bg-ink-2 transition-colors"
        >
          Add yourself to the index <span className="font-serif italic">→</span>
        </Link>
      </div>

      {/* Decorative dot in the bottom-right corner */}
      <div className="absolute bottom-12 right-12 w-3 h-3 rounded-full bg-ink hidden md:block" />
    </section>
  );
}
