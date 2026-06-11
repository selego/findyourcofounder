// FYC footer — dark ink, three nav columns plus a brand column and a slim
// bottom bar with copyright + legal links. Placeholder hrefs (`#`) are used
// for routes that don't exist yet; swap them in as those pages ship.

import Link from "next/link";
import { NewsletterFooter } from "./newsletter-footer";

const COLUMNS = [
  {
    heading: "The index",
    links: [
      { label: "Browse founders", href: "/" },
      { label: "Join free", href: "/signup" },
      { label: "Sign in", href: "/signin" },
    ],
  },
  {
    heading: "By skill",
    links: [
      { label: "Tech co-founders", href: "/skills/tech" },
      { label: "Product co-founders", href: "/skills/product" },
      { label: "Design co-founders", href: "/skills/design" },
      { label: "Business co-founders", href: "/skills/business" },
      { label: "Marketing co-founders", href: "/skills/marketing" },
    ],
  },
  {
    heading: "About",
    links: [
      { label: "The concept", href: "/concept" },
      { label: "How it works", href: "/concept#how" },
      { label: "Browse by city", href: "/cities" },
      { label: "Email us", href: "mailto:sebastien@selego.co" },
    ],
  },
];

const BOTTOM_LINKS = [
  { label: "Legal", href: "/legale" },
  { label: "Cookies", href: "/gdpr" },
];

export const Footer = () => {
  return (
    <footer className="bg-ink text-primary-ink">
      <div className="max-w-[1400px] mx-auto px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr] gap-10 lg:gap-16">
          {/* Brand column */}
          <div>
            <Link
              href="/"
              className="flex items-center gap-2.5 text-primary-ink no-underline"
              aria-label="findyourcofounder home"
            >
              <span
                className="w-9 h-9 rounded-[10px] grid place-items-center"
                style={{ background: "#1f3d2e" }}
              >
                <span className="font-serif italic text-accent-2 text-[22px] leading-none">
                  &amp;
                </span>
              </span>
              <span className="font-display font-bold text-[18px] tracking-tight">
                findyourcofounder<span className="text-accent">.</span>nl
              </span>
            </Link>
            <p className="mt-5 max-w-[300px] text-[13px] leading-relaxed text-primary-ink/60">
              A small Dutch index for founders looking for a cofounder. Built by
              founders, in Amsterdam, with care.
            </p>
            <NewsletterFooter />
          </div>

          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-primary-ink/45 mb-5">
                {col.heading}
              </div>
              <ul className="flex flex-col gap-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-primary-ink/85 hover:text-accent transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-6 border-t border-primary-ink/15 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-primary-ink/50">
            © {new Date().getFullYear()} findyourcofounder. ·{" "}
            <a
              href="https://selego.co"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent transition-colors"
            >
              selego.co
            </a>
          </p>
          <ul className="flex items-center gap-6">
            {BOTTOM_LINKS.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  className="text-xs text-primary-ink/50 hover:text-accent transition-colors"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
};
