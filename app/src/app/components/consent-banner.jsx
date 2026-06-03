"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const CONSENT_KEY = "fyc-consent";
const CONSENT_EVENT = "fyc-consent-change";

export const ConsentBanner = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(CONSENT_KEY)) setShow(true);
  }, []);

  const choose = (value) => {
    localStorage.setItem(CONSENT_KEY, value);
    window.dispatchEvent(new Event(CONSENT_EVENT));
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[70] flex justify-center pointer-events-none">
      <div
        role="dialog"
        aria-label="Cookie consent"
        className="pointer-events-auto w-full max-w-[640px] bg-paper border-[1.5px] border-ink shadow-card rounded-[22px] p-6 lg:p-7"
      >
        <div className="font-mono text-[11.5px] tracking-[0.18em] uppercase text-muted mb-3">
          Privacy
        </div>
        <p className="text-ink-2 text-[15px] leading-relaxed">
          We use{" "}
          <span className="font-serif italic text-accent">Hotjar</span>{" "}
          to understand how people use the site. No personal data is sold. See our{" "}
          <Link href="/gdpr" className="underline decoration-accent underline-offset-4 text-ink hover:text-accent transition-colors">
            privacy notice
          </Link>
          .
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => choose("accepted")}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-ink text-primary-ink text-[13.5px] font-semibold hover:bg-ink-2 transition-colors"
          >
            Accept
          </button>
          <button
            type="button"
            onClick={() => choose("declined")}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-transparent text-ink text-[13.5px] font-medium border-[1.5px] border-ink hover:bg-ink hover:text-primary-ink transition-colors"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
};
