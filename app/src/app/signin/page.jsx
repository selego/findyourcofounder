"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { AuthShell } from "@/app/components/auth-shell";

export default function SignInPage() {
  const router = useRouter();
  const { status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === "authenticated") router.replace("/profile");
  }, [status, router]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await signIn("credentials", {
      email,
      password,
      redirect: true,
      callbackUrl: "/profile",
    });
    setSubmitting(false);
  };

  return (
    <AuthShell
      side="signin"
      kicker="Sign in"
      title={
        <>
          Welcome <span className="font-serif italic font-normal text-accent">back.</span>
        </>
      }
      footer={
        <div className="flex items-center justify-between flex-wrap gap-3">
          <span>
            New here?{" "}
            <Link href="/signup" className="text-ink font-medium underline underline-offset-4 decoration-accent decoration-2">
              Create your card
            </Link>
          </span>
          <Link href="/forgot-password" className="text-muted hover:text-ink transition-colors">
            Forgot password?
          </Link>
        </div>
      }
    >
      <form className="space-y-5" onSubmit={onSubmit}>
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

        <FieldShell label="Password">
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </FieldShell>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-ink text-primary-ink text-base font-semibold hover:bg-ink-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full justify-center"
        >
          {submitting ? "Signing in…" : "Sign in"}{" "}
          {!submitting && <span className="font-serif italic">→</span>}
        </button>
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
