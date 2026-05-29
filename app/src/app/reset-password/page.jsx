"use client";

import Link from "next/link";
import { useState } from "react";
import { httpService } from "@/services/httpService";
import { AuthShell } from "@/app/components/auth-shell";

export default function ResetPassword({ searchParams }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hasReset, setHasReset] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { token } = searchParams;

  const resetPassword = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setSubmitting(true);
    try {
      const { ok } = await httpService.post("/forgot_password_reset", { password, token });
      if (!ok) {
        setError("We couldn't reset your password. The link may have expired.");
        setSubmitting(false);
        return;
      }
      setHasReset(true);
    } catch (e) {
      setError("We couldn't reset your password. The link may have expired.");
    }
    setSubmitting(false);
  };

  if (hasReset) {
    return (
      <AuthShell
        side="reset"
        kicker="All set"
        title={
          <>
            Password{" "}
            <span className="font-serif italic font-normal text-accent">updated.</span>
          </>
        }
        footer={
          <Link
            href="/signin"
            className="text-ink font-medium underline underline-offset-4 decoration-accent decoration-2"
          >
            Sign in
          </Link>
        }
      >
        <p className="text-ink-2 leading-relaxed">
          You can sign in with your new password now.
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
          Pick a new{" "}
          <span className="font-serif italic font-normal text-accent">password.</span>
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
      <form className="space-y-5" onSubmit={resetPassword}>
        <FieldShell label="New password">
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
          />
        </FieldShell>

        <FieldShell label="Confirm new password">
          <input
            type="password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
          />
        </FieldShell>

        <button
          type="submit"
          disabled={submitting || !password || !confirmPassword}
          className="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-ink text-primary-ink text-base font-semibold hover:bg-ink-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full justify-center"
        >
          {submitting ? "Updating…" : "Reset password"}{" "}
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
