"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

function subscribeReducedMotion(callback) {
  if (typeof window === "undefined") return () => {};
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

/**
 * Custom hook to trigger scroll animations once an element enters the viewport.
 * - Plays entrance animations ONCE (unobserves and disconnects immediately upon trigger).
 * - Respects prefers-reduced-motion (instantly returns isVisible=true).
 * - Avoids scroll hijacking and unnecessary re-renders.
 */
export function useScrollReveal({ threshold = 0.15, rootMargin = "0px 0px -50px 0px" } = {}) {
  const ref = useRef(null);
  const [isIntersected, setIsIntersected] = useState(false);

  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  useEffect(() => {
    if (prefersReducedMotion) return;

    const element = ref.current;
    if (!element) return;

    if (typeof IntersectionObserver === "undefined") {
      const raf = requestAnimationFrame(() => setIsIntersected(true));
      return () => cancelAnimationFrame(raf);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersected(true);
          observer.unobserve(entry.target);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin, prefersReducedMotion]);

  const isVisible = prefersReducedMotion || isIntersected;

  return { ref, isVisible, prefersReducedMotion };
}
