"use client";

import { useEffect } from "react";
import Lenis from "@studio-freight/lenis";

/**
 * Wraps the app in a Lenis smooth-scroll instance.
 * Touch is enabled with a tuned multiplier so tablets/mobiles get smooth,
 * jump-free scrolling without the lag that comes from over-damping touch input.
 */
export default function LenisProvider({ children }) {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,
      // Slightly reduce touch sensitivity so iPad/mobile taps + swipes stay natural
      touchMultiplier: 1.5,
      wheelMultiplier: 1,
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
