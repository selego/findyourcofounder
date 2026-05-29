"use client";

// AuthShell — two-column layout used by /signin and /signup.
// Left column: form (cream background). Right column: accent-tinted panel
// with a Humaaans illustration and a tagline. On mobile the illustration
// collapses below the form.

import { HmnWave, HmnHandsUp, HmnSpectacles } from "./humaaans/avatars";
import { getHumaaansPalette } from "./humaaans/palette";

const ILLUSTRATIONS = {
  signin: { Avatar: HmnWave, color: "mint", tagline: "Welcome back.", bg: "bg-mint" },
  signup: { Avatar: HmnHandsUp, color: "rose", tagline: "Let's get you found.", bg: "bg-rose" },
  reset: { Avatar: HmnSpectacles, color: "salmon", tagline: "It happens.", bg: "bg-salmon" },
};

export function AuthShell({ children, side = "signin", title, kicker, footer }) {
  const { Avatar, color, tagline, bg } = ILLUSTRATIONS[side] || ILLUSTRATIONS.signin;
  const palette = getHumaaansPalette(color);

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] bg-bg">
      {/* Form column */}
      <div className="flex flex-col justify-center items-stretch px-6 sm:px-10 lg:px-14 py-24 max-w-[720px] w-full mx-auto">
        {kicker && (
          <div className="font-mono text-[11.5px] tracking-[0.18em] uppercase text-muted mb-3">
            {kicker}
          </div>
        )}
        {title && (
          <h1 className="font-display font-bold text-4xl lg:text-5xl tracking-tight text-ink mb-10 leading-[1.05]">
            {title}
          </h1>
        )}

        <div>{children}</div>

        {footer && <div className="mt-10 text-sm text-ink-2">{footer}</div>}
      </div>

      {/* Illustration panel */}
      <aside
        className={`hidden lg:flex relative overflow-hidden ${bg} border-l border-ink/10 items-center justify-center`}
      >
        <div className="relative z-10 flex flex-col items-center gap-8 px-12">
          <Avatar size={200} palette={palette} />
          <p className="font-serif italic text-3xl text-ink text-center max-w-[360px] leading-snug">
            {tagline}
          </p>
        </div>

        {/* Decorative floating shapes */}
        <div className="absolute top-12 left-12 w-4 h-4 rounded-full bg-accent" />
        <div
          className="absolute bottom-20 right-10 w-5 h-5 rounded-[4px] bg-cobalt"
          style={{ transform: "rotate(18deg)" }}
        />
        <div className="absolute top-1/3 right-16 font-serif italic text-accent text-4xl">&amp;</div>
      </aside>
    </div>
  );
}
