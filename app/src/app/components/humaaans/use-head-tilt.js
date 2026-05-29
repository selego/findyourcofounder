"use client";

import { useEffect } from "react";

const YAW = 10;
const PITCH = 4;
const GAZE = 2;

// Mutates head + eyes <g> DOM nodes directly each RAF. No React state, no
// re-renders, no CSS transition — the head tracks the cursor in real time.
export function useHeadTilt(panelRef, headRef, eyesRef) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;

    const onMove = (event) => {
      const panel = panelRef.current;
      if (!panel) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = panel.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = Math.max(-1, Math.min(1, (event.clientX - cx) / (rect.width / 2)));
        const dy = Math.max(-1, Math.min(1, (event.clientY - cy) / (rect.height / 2)));

        const ry = dx * YAW;
        const rx = dy * -PITCH;
        const gazeX = dx * GAZE;
        const gazeY = dy * GAZE;

        if (headRef.current) {
          headRef.current.style.transform = `rotate(${ry}deg) translate(0, ${-rx * 0.25}px)`;
        }
        if (eyesRef.current) {
          eyesRef.current.style.transform = `translate(${gazeX}px, ${gazeY}px)`;
        }
      });
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [panelRef, headRef, eyesRef]);
}
