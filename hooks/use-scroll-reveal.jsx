"use client";

import { useEffect, useState, useCallback, useSyncExternalStore } from "react";

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
 * - Uses a callback ref so dynamic mounting/route changes re-bind automatically.
 * - Respects prefers-reduced-motion (instantly returns isVisible=true).
 * - Avoids scroll hijacking and unnecessary re-renders.
 */
export function useScrollReveal({ threshold = 0.1, rootMargin = "50px" } = {}) {
  const [node, setNode] = useState(null);
  const [isIntersected, setIsIntersected] = useState(false);

  const ref = useCallback((element) => {
    setNode(element);
  }, []);

  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  useEffect(() => {
    if (prefersReducedMotion) return;
    if (!node) return;

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

    observer.observe(node);

    return () => observer.disconnect();
  }, [node, threshold, rootMargin, prefersReducedMotion]);

  const isVisible = prefersReducedMotion || isIntersected;

  return { ref, isVisible, prefersReducedMotion };
}
