import Link from "next/link";

export const metadata = {
  title: "Page not found",
  description: "That page isn't on findyourcofounder. Browse the index or read the concept.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main className="bg-bg min-h-screen pt-[140px] pb-24 px-6 lg:px-10">
      <div className="max-w-[760px] mx-auto text-center">
        <div className="font-mono text-[11.5px] tracking-[0.18em] uppercase text-accent mb-4">
          404 · not found
        </div>
        <h1 className="font-display font-bold text-[56px] lg:text-[72px] leading-[1] tracking-[-0.035em] text-ink m-0">
          That page{" "}
          <span className="font-serif italic font-normal text-accent">
            isn&apos;t on the index
          </span>
          .
        </h1>
        <p className="mt-6 text-lg text-ink-2 font-serif italic">
          You might find what you&apos;re looking for in one of these places.
        </p>
        <ul className="mt-10 flex flex-wrap justify-center gap-3">
          <li>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-ink text-primary-ink text-[13.5px] font-semibold hover:bg-ink/90 transition-colors"
            >
              Browse the index
            </Link>
          </li>
          <li>
            <Link
              href="/concept"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-paper border-[1.5px] border-ink text-ink text-[13.5px] font-semibold hover:bg-bg-soft transition-colors"
            >
              Read the concept
            </Link>
          </li>
          <li>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-accent text-accent-ink text-[13.5px] font-semibold hover:bg-accent/90 transition-colors"
            >
              Join free
            </Link>
          </li>
        </ul>
      </div>
    </main>
  );
}
