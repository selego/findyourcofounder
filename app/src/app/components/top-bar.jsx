"use client";

// FYC header — two visual modes:
//   • "transparent": no background, used when sitting over the landing hero
//   • "slim":        cream blur + bottom rule, used everywhere else (and on
//                    the landing page once the user scrolls past the hero)
// Auth-aware via next-auth/react: signed-in users see Profile + Sign out;
// guests see Sign in + Join free.

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";

const LANDING_PATH = "/concept";

const NAV_LINKS = [
  { label: "The index", href: "/" },
  { label: "The concept", href: "/concept" },
  { label: "How it works", href: "/concept#how" },
  { label: "Stories", href: "/concept#stories" },
];

export const TopBar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { status } = useSession();
  const isLanding = pathname === LANDING_PATH;

  // On non-landing routes the header is always "active" (slim, opaque).
  // On the landing page it starts transparent and fades to slim past 30px.
  const [scrolled, setScrolled] = useState(!isLanding);

  useEffect(() => {
    if (!isLanding) {
      setScrolled(true);
      return;
    }
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isLanding]);

  const active = scrolled;

  return (
    <header
      className={[
        "fixed top-0 inset-x-0 z-50 transition-[background,border-color,padding,backdrop-filter] duration-300 ease-out",
        active
          ? "bg-bg/85 backdrop-blur-md border-b border-rule px-10 py-3.5"
          : "bg-transparent border-b border-transparent px-10 py-5",
      ].join(" ")}
    >
      <div className="max-w-[1400px] mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 text-ink no-underline" aria-label="findyourcofounder home">
          <span className="w-9 h-9 rounded-[10px] bg-primary-ink/0 grid place-items-center" style={{ background: "#1f3d2e" }}>
            <span className="font-serif italic text-accent-2 text-[22px] leading-none">&amp;</span>
          </span>
          <span className="font-display font-bold text-[18px] tracking-tight">
            findyourcofounder<span className="text-accent">.</span>nl
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="text-sm font-medium text-ink-2 hover:text-ink transition-colors"
            >
              {label}
            </Link>
          ))}

          {status === "authenticated" ? (
            <>
              <Link
                href="/profile"
                className="text-sm font-medium text-muted hover:text-ink transition-colors"
              >
                Profile
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-ink bg-ink hover:bg-ink-2 rounded-full px-[18px] py-2.5 transition-colors"
              >
                Sign out <span className="font-serif italic">→</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/signin"
                className="text-sm font-medium text-muted hover:text-ink transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-ink bg-ink hover:bg-ink-2 rounded-full px-[18px] py-2.5 transition-colors"
              >
                Join free <span className="font-serif italic">→</span>
              </Link>
            </>
          )}
        </nav>

        {/* Mobile — minimal action set */}
        <div className="md:hidden flex items-center gap-3">
          {status === "authenticated" ? (
            <Link
              href="/profile"
              className="text-sm font-semibold text-primary-ink bg-ink rounded-full px-4 py-2"
            >
              Profile
            </Link>
          ) : (
            <Link
              href="/signup"
              className="text-sm font-semibold text-primary-ink bg-ink rounded-full px-4 py-2"
            >
              Join
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
