/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-bricolage)", "Inter", "sans-serif"],
        serif: ["var(--font-instrument)", "Georgia", "serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
      },
      backgroundImage: {
        // Soft warm gradients tuned to the FYC palette
        "gradient-cream": "linear-gradient(135deg,#f4f1ea,#ebe6da)",
        "gradient-ink": "linear-gradient(135deg,#1f3d2e,#0e1410)",
        "gradient-paper": "linear-gradient(135deg,#ffffff,#f4f1ea)",
      },
      boxShadow: {
        // Hand-drawn / brutalist drop shadow used across FYC cards
        card: "4px 4px 0 0 #0e1410",
        "card-sm": "2px 2px 0 0 #0e1410",
        "card-lg": "6px 6px 0 0 #0e1410",
        soft: "0 1px 3px rgba(14,20,16,0.08), 0 1px 2px rgba(14,20,16,0.04)",
      },
      colors: {
        // ── FYC palette (light) ──────────────────────────────────────────
        bg: "#f4f1ea", // warm cream — page background
        "bg-soft": "#ebe6da", // slightly darker cream — surfaces
        paper: "#ffffff", // card / paper surface
        ink: "#0e1410", // primary text — near-black
        "ink-2": "#2a2f2c", // secondary text
        muted: "#6b716c", // tertiary / placeholder
        rule: "#dcd6c7", // borders / dividers
        "primary-ink": "#fafaf5", // text on primary surfaces
        accent: "#ff5a36", // signature orange/red
        "accent-2": "#ffd166", // golden secondary accent
        "accent-ink": "#0e1410", // text on accent

        // Card tint colors (used for avatars, skill chips, etc.)
        mint: "#9ddfae",
        rose: "#f4b4b4",
        cobalt: "#5a6cff",
        violet: "#b58af7",
        salmon: "#ff9b7a",
        mustard: "#f4c95d",

        // ── Skill colors re-skinned to match the FYC palette ─────────────
        tech: "#5a6cff", // cobalt
        product: "#b58af7", // violet
        design: "#ff5a36", // accent orange
        business: "#9ddfae", // mint
        marketing: "#ff9b7a", // salmon

        // ── Legacy / brand ───────────────────────────────────────────────
        yellow: "#ffd166",
        linkedIn: "#0a66c2",

        // ── shadcn-style HSL variable bindings (kept for compatibility) ──
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        // NOTE: `muted` above is the literal FYC token. shadcn's `muted` lives under `muted-surface`
        // to avoid collision — update component imports if they relied on muted.DEFAULT.
        "muted-surface": {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        // Same story for `accent` — shadcn's accent moves to `accent-surface`.
        "accent-surface": {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
      },
      fontSize: {
        xxs: "0.625rem",
      },
      animation: {
        overlayShow: "overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1)",
        contentShow: "contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1)",
        "fyc-marquee": "fyc-marquee 32s linear infinite",
      },
      keyframes: {
        overlayShow: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        contentShow: {
          from: { opacity: 0, transform: "translate(-50%, -48%) scale(0.96)" },
          to: { opacity: 1, transform: "translate(-50%, -50%) scale(1)" },
        },
        "fyc-marquee": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
