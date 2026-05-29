export const skillsColors = {
  Business: "bg-business",
  Design: "bg-design",
  Marketing: "bg-marketing",
  Product: "bg-product",
  Tech: "bg-tech",
};

// Skill chip tint — bg colour + matching text colour for legibility.
// Single source of truth shared by card, signup, profile, and contact pages.
export const SKILL_TINT = {
  Tech: "bg-tech text-white",
  Product: "bg-product text-white",
  Design: "bg-design text-white",
  Business: "bg-business text-ink",
  Marketing: "bg-marketing text-white",
};

export const BASE_URL = "http://localhost:3000";
export const SERVER_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://api-cofounder.cleverapps.io/cofounder"
    : "http://localhost:8080/cofounder";
