"use client";

// Lenis smooth scroll provider.
// Initializes one Lenis instance on mount and drives it from rAF.
// Defaults are tuned for the FYC feel — smooth but not laggy. Adjust
// `lerp` (higher = snappier, lower = more drift) if it feels off.

import { useEffect } from "react";
import Lenis from "lenis";

export function SmoothScroll({ children }) {
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.1, // 0.05–0.15 is the FYC sweet spot
      smoothWheel: true,
      // Touch devices keep native scroll for predictable mobile feel.
      smoothTouch: false,
    });

    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return children;
}
