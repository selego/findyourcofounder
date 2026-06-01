"use client";

// Client-side pieces of the founder profile page:
//   • <ProfileClickPing /> — fire-and-forget bump of the click counter on mount.
//     Previously this lived in the (now-removed) card modal; the equivalent
//     user action is now "opened the full profile page."
//   • <CoffeeBlock />     — the "Send a coffee" dark section, including the
//     openers (left column) and the textarea (right column). Single client
//     component so an opener click can populate the textarea state. The send
//     handler is a toast for now — wire to a real /messages endpoint when it
//     ships.

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { httpService } from "@/services/httpService";

export function ProfileClickPing({ user }) {
  useEffect(() => {
    if (!user?._id) return;
    httpService
      .put(`/${user._id}`, { clicks: (user.clicks ?? 0) + 1 })
      .catch(() => {});
    if (typeof window !== "undefined") {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "profile_view",
        profile_id: user._id,
        profile_slug: user.slug,
        profile_skill: user.skills?.[0],
        profile_city: user.city,
      });
    }
  }, [user?._id]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

const MAX = 600;

export function CoffeeBlock({ name, intro, openers }) {
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSend = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      toast.success(
        "Direct messaging is coming soon — your note will reach them then."
      );
      setSubmitting(false);
    }, 250);
  };

  return (
    <section className="mt-16 bg-ink rounded-[22px] border-[1.5px] border-ink shadow-card text-primary-ink p-8 lg:p-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
        {/* Left — copy + opener suggestions */}
        <div>
          <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-accent mb-4">
            Reach out
          </div>
          <h2 className="font-display font-bold text-[40px] lg:text-[56px] leading-[1.02] tracking-[-0.035em] text-primary-ink m-0">
            Send {name} a{" "}
            <span className="font-serif italic font-normal text-accent">
              coffee
            </span>
            .
          </h2>
          <p className="mt-5 text-[14.5px] leading-relaxed text-primary-ink/70">
            {intro}
          </p>

          {openers?.length > 0 && (
            <>
              <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-primary-ink/55 mt-8 mb-3">
                Try one of these openers
              </div>
              <ul className="flex flex-col gap-2">
                {openers.map((o, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => setNote(o)}
                      className="w-full text-left text-[13px] text-primary-ink/80 bg-primary-ink/5 hover:bg-primary-ink/10 border border-primary-ink/15 rounded-xl px-3.5 py-2.5 transition-colors"
                    >
                      {o}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* Right — textarea form */}
        <form onSubmit={handleSend} className="flex flex-col">
          <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-primary-ink/55 mb-3">
            Your note
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, MAX))}
            placeholder={`Hi ${name || "there"} — I read your profile and…`}
            rows={9}
            className="w-full bg-primary-ink/5 text-primary-ink placeholder:text-primary-ink/35 border border-primary-ink/15 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-accent transition-colors resize-none flex-1 min-h-[220px]"
          />
          <div className="mt-4 flex items-center justify-between gap-4">
            <span className="font-mono text-[11px] tracking-[0.12em] text-primary-ink/45">
              {note.length} / {MAX}
            </span>
            <button
              type="submit"
              disabled={submitting || !note.trim()}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-accent-2 text-ink text-sm font-semibold hover:bg-accent-2/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? "Sending…" : "Send the note"}{" "}
              <span className="font-serif italic">↗</span>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
