"use client";

import { useState } from "react";
import { httpService } from "@/services/httpService";

export function NewsletterFooter() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState("idle");

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || state === "submitting") return;
    setState("submitting");
    try {
      const res = await httpService.post("/newsletter/subscribe", { email: email.trim() });
      if (res?.ok) {
        setState("success");
        setEmail("");
      } else {
        setState("error");
      }
    } catch {
      setState("error");
    }
  };

  if (state === "success") {
    return (
      <div className="mt-6 text-[13px] leading-relaxed text-primary-ink/70">
        Thanks — first issue lands next Tuesday.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-2 max-w-[320px]">
      <label
        htmlFor="newsletter-email"
        className="font-mono text-[11px] tracking-[0.18em] uppercase text-primary-ink/45"
      >
        Weekly cofounder updates
      </label>
      <div className="flex gap-2">
        <input
          id="newsletter-email"
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 bg-bg text-ink px-3 py-2 text-[13px] border-2 border-primary-ink/20 focus:outline-none focus:border-primary-ink placeholder:text-muted"
        />
        <button
          type="submit"
          disabled={state === "submitting"}
          className="bg-accent text-accent-ink font-display text-[13px] font-bold px-4 py-2 border-2 border-ink shadow-card-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none disabled:opacity-50"
        >
          {state === "submitting" ? "…" : "Subscribe"}
        </button>
      </div>
      {state === "error" && (
        <div className="text-[12px] text-accent-2">Couldn&apos;t subscribe — try again.</div>
      )}
    </form>
  );
}
