import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Diacritic-stripping lowercased slug. "São Paulo" → "sao-paulo".
// Symmetric: feed any city through this on both sides of the URL boundary
// so the round-trip matches.
export function slugifyCity(city) {
  return (city || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
