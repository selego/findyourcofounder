// Tint palettes for Humaaans-style avatars.
// Each key picks a coordinated set of { skin, clothes, pants, hair }.
// Used by avatars + scenes throughout the FYC redesign.

// `clothes` must contrast with the card bg of the same name (the bg uses the
// same Tailwind token as the key). If clothes match the bg the shirt disappears.
export const HUMAAANS_PALETTE = {
  salmon: { skin: "#f4b59e", clothes: "#ff5a36", pants: "#1f3d2e", hair: "#1a1a1a" },
  violet: { skin: "#e8c8a6", clothes: "#ff5a36", pants: "#2a2f2c", hair: "#3b2d1f" },
  mustard: { skin: "#d9a781", clothes: "#5a6cff", pants: "#1f3d2e", hair: "#1a1a1a" },
  rose: { skin: "#f4cfc1", clothes: "#5a6cff", pants: "#1f3d2e", hair: "#241a14" },
  mint: { skin: "#d9a781", clothes: "#ff5a36", pants: "#2a2f2c", hair: "#3b2d1f" },
  cobalt: { skin: "#f4b59e", clothes: "#ffd166", pants: "#1f3d2e", hair: "#1a1a1a" },
};

export const HUMAAANS_TINTS = ["salmon", "violet", "mustard", "rose", "mint", "cobalt"];

export function getHumaaansPalette(key) {
  return HUMAAANS_PALETTE[key] || HUMAAANS_PALETTE.salmon;
}

/**
 * Pick a deterministic tint key from an arbitrary string (e.g. user id),
 * so the same founder always shows the same color.
 * FNV-1a — MongoDB ObjectIds share a timestamp prefix; the previous
 * 31-multiplier hash clustered consecutive users into the same bucket.
 */
export function tintForKey(key = "") {
  let h = 0x811c9dc5;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return HUMAAANS_TINTS[Math.abs(h) % HUMAAANS_TINTS.length];
}
