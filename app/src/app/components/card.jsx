"use client";

// FYC founder card — paper front with Humaaans avatar, ink back with
// motivation quote. Hover flips the card; clicking navigates directly to
// /contact/[slug] (the full profile page handles the click-counter bump).
//
// Data shape comes from the existing backend: { _id, first_name, last_name,
// city, skills, motivations, partner, business, invest, clicks, slug, linkedin }.

import { useState } from "react";
import Link from "next/link";
import { FaLinkedin } from "react-icons/fa6";
import { FYCAvatar, tintForKey, AVATAR_KIND_KEYS } from "./humaaans";
import { SKILL_TINT } from "@/app/utils/constants";

function avatarKindFor(key = "") {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 17 + key.charCodeAt(i)) | 0;
  return AVATAR_KIND_KEYS[Math.abs(hash) % AVATAR_KIND_KEYS.length];
}

// Tailwind color name (for the bg behind the avatar on the card front).
const TINT_BG = {
  salmon: "bg-salmon",
  violet: "bg-violet",
  mustard: "bg-mustard",
  rose: "bg-rose",
  mint: "bg-mint",
  cobalt: "bg-cobalt",
};

function formatInvestment(n) {
  if (!n || n <= 0) return "€0";
  if (n >= 1000) return `€${Math.round(n / 1000)}k`;
  return `€${n}`;
}

export const Card = ({ user, idx = 0 }) => {
  const [flipped, setFlipped] = useState(false);
  const key = user._id || user.slug || `${user.first_name}-${user.last_name}`;
  const tint = tintForKey(key);
  const kind = avatarKindFor(key);
  const fullName = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim();
  const motivation = user.motivations || user.motivation || "";

  return (
    <div
      className="group relative w-[320px] max-w-[90vw] h-[440px] cursor-pointer"
      style={{ perspective: 1400 }}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
    >
      <div
        className="relative w-full h-full transition-transform duration-[1000ms]"
        style={{
          transformStyle: "preserve-3d",
          transitionTimingFunction: "cubic-bezier(.2,.8,.2,1)",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* ── FRONT ────────────────────────────────────────────────── */}
        <div
          className={[
            "absolute inset-0 rounded-[22px] bg-paper border-[1.5px] border-ink overflow-hidden flex flex-col",
            flipped ? "shadow-none" : "shadow-card",
            "transition-shadow duration-300",
          ].join(" ")}
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
        >
          <div className="flex justify-between items-center px-5 py-4 border-b-[1.5px] border-ink font-mono text-[11px] tracking-[0.1em] uppercase text-ink">
            <span>№ {String(idx + 1).padStart(3, "0")}</span>
            <span className="truncate max-w-[60%]">{user.city}</span>
          </div>

          <div className={`relative flex-1 px-6 pt-5 flex justify-center items-end overflow-hidden ${TINT_BG[tint]}`}>
            <FYCAvatar kind={kind} color={tint} size={150} />
            {typeof user.clicks === "number" && (
              <div className="absolute top-4 left-5 font-mono text-[11px] tracking-[0.1em] uppercase text-ink">
                {user.clicks} clicks
              </div>
            )}
            {user.linkedin && (
              <Link
                href={user.linkedin}
                target="_blank"
                onClick={(e) => e.stopPropagation()}
                className="absolute top-3 right-4 z-20 text-ink hover:text-linkedIn transition-colors"
                aria-label="LinkedIn"
              >
                <FaLinkedin size={18} />
              </Link>
            )}
          </div>

          <div className="px-5 py-4 border-t-[1.5px] border-ink bg-paper">
            <div className="font-display font-bold text-[22px] tracking-tight text-ink mb-1.5 truncate">
              {fullName || "Anonymous"}
            </div>
            <div className="flex gap-1.5 flex-wrap items-center">
              {user.skills?.slice(0, 3).map((skill) => (
                <span
                  key={skill}
                  className={`text-[11.5px] font-medium px-2.5 py-1 rounded-full ${
                    SKILL_TINT[skill] || "bg-bg-soft text-ink-2 border border-rule"
                  }`}
                >
                  {skill}
                </span>
              ))}
              <span className="ml-auto font-mono text-[11px] text-muted">
                {formatInvestment(user.invest)}
              </span>
            </div>
          </div>
        </div>

        {/* ── BACK ─────────────────────────────────────────────────── */}
        <div
          className="absolute inset-0 rounded-[22px] bg-ink text-primary-ink p-6 flex flex-col gap-4 shadow-card"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="flex justify-between items-center font-mono text-[11px] tracking-[0.1em] uppercase text-accent-2">
            <span>What motivates them</span>
            <span className="truncate max-w-[50%]">{user.city}</span>
          </div>

          <p className="font-serif italic text-[22px] leading-snug flex-1 text-primary-ink line-clamp-[7]">
            &ldquo;{motivation.length > 200 ? `${motivation.slice(0, 200)}…` : motivation}&rdquo;
          </p>

          <div className="pt-4 border-t border-primary-ink/20 flex justify-between items-center">
            <div className="min-w-0">
              <div className="font-display font-bold text-lg tracking-tight truncate">{fullName || "Anonymous"}</div>
              <div className="text-xs text-primary-ink/60 mt-0.5 truncate">{user.skills?.join(" · ")}</div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-accent text-accent-ink text-[12.5px] font-semibold whitespace-nowrap">
              Open profile <span className="font-serif italic">↗</span>
            </span>
          </div>
        </div>
      </div>

      {user.slug && (
        <Link
          href={`/contact/${user.slug}`}
          aria-label={`Open ${fullName || "founder"} profile`}
          className="absolute inset-0 z-10 rounded-[22px] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        />
      )}
    </div>
  );
};
