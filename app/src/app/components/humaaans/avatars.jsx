// Humaaans-inspired avatar SVGs — flat, modular, near-faceless.
// Each component takes { size, palette, className } where `palette` is a
// { skin, clothes, pants, hair } object. Use `getHumaaansPalette(tintKey)`
// from ./palette to map a named tint to the right palette object.

import { getHumaaansPalette } from "./palette";

const DEFAULTS = {
  spectacles: { skin: "#f4b59e", clothes: "#ff5a36", pants: "#1f3d2e", hair: "#1a1a1a" },
  buzz: { skin: "#e8c8a6", clothes: "#b58af7", pants: "#2a2f2c", hair: "#3b2d1f" },
  wave: { skin: "#d9a781", clothes: "#9ddfae", pants: "#2a2f2c", hair: "#3b2d1f" },
  handsUp: { skin: "#f4cfc1", clothes: "#f4b4b4", pants: "#1f3d2e", hair: "#241a14" },
};

export function HmnSpectacles({ size = 120, palette, className }) {
  const p = { ...DEFAULTS.spectacles, ...(palette || {}) };
  return (
    <svg viewBox="0 0 120 180" width={size} height={size * 1.5} className={className}>
      <ellipse cx="60" cy="175" rx="36" ry="4" fill="#000" opacity="0.08" />
      <rect x="40" y="120" width="16" height="55" rx="6" fill={p.pants} />
      <rect x="64" y="120" width="16" height="55" rx="6" fill={p.pants} />
      <ellipse cx="48" cy="172" rx="10" ry="5" fill="#1a1a1a" />
      <ellipse cx="72" cy="172" rx="10" ry="5" fill="#1a1a1a" />
      <path d="M30 70 Q30 60 42 58 L78 58 Q90 60 90 70 L90 125 Q60 132 30 125 Z" fill={p.clothes} />
      <rect x="54" y="50" width="12" height="14" fill={p.skin} />
      <ellipse cx="60" cy="34" rx="22" ry="24" fill={p.skin} />
      <path d="M38 30 Q38 12 60 10 Q82 12 82 30 L82 22 Q72 16 60 16 Q48 16 38 22 Z" fill={p.hair} />
      <circle cx="50" cy="36" r="6.5" fill="none" stroke={p.hair} strokeWidth="2.2" />
      <circle cx="70" cy="36" r="6.5" fill="none" stroke={p.hair} strokeWidth="2.2" />
      <line x1="56.5" y1="36" x2="63.5" y2="36" stroke={p.hair} strokeWidth="2.2" />
      <rect x="22" y="68" width="14" height="44" rx="7" fill={p.clothes} />
      <rect x="84" y="68" width="14" height="44" rx="7" fill={p.clothes} />
      <circle cx="29" cy="116" r="8" fill={p.skin} />
      <circle cx="91" cy="116" r="8" fill={p.skin} />
    </svg>
  );
}

export function HmnBuzz({ size = 120, palette, className }) {
  const p = { ...DEFAULTS.buzz, ...(palette || {}) };
  return (
    <svg viewBox="0 0 120 180" width={size} height={size * 1.5} className={className}>
      <ellipse cx="60" cy="175" rx="36" ry="4" fill="#000" opacity="0.08" />
      <rect x="40" y="120" width="16" height="55" rx="6" fill={p.pants} />
      <rect x="64" y="120" width="16" height="55" rx="6" fill={p.pants} />
      <ellipse cx="48" cy="172" rx="10" ry="5" fill="#1a1a1a" />
      <ellipse cx="72" cy="172" rx="10" ry="5" fill="#1a1a1a" />
      <path d="M28 70 Q28 60 42 58 L78 58 Q92 60 92 70 L92 122 Q60 130 28 122 Z" fill={p.clothes} />
      <rect x="54" y="50" width="12" height="14" fill={p.skin} />
      <ellipse cx="60" cy="34" rx="22" ry="24" fill={p.skin} />
      <path d="M40 28 Q40 14 60 12 Q80 14 80 28 Q80 30 80 32 Q70 30 60 30 Q50 30 40 32 Q40 30 40 28 Z" fill={p.hair} />
      <rect x="20" y="68" width="14" height="48" rx="7" fill={p.clothes} transform="rotate(8 27 92)" />
      <rect x="86" y="68" width="14" height="42" rx="7" fill={p.clothes} />
      <circle cx="22" cy="118" r="8" fill={p.skin} />
      <circle cx="93" cy="114" r="8" fill={p.skin} />
    </svg>
  );
}

export function HmnWave({ size = 120, palette, className }) {
  const p = { ...DEFAULTS.wave, ...(palette || {}) };
  return (
    <svg viewBox="0 0 120 180" width={size} height={size * 1.5} className={className}>
      <ellipse cx="60" cy="175" rx="36" ry="4" fill="#000" opacity="0.08" />
      <rect x="40" y="120" width="16" height="55" rx="6" fill={p.pants} />
      <rect x="64" y="120" width="16" height="55" rx="6" fill={p.pants} />
      <ellipse cx="48" cy="172" rx="10" ry="5" fill="#1a1a1a" />
      <ellipse cx="72" cy="172" rx="10" ry="5" fill="#1a1a1a" />
      <path d="M30 70 Q30 60 42 58 L78 58 Q90 60 90 70 L90 125 Q60 132 30 125 Z" fill={p.clothes} />
      <rect x="54" y="50" width="12" height="14" fill={p.skin} />
      <ellipse cx="60" cy="34" rx="22" ry="24" fill={p.skin} />
      <path
        d="M36 24 Q36 8 60 8 Q84 8 84 24 L84 56 Q84 60 80 60 L80 28 Q70 24 60 24 Q50 24 40 28 L40 60 Q36 60 36 56 Z"
        fill={p.hair}
      />
      <rect x="18" y="36" width="14" height="48" rx="7" fill={p.clothes} transform="rotate(-22 25 60)" />
      <circle cx="14" cy="32" r="8" fill={p.skin} />
      <rect x="86" y="68" width="14" height="42" rx="7" fill={p.clothes} />
      <circle cx="93" cy="114" r="8" fill={p.skin} />
    </svg>
  );
}

export function HmnHandsUp({ size = 120, palette, className }) {
  const p = { ...DEFAULTS.handsUp, ...(palette || {}) };
  return (
    <svg viewBox="0 0 120 180" width={size} height={size * 1.5} className={className}>
      <ellipse cx="60" cy="175" rx="36" ry="4" fill="#000" opacity="0.08" />
      <rect x="40" y="120" width="16" height="55" rx="6" fill={p.pants} />
      <rect x="64" y="120" width="16" height="55" rx="6" fill={p.pants} />
      <ellipse cx="48" cy="172" rx="10" ry="5" fill="#1a1a1a" />
      <ellipse cx="72" cy="172" rx="10" ry="5" fill="#1a1a1a" />
      <path d="M30 70 Q30 60 42 58 L78 58 Q90 60 90 70 L90 125 Q60 132 30 125 Z" fill={p.clothes} />
      <rect x="54" y="50" width="12" height="14" fill={p.skin} />
      <ellipse cx="60" cy="34" rx="22" ry="24" fill={p.skin} />
      <path d="M38 30 Q38 12 60 10 Q82 12 82 30 L82 22 Q72 16 60 16 Q48 16 38 22 Z" fill={p.hair} />
      <circle cx="60" cy="6" r="9" fill={p.hair} />
      <rect x="20" y="32" width="14" height="48" rx="7" fill={p.clothes} transform="rotate(-18 27 56)" />
      <rect x="86" y="32" width="14" height="48" rx="7" fill={p.clothes} transform="rotate(18 93 56)" />
      <circle cx="16" cy="28" r="8" fill={p.skin} />
      <circle cx="104" cy="28" r="8" fill={p.skin} />
    </svg>
  );
}

const AVATAR_KINDS = {
  spectacles: HmnSpectacles,
  buzz: HmnBuzz,
  wave: HmnWave,
  "hands-up": HmnHandsUp,
};

/**
 * High-level wrapper. Pick an avatar `kind` + a named `color` tint.
 * Example: <FYCAvatar kind="wave" color="mint" size={140} />
 */
export function FYCAvatar({ kind = "spectacles", color = "salmon", size = 120, className }) {
  const Comp = AVATAR_KINDS[kind] || HmnSpectacles;
  return <Comp size={size} palette={getHumaaansPalette(color)} className={className} />;
}

export const AVATAR_KIND_KEYS = Object.keys(AVATAR_KINDS);
