"use client";

import Link from "next/link";
import { useState } from "react";
import { httpService } from "@/services/httpService";
import { AuthShell } from "@/app/components/auth-shell";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [hasSent, setHasSent] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const sendResetLink = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const { ok } = await httpService.post("/forgot_password", { email });
      if (!ok) {
        setError("We couldn't send the reset link. Try again.");
        setSubmitting(false);
        return;
      }
      setHasSent(true);
    } catch (e) {
      setError("We couldn't send the reset link. Try again.");
    }
    setSubmitting(false);
  };

  if (hasSent) {
    return (
      <AuthShell
        side="reset"
        kicker="Check your inbox"
        title={
          <>
            Link <span className="font-serif italic font-normal text-accent">sent.</span>
          </>
        }
        footer={
          <Link
            href="/signin"
            className="text-ink font-medium underline underline-offset-4 decoration-accent decoration-2"
          >
            Back to sign in
          </Link>
        }
      >
        <p className="text-ink-2 leading-relaxed">
          We&apos;ve emailed you a reset link. It may take a minute — check your spam folder if you don&apos;t see it.
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      side="reset"
      kicker="Reset password"
      title={
        <>
          Forgot your{" "}
          <span className="font-serif italic font-normal text-accent">password?</span>
        </>
      }
      footer={
        <Link
          href="/signin"
          className="text-muted hover:text-ink transition-colors"
        >
          Back to sign in
        </Link>
      }
    >
      <form className="space-y-5" onSubmit={sendResetLink}>
        <FieldShell label="Email">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@domain.com"
            autoComplete="email"
          />
        </FieldShell>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-ink text-primary-ink text-base font-semibold hover:bg-ink-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full justify-center"
        >
          {submitting ? "Sending…" : "Send reset link"}{" "}
          {!submitting && <span className="font-serif italic">→</span>}
        </button>

        {error && <p className="text-sm text-red-500">{error}</p>}
      </form>
    </AuthShell>
  );
}

function FieldShell({ label, children }) {
  return (
    <div>
      <label className="block font-mono text-[11.5px] tracking-[0.18em] uppercase text-muted mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}
