import Link from "next/link";

export const metadata = {
  title: "City not found",
  description: "No founders on findyourcofounder match that city yet — browse all cities or the full index.",
  robots: { index: false, follow: true },
};

export default function CityNotFound() {
  return (
    <main className="bg-bg min-h-screen pt-[140px] pb-24 px-6 lg:px-10">
      <div className="max-w-[760px] mx-auto text-center">
        <div className="font-mono text-[11.5px] tracking-[0.18em] uppercase text-accent mb-4">
          No founders there yet
        </div>
        <h1 className="font-display font-bold text-[48px] lg:text-[64px] leading-[1.02] tracking-[-0.035em] text-ink m-0">
          That city is{" "}
          <span className="font-serif italic font-normal text-accent">empty for now</span>
          .
        </h1>
        <p className="mt-6 text-lg text-ink-2 font-serif italic">
          Nobody on the index has listed that city yet — you could be the first.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            href="/cities"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-ink text-primary-ink text-[13.5px] font-semibold hover:bg-ink/90 transition-colors"
          >
            All cities on the index
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-accent text-accent-ink text-[13.5px] font-semibold hover:bg-accent/90 transition-colors"
          >
            Add your profile
          </Link>
        </div>
      </div>
    </main>
  );
}
