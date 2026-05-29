// Multi-figure Humaaans scenes — used on the landing hero + "how it works".
// Self-contained: no Tailwind dependency, no window globals. Drop in anywhere.

import { getHumaaansPalette } from "./palette";

// FYC palette tokens that scenes reference directly.
const PAL = {
  bg: "#f4f1ea",
  ink: "#0e1410",
  ink2: "#2a2f2c",
  muted: "#6b716c",
  primary: "#1f3d2e",
  accent: "#ff5a36",
  accent2: "#ffd166",
  mint: "#9ddfae",
  cobalt: "#5a6cff",
};

/**
 * Hero illustration — two founders meeting, dotted handshake line between
 * them, soft mint blob behind. Use on landing.
 */
export function HeroDuo({ width = 640, height = 520, className }) {
  const left = getHumaaansPalette("cobalt");
  const right = getHumaaansPalette("salmon");
  return (
    <svg viewBox="0 0 640 520" width={width} height={height} className={className} style={{ display: "block" }}>
      <ellipse cx="320" cy="290" rx="290" ry="200" fill={PAL.mint} opacity="0.55" />
      <circle cx="495" cy="120" r="48" fill="#f4c95d" />
      <circle cx="105" cy="430" r="32" fill={PAL.accent} opacity="0.85" />

      <path
        d="M 200 290 Q 320 220 440 290"
        stroke={PAL.ink}
        strokeWidth="2.5"
        strokeDasharray="2 8"
        fill="none"
        strokeLinecap="round"
        opacity="0.6"
      />

      {/* LEFT person */}
      <g transform="translate(80, 160)">
        <ellipse cx="80" cy="345" rx="55" ry="6" fill="#000" opacity="0.1" />
        <rect x="56" y="240" width="22" height="105" rx="9" fill={left.pants} />
        <rect x="86" y="240" width="22" height="105" rx="9" fill={left.pants} />
        <ellipse cx="66" cy="343" rx="14" ry="7" fill="#1a1a1a" />
        <ellipse cx="98" cy="343" rx="14" ry="7" fill="#1a1a1a" />
        <path d="M38 140 Q38 126 56 124 L108 124 Q126 126 126 140 L126 248 Q82 256 38 248 Z" fill={left.clothes} />
        <rect x="74" y="112" width="18" height="18" fill={left.skin} />
        <ellipse cx="83" cy="80" rx="30" ry="32" fill={left.skin} />
        <path d="M53 74 Q53 42 83 40 Q113 42 113 74 L113 62 Q98 54 83 54 Q68 54 53 62 Z" fill={left.hair} />
        <circle cx="70" cy="82" r="8" fill="none" stroke={left.hair} strokeWidth="2.5" />
        <circle cx="96" cy="82" r="8" fill="none" stroke={left.hair} strokeWidth="2.5" />
        <line x1="78" y1="82" x2="88" y2="82" stroke={left.hair} strokeWidth="2.5" />
        <rect x="118" y="138" width="18" height="80" rx="9" fill={left.clothes} transform="rotate(46 127 178)" />
        <rect x="22" y="138" width="18" height="64" rx="9" fill={left.clothes} />
        <circle cx="31" cy="206" r="11" fill={left.skin} />
      </g>

      {/* RIGHT person */}
      <g transform="translate(340, 170)">
        <ellipse cx="80" cy="335" rx="55" ry="6" fill="#000" opacity="0.1" />
        <rect x="56" y="230" width="22" height="105" rx="9" fill={right.pants} />
        <rect x="86" y="230" width="22" height="105" rx="9" fill={right.pants} />
        <ellipse cx="66" cy="333" rx="14" ry="7" fill="#1a1a1a" />
        <ellipse cx="98" cy="333" rx="14" ry="7" fill="#1a1a1a" />
        <path d="M38 130 Q38 116 56 114 L108 114 Q126 116 126 130 L126 238 Q82 246 38 238 Z" fill={right.clothes} />
        <rect x="74" y="102" width="18" height="18" fill={right.skin} />
        <ellipse cx="83" cy="70" rx="30" ry="32" fill={right.skin} />
        <path
          d="M50 60 Q50 30 83 28 Q116 30 116 60 L116 124 Q116 130 110 130 L110 60 Q98 52 83 52 Q68 52 56 60 L56 130 Q50 130 50 124 Z"
          fill={right.hair}
        />
        <rect x="-12" y="128" width="18" height="76" rx="9" fill={right.clothes} transform="rotate(-46 -3 166)" />
        <rect x="126" y="128" width="18" height="68" rx="9" fill={right.clothes} />
        <circle cx="135" cy="198" r="11" fill={right.skin} />
      </g>

      {/* meeting handshake circle */}
      <circle cx="320" cy="298" r="18" fill={PAL.primary} />
      <text
        x="320"
        y="304"
        textAnchor="middle"
        fill={PAL.accent2}
        fontSize="20"
        fontFamily="var(--font-instrument), Instrument Serif, serif"
        fontStyle="italic"
      >
        &amp;
      </text>

      <circle cx="60" cy="120" r="6" fill={PAL.accent} />
      <rect x="560" y="380" width="14" height="14" rx="3" fill={PAL.cobalt} transform="rotate(20 567 387)" />
      <path d="M 580 230 L 596 230 M 588 222 L 588 238" stroke={PAL.ink} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/** Step 1 — profile card with skill chips. */
export function StepProfile({ className }) {
  return (
    <svg viewBox="0 0 220 180" width="100%" height="100%" className={className} style={{ display: "block" }}>
      <rect x="20" y="22" width="180" height="140" rx="14" fill="#ffffff" stroke={PAL.ink} strokeWidth="2.5" />
      <circle cx="55" cy="60" r="18" fill={PAL.accent} />
      <rect x="82" y="50" width="100" height="9" rx="3" fill={PAL.ink} />
      <rect x="82" y="64" width="68" height="7" rx="3" fill={PAL.muted} />
      <rect x="36" y="95" width="148" height="6" rx="3" fill={PAL.ink2} />
      <rect x="36" y="107" width="118" height="6" rx="3" fill={PAL.ink2} />
      <rect x="36" y="119" width="138" height="6" rx="3" fill={PAL.ink2} />
      <rect x="36" y="138" width="38" height="14" rx="7" fill={PAL.mint} />
      <rect x="80" y="138" width="42" height="14" rx="7" fill="#f4c95d" />
      <rect x="128" y="138" width="34" height="14" rx="7" fill="#f4b4b4" />
      <path d="M192 32 L196 36 L200 32 L196 28 Z" fill={PAL.accent} />
    </svg>
  );
}

/** Step 2 — browse a stack of founder cards. */
export function StepBrowse({ className }) {
  return (
    <svg viewBox="0 0 220 180" width="100%" height="100%" className={className} style={{ display: "block" }}>
      <rect x="30" y="40" width="160" height="116" rx="12" fill="#ebe6da" transform="rotate(-4 110 98)" />
      <rect x="34" y="34" width="160" height="116" rx="12" fill="#ffd166" transform="rotate(2 114 92)" />
      <rect x="38" y="28" width="160" height="116" rx="12" fill="#ffffff" stroke={PAL.ink} strokeWidth="2.5" />
      <circle cx="68" cy="62" r="16" fill={PAL.cobalt} />
      <rect x="92" y="54" width="80" height="8" rx="3" fill={PAL.ink} />
      <rect x="92" y="66" width="56" height="6" rx="3" fill={PAL.muted} />
      <rect x="54" y="92" width="40" height="14" rx="7" fill={PAL.mint} />
      <rect x="100" y="92" width="50" height="14" rx="7" fill="#f4b4b4" />
      <rect x="54" y="118" width="120" height="6" rx="3" fill={PAL.ink2} />
      <rect x="54" y="130" width="90" height="6" rx="3" fill={PAL.ink2} />
      <circle cx="184" cy="28" r="10" fill="none" stroke={PAL.primary} strokeWidth="2.5" />
      <line x1="191" y1="35" x2="200" y2="44" stroke={PAL.primary} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/** Step 3 — two avatars meet, accent heart-spark between them. */
export function StepMatch({ className }) {
  return (
    <svg viewBox="0 0 220 180" width="100%" height="100%" className={className} style={{ display: "block" }}>
      <circle cx="70" cy="90" r="36" fill={PAL.cobalt} />
      <circle cx="70" cy="78" r="16" fill="#f4b59e" />
      <path d="M48 110 Q48 96 70 96 Q92 96 92 110 L92 126 Q70 132 48 126 Z" fill={PAL.cobalt} />

      <circle cx="150" cy="90" r="36" fill={PAL.accent} />
      <circle cx="150" cy="78" r="16" fill="#d9a781" />
      <path d="M128 110 Q128 96 150 96 Q172 96 172 110 L172 126 Q150 132 128 126 Z" fill={PAL.accent} />

      <g transform="translate(110, 60)">
        <path d="M0 6 C0 0 8 0 8 6 C8 0 16 0 16 6 C16 14 8 22 8 22 C8 22 0 14 0 6 Z" fill={PAL.accent} />
      </g>

      <path
        d="M100 110 Q110 100 120 110"
        stroke={PAL.ink}
        strokeWidth="2.5"
        strokeDasharray="2 6"
        fill="none"
        strokeLinecap="round"
      />

      <ellipse cx="110" cy="156" rx="80" ry="6" fill="#000" opacity="0.08" />
    </svg>
  );
}
