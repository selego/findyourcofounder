"use client";

import { useEffect, useState } from "react";
import { httpService } from "@/services/httpService";

const POPUP_KEY = "fyc-newsletter-popup";
const CONSENT_KEY = "fyc-consent";
const SHOW_DELAY_MS = 15000;

export const NewsletterPopup = () => {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [state, setState] = useState("idle");

  useEffect(() => {
    if (localStorage.getItem(POPUP_KEY)) return;

    let timer;
    const maybeShow = () => {
      if (localStorage.getItem(POPUP_KEY)) return;
      if (!localStorage.getItem(CONSENT_KEY)) return;
      setShow(true);
    };

    timer = setTimeout(maybeShow, SHOW_DELAY_MS);
    const onConsent = () => {
      clearTimeout(timer);
      timer = setTimeout(maybeShow, SHOW_DELAY_MS);
    };
    window.addEventListener("fyc-consent-change", onConsent);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("fyc-consent-change", onConsent);
    };
  }, []);

  const dismiss = () => {
    localStorage.setItem(POPUP_KEY, "dismissed");
    setShow(false);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || state === "submitting") return;
    setState("submitting");
    try {
      const res = await httpService.post("/newsletter/subscribe", { email: email.trim() });
      if (res?.ok) {
        setState("success");
        localStorage.setItem(POPUP_KEY, "subscribed");
        setTimeout(() => setShow(false), 2500);
      } else {
        setState("error");
      }
    } catch {
      setState("error");
    }
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[60] flex justify-center pointer-events-none">
      <div
        role="dialog"
        aria-label="Subscribe to weekly newsletter"
        className="pointer-events-auto relative w-full max-w-[480px] bg-paper border-[1.5px] border-ink shadow-card rounded-[22px] p-6 lg:p-7"
      >
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close"
          className="absolute top-3 right-3 w-8 h-8 grid place-items-center rounded-full text-ink hover:bg-bg-soft transition-colors"
        >
          <span aria-hidden className="text-[20px] leading-none">×</span>
        </button>

        {state === "success" ? (
          <>
            <div className="font-mono text-[11.5px] tracking-[0.18em] uppercase text-muted mb-3">
              Subscribed
            </div>
            <p className="text-ink-2 text-[15px] leading-relaxed">
              Thanks — first issue lands next Tuesday.
            </p>
          </>
        ) : (
          <>
            <div className="font-mono text-[11.5px] tracking-[0.18em] uppercase text-muted mb-3">
              Weekly newsletter
            </div>
            <p className="text-ink-2 text-[15px] leading-relaxed">
              New cofounders, new cities, new builds. One short email every Tuesday.
            </p>
            <form onSubmit={onSubmit} className="mt-5 flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-bg text-ink px-4 py-3 text-[14px] border-[1.5px] border-ink rounded-full focus:outline-none placeholder:text-muted"
              />
              <button
                type="submit"
                disabled={state === "submitting"}
                className="px-5 py-3 rounded-full bg-accent text-accent-ink text-[13.5px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {state === "submitting" ? "…" : "Subscribe"}
              </button>
            </form>
            {state === "error" && (
              <div className="mt-2 text-[12px] text-accent">Couldn&apos;t subscribe — try again.</div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
