import Link from "next/link";

export const metadata = {
  title: "Founder not found",
  description: "That founder isn't in the index — browse all founders instead.",
  robots: { index: false, follow: true },
};

export default function ContactNotFound() {
  return (
    <main className="bg-bg min-h-screen pt-[140px] pb-24 px-6 lg:px-10">
      <div className="max-w-[760px] mx-auto text-center">
        <div className="font-mono text-[11.5px] tracking-[0.18em] uppercase text-accent mb-4">
          Not on the index
        </div>
        <h1 className="font-display font-bold text-[48px] lg:text-[64px] leading-[1.02] tracking-[-0.035em] text-ink m-0">
          That founder{" "}
          <span className="font-serif italic font-normal text-accent">
            isn&apos;t here
          </span>
          .
        </h1>
        <p className="mt-6 text-lg text-ink-2 font-serif italic">
          The card may have been removed, or the link is slightly off.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-ink text-primary-ink text-[13.5px] font-semibold hover:bg-ink/90 transition-colors"
          >
            Browse all founders
          </Link>
        </div>
      </div>
    </main>
  );
}
