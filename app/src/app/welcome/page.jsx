"use client";

import Link from "next/link";
import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

import { httpService } from "@/services/httpService";

const buildMessage = (link) =>
  `Hey — just joined findyourcofounder.nl, a small Dutch index for founders looking for a cofounder. Worth 3 minutes if you're solo: ${link}`;

export default function WelcomePage() {
  const { data: session, status } = useSession();

  if (status && !["authenticated", "loading"].includes(status)) return redirect("/signin");
  if (status === "loading" || !session?.user) {
    return <main className="bg-bg min-h-screen pt-[112px] px-6 lg:px-10" />;
  }

  const userId = session?.user?._id;
  const firstName = session?.user?.first_name;
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const shareLink = userId ? `${origin}/signup?ref=${userId}` : "";
  const shareMessage = buildMessage(shareLink);

  const trackInviteSent = async () => {
    if (!userId) return;
    await httpService.post(`/${userId}/invite-sent`);
    if (typeof window !== "undefined") {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: "invite_sent", inviter: userId });
    }
  };

  const copyLink = async () => {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      toast.success("Link copied.");
      trackInviteSent();
    } catch {
      toast.error("Couldn't copy. Select the message and copy manually.");
    }
  };

  const copyMessage = async () => {
    if (!shareMessage) return;
    try {
      await navigator.clipboard.writeText(shareMessage);
      toast.success("Message copied.");
      trackInviteSent();
    } catch {
      toast.error("Couldn't copy. Select the message and copy manually.");
    }
  };

  return (
    <main className="bg-bg min-h-screen pt-[112px] pb-24 px-6 lg:px-10">
      <div className="max-w-[640px] mx-auto">
        <div className="font-mono text-[11.5px] tracking-[0.18em] uppercase text-muted mb-3">
          You're in
        </div>
        <h1 className="font-display font-bold text-5xl lg:text-6xl tracking-tight text-ink leading-[1.02]">
          Hey {firstName},{" "}
          <span className="font-serif italic font-normal text-accent">welcome.</span>
        </h1>
        <p className="text-ink-2 text-base leading-relaxed mt-6 max-w-[520px]">
          Your card is live in the index. One more thing — the matching only gets real
          if the right founders are on it. Share with one person you'd trust to build
          something.
        </p>

        <article className="mt-10 bg-paper rounded-[22px] border-[1.5px] border-ink shadow-card p-7 lg:p-8 space-y-5">
          <div className="font-mono text-[11.5px] tracking-[0.18em] uppercase text-muted">
            Your share message
          </div>
          <textarea
            value={shareMessage}
            readOnly
            rows={4}
            className="w-full bg-bg-soft text-ink border border-rule rounded-xl px-4 py-3.5 text-sm leading-relaxed resize-none focus:outline-none focus:border-ink"
          />
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={copyLink}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-ink text-primary-ink text-sm font-semibold hover:bg-ink-2 transition-colors"
            >
              Copy share link <span className="font-serif italic">→</span>
            </button>
            <button
              type="button"
              onClick={copyMessage}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border-[1.5px] border-ink text-ink text-sm font-medium hover:bg-ink hover:text-primary-ink transition-colors"
            >
              Copy full message
            </button>
          </div>
        </article>

        <div className="mt-10">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink transition-colors group"
          >
            Continue to your profile{" "}
            <span className="font-serif italic group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
