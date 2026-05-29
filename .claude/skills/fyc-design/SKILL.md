---
name: fyc-design
description: findyourcofounder UI design system. Use this skill any time you create, edit, or review a component, page, button, card, form input, or any styled element in the FYC app. Triggers on "create a component", "add a section", "style this", "make a button", "build a card", "does this follow our design?", or any task that produces JSX/TSX with Tailwind classes. The goal is to ensure all output uses the correct Tailwind tokens, cream/ink palette, brutalist shadow conventions, skill colour system, and component patterns — never improvising or introducing new styling approaches.
---

# findyourcofounder UI Design System

This is the source of truth for all styling decisions in the FYC app. Read this before writing any `className` or visual logic.

---

## Stack & Principles

- **Next.js 14 App Router** + **Tailwind CSS**
- **Tailwind-first.** Use utility classes for all styling. `style={{}}` is only acceptable for genuinely dynamic runtime values (e.g. a colour computed from user data, a 3D `perspective`, a card-flip `transform`).
- **No `<style>` tags inside components.** Use `globals.css` or Tailwind classes.
- **No duplicated colour constants** inside component files. Colours live in `tailwind.config.js`; the skill-chip tint mapping lives in `utils/constants.js` as `SKILL_TINT`.
- **One icon library: `react-icons/fa6`** (Font Awesome 6). Do not mix with other icon sets.
- **Light, editorial.** Cream background, near-black ink text, signature orange accent. Brutalist drop shadows (`shadow-card`) on cards, **never** soft Material-style shadows.

---

## Colour Tokens

Defined in `tailwind.config.js`. Always use the class name — never hardcode hex values in JSX (the one exception is `style={{ background: "#1f3d2e" }}` for the small dark-green logo tile, which is a one-off brand mark).

### Base palette
| Token | Class | Hex | When to use |
|---|---|---|---|
| Page bg | `bg-bg` | `#f4f1ea` | Default page background (cream) |
| Surface bg | `bg-bg-soft` | `#ebe6da` | Section dividers (e.g. "How it works") |
| Paper | `bg-paper` | `#ffffff` | Cards, modals, form surfaces |
| Ink | `text-ink` / `bg-ink` | `#0e1410` | Primary text; dark buttons; card back face |
| Ink-2 | `text-ink-2` | `#2a2f2c` | Secondary text, body copy |
| Muted | `text-muted` | `#6b716c` | Labels, placeholders, footer copy |
| Rule | `border-rule` | `#dcd6c7` | Borders and dividers |
| Primary ink | `text-primary-ink` | `#fafaf5` | Text on dark (`bg-ink`) surfaces |

### Accents
| Token | Class | Hex | When to use |
|---|---|---|---|
| Accent (orange) | `text-accent` / `bg-accent` | `#ff5a36` | Italic-serif emphasis words, primary highlights, underline decoration |
| Accent-2 (gold) | `bg-accent-2` | `#ffd166` | Logo ampersand colour, secondary highlight tint |
| LinkedIn | `text-linkedIn` | `#0a66c2` | LinkedIn icon only |

### Skill chip colours
Defined as `SKILL_TINT` in `utils/constants.js`. Import it — don't redefine:
```js
import { SKILL_TINT } from "@/app/utils/constants";
// {Tech, Product, Design, Marketing} → bg-{token} text-white
// Business → bg-business text-ink (mint background, dark text for legibility)
```

| Skill | Class fragment | Hex |
|---|---|---|
| Tech | `bg-tech text-white` | `#5a6cff` (cobalt) |
| Product | `bg-product text-white` | `#b58af7` (violet) |
| Design | `bg-design text-white` | `#ff5a36` (accent) |
| Business | `bg-business text-ink` | `#9ddfae` (mint) |
| Marketing | `bg-marketing text-white` | `#ff9b7a` (salmon) |

### Humaaans tint palette
For illustrations, avatar backgrounds (`bg-mint`, `bg-rose`, `bg-cobalt`, `bg-violet`, `bg-salmon`, `bg-mustard`). Use the deterministic helper:
```js
import { tintForKey } from "@/app/components/humaaans";
const tint = tintForKey(user._id); // → "mint" | "rose" | ...
```

---

## Typography

Four fonts loaded in `layout.jsx` via `next/font/google`:

| Role | CSS variable | Tailwind class | When to use |
|---|---|---|---|
| Body / UI | `--font-geist-sans` | `font-sans` (default) | All body text, paragraphs, inputs, nav links, buttons |
| Display | `--font-bricolage` | `font-display` | Big headlines (`<h1>`, `<h2>`, hero text, wordmarks, card names) |
| Italic accents | `--font-instrument` | `font-serif italic` | Highlight words inside headlines (`.<span className="font-serif italic font-normal text-accent">word</span>.`); inline glyphs like `→ ← ↗ &` |
| Mono labels | `--font-jetbrains` | `font-mono` | Small uppercase labels (`text-[11.5px] tracking-[0.18em] uppercase text-muted`) |

**Display headline pattern:**
```jsx
<h1 className="font-display font-bold text-[64px] lg:text-[96px] leading-[0.95] tracking-[-0.045em] text-ink">
  Find the person you'd build it{" "}
  <span className="font-serif italic font-normal text-accent">with</span>.
</h1>
```

**Mono kicker pattern:**
```jsx
<div className="font-mono text-[11.5px] tracking-[0.18em] uppercase text-muted mb-4">
  The index · updated daily
</div>
```

**Section headline pattern:**
```jsx
<h2 className="font-display font-bold text-[56px] lg:text-[72px] leading-[0.98] tracking-[-0.035em] text-ink">
  {n} founders{" "}
  <span className="font-serif italic font-normal text-accent">open</span>{" "}
  to meeting you.
</h2>
```

The legacy `.text-shadow` utility still exists in `globals.css` for any old code that depends on it, but **new components must not use it** — the cream/ink design relies on weight + size for hierarchy, not glow.

---

## Border Radius

| Element | Class |
|---|---|
| Cards | `rounded-[22px]` |
| Modals | `rounded-[22px]` |
| Stat tiles, secondary cards | `rounded-2xl` |
| Buttons (pill) | `rounded-full` |
| Inputs / textareas | `rounded-xl` |
| Skill chips | `rounded-full` |
| Logo tile | `rounded-[10px]` (large) / `rounded-[8px]` (small) |

---

## Shadows

Brutalist offset shadows — defined in `tailwind.config.js`:

| Class | Spec | Where |
|---|---|---|
| `shadow-card` | `4px 4px 0 0 #0e1410` | Founder cards, info cards, contact page article |
| `shadow-card-sm` | `2px 2px 0 0 #0e1410` | Smaller chips/badges if needed |
| `shadow-card-lg` | `6px 6px 0 0 #0e1410` | Modal content |
| `shadow-soft` | layered subtle shadow | Rare — only when brutalist would feel wrong |

**Always pair `shadow-card` with `border-[1.5px] border-ink`** — the shadow is meaningless without the dark outline.

---

## Buttons

### Primary (dark ink pill)
```jsx
<Link
  href="/signup"
  className="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-ink text-primary-ink text-base font-semibold hover:bg-ink-2 transition-colors"
>
  Browse the index <span className="font-serif italic">→</span>
</Link>
```

### Secondary (outlined ink pill)
```jsx
<Link
  href="/signup"
  className="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-transparent text-ink font-medium text-base border-[1.5px] border-ink hover:bg-ink hover:text-primary-ink transition-colors"
>
  Add your profile
</Link>
```

### Tertiary / link
```jsx
<Link href="/" className="text-sm text-muted hover:text-ink transition-colors">
  Sign in
</Link>
```

### Back-link (mono uppercase)
```jsx
<Link
  href="/"
  className="inline-flex items-center gap-2 font-mono text-[11.5px] tracking-[0.18em] uppercase text-muted hover:text-ink transition-colors group"
>
  <FaArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
  Back
</Link>
```

**Rules:**
- All transitions are `transition-colors` (not `transition-opacity`). The cream design uses colour shifts, not fades.
- Buttons that progress the user forward end with the italic-serif `→` glyph (`<span className="font-serif italic">→</span>`).
- Use `<Link>` for navigation, `<button>` for actions.

---

## Cards

Founder card uses a 3D hover-flip — see `app/src/app/components/card.jsx`. Both faces use `rounded-[22px] border-[1.5px] border-ink`:

- **Front:** `bg-paper`, mono ID/city header, tinted Humaaans avatar block, name + skill chips footer. Carries `shadow-card` when not flipped.
- **Back:** `bg-ink text-primary-ink`, italic-serif motivation quote, accent-2 mono labels, "Open profile" pill in `bg-accent text-accent-ink`.

For a static card (e.g. info page, contact page) use the front-face skeleton:
```jsx
<article className="bg-paper rounded-[22px] border-[1.5px] border-ink shadow-card p-8 lg:p-12">
  {/* mono kicker + display headline + italic accent + body */}
</article>
```

### Modal (Radix Dialog)
```jsx
<Dialog.Overlay className="bg-ink/30 backdrop-blur-md data-[state=open]:animate-overlayShow fixed inset-0 z-[60]" />
<Dialog.Content className="data-[state=open]:animate-contentShow fixed top-1/2 left-1/2 w-[90vw] max-w-[720px] max-h-[85vh] overflow-auto -translate-x-1/2 -translate-y-1/2 rounded-[22px] shadow-card-lg bg-paper text-ink p-8 z-[60] border-[1.5px] border-ink focus:outline-none">
```
Use `@radix-ui/react-dialog` for all modal needs.

---

## Form Inputs

Base input styles are set globally in `globals.css` — just render the element:
```jsx
<input type="text"     placeholder="Your name" />
<input type="email"    placeholder="you@domain.com" />
<input type="password" placeholder="••••••••" />
<input type="search"   placeholder="Search" />  {/* expands on focus */}
```

The shared field pattern is a mono uppercase label above the input. Define `FieldShell` inline in the file (8 lines — used in signin, forgot-password, reset-password):
```jsx
function FieldShell({ label, children }) {
  return (
    <div>
      <label className="block font-mono text-[11.5px] tracking-[0.18em] uppercase text-muted mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}
```

For multi-step forms see `app/src/app/signup/chomeur-form.jsx` — `Field` / `Textarea` / `NavRow` helpers live locally in the file; don't extract them prematurely.

For auth pages (signin, signup, forgot-password, reset-password), wrap the whole form in `<AuthShell side="signin|signup|reset" kicker="…" title={…} footer={…}>` — it handles the two-column layout with the right-side Humaaans illustration.

---

## Icons

**One library: `react-icons/fa6`** (Font Awesome 6).
```jsx
import { FaArrowLeft, FaXmark, FaLinkedin } from "react-icons/fa6";
```

| Action | Icon |
|---|---|
| Back / navigate | `FaArrowLeft` |
| Close / dismiss | `FaXmark` |
| LinkedIn | `FaLinkedin` |

Never import from `react-icons/fi`, `react-icons/hi`, `react-icons/rx`, or other sets.

---

## Illustrations — Humaaans

All illustrations live in `app/src/app/components/humaaans/`:
- `avatars.jsx` — `HmnSpectacles`, `HmnBuzz`, `HmnWave`, `HmnHandsUp` (single figures)
- `scenes.jsx` — `HeroDuo`, `StepProfile`, `StepBrowse`, `StepMatch` (multi-figure scenes)
- `palette.js` — tint colour definitions + `tintForKey(key)` deterministic hash
- `index.js` — barrel export

For founder avatars on cards, use `tintForKey(user._id)` so the same user always gets the same tint. For decorative illustrations on pages, pick a tint that matches the section mood (`mint` for hopeful, `rose` for warm, `salmon` for cautionary, etc.).

---

## Layout

```jsx
// Top-padded page (sits under the fixed TopBar)
<main className="bg-bg min-h-screen pt-[140px] pb-24 px-6 lg:px-10">
  <div className="max-w-[760px] mx-auto">
    {/* content */}
  </div>
</main>

// Full-bleed section
<section className="bg-bg px-10 py-24">
  <div className="max-w-[1320px] mx-auto">{/* … */}</div>
</section>

// Founder grid
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
```

The TopBar is fixed and uses `pt-[140px]` of padding on landing-style pages; `pt-[112px]` on dashboard-style pages (`/profile`).

---

## Pre-commit Checklist

- [ ] Background is `bg-bg` (cream) — not `bg-paper`, not white
- [ ] Headlines use `font-display`; body uses default `font-sans` (Geist)
- [ ] No `style={{}}` for static design values (one allowed exception: the `#1f3d2e` logo tile and card-flip 3D transforms)
- [ ] No hex colours hardcoded in JSX — use Tailwind tokens
- [ ] Skill chip colours come from `SKILL_TINT` in `utils/constants.js`, not redefined inline
- [ ] Icons only from `react-icons/fa6`
- [ ] Inputs rely on global styles — no extra classes needed
- [ ] Hover states use `transition-colors` (not `transition-opacity`)
- [ ] Cards use `rounded-[22px] bg-paper border-[1.5px] border-ink shadow-card`
- [ ] Italic-serif emphasis always pairs with `text-accent` and `font-normal`
- [ ] No `text-shadow`, `hover:text-yellow`, `bg-gradient-gray`, `text-yellow` left over — these are legacy
- [ ] No component file over ~200 lines — split if needed
