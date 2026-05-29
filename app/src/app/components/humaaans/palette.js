// Tint palettes for Humaaans-style avatars.
// Each key picks a coordinated set of { skin, clothes, pants, hair }.
// Used by avatars + scenes throughout the FYC redesign.

export const HUMAAANS_PALETTE = {
  salmon: { skin: "#f4b59e", clothes: "#ff5a36", pants: "#1f3d2e", hair: "#1a1a1a" },
  violet: { skin: "#e8c8a6", clothes: "#b58af7", pants: "#2a2f2c", hair: "#3b2d1f" },
  mustard: { skin: "#d9a781", clothes: "#f4c95d", pants: "#5a6cff", hair: "#1a1a1a" },
  rose: { skin: "#f4cfc1", clothes: "#f4b4b4", pants: "#1f3d2e", hair: "#241a14" },
  mint: { skin: "#d9a781", clothes: "#9ddfae", pants: "#2a2f2c", hair: "#3b2d1f" },
  cobalt: { skin: "#f4b59e", clothes: "#5a6cff", pants: "#ffd166", hair: "#1a1a1a" },
};

export const HUMAAANS_TINTS = ["salmon", "violet", "mustard", "rose", "mint", "cobalt"];

export function getHumaaansPalette(key) {
  return HUMAAANS_PALETTE[key] || HUMAAANS_PALETTE.salmon;
}

/**
 * Pick a deterministic tint key from an arbitrary string (e.g. user id),
 * so the same founder always shows the same color.
 */
export function tintForKey(key = "") {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) | 0;
  return HUMAAANS_TINTS[Math.abs(hash) % HUMAAANS_TINTS.length];
}
