"use client";

import { useEffect } from "react";
import Link from "next/link";
import * as Sentry from "@sentry/nextjs";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <main className="bg-bg min-h-screen pt-[140px] pb-24 px-6 lg:px-10">
      <div className="max-w-[680px] mx-auto text-center">
        <div className="font-mono text-[11.5px] tracking-[0.18em] uppercase text-accent mb-4">
          Something broke
        </div>
        <h1 className="font-display font-bold text-[48px] lg:text-[60px] leading-[1.02] tracking-[-0.035em] text-ink m-0">
          We&apos;ve been{" "}
          <span className="font-serif italic font-normal text-accent">notified</span>.
        </h1>
        <p className="mt-6 text-lg text-ink-2 font-serif italic">
          Try again, or head back to the index.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-ink text-primary-ink text-[13.5px] font-semibold hover:bg-ink/90 transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-paper border-[1.5px] border-ink text-ink text-[13.5px] font-semibold hover:bg-bg-soft transition-colors"
          >
            Browse the index
          </Link>
        </div>
      </div>
    </main>
  );
}
