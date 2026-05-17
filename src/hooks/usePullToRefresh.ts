/**
 * usePullToRefresh — mobile pull-down-to-refresh gesture hook.
 *
 * Attach the returned `containerRef` to the scrollable container (or the
 * page wrapper). When the user pulls down more than `threshold` pixels from
 * the very top of the page, `onRefresh` is called once on release.
 *
 * Only activates on touch devices (skipped entirely on desktop).
 */

import { useEffect, useRef, useState } from "react";

interface Options {
  /** Pixels of pull needed to trigger the refresh. Default: 70 */
  threshold?: number;
  /** Called once when the user releases after pulling past the threshold */
  onRefresh: () => void;
}

interface PullToRefreshResult<T extends HTMLElement> {
  containerRef: React.RefObject<T>;
  /** How far (0–threshold) the user has currently pulled, for showing a spinner */
  pullDistance: number;
  /** True while the user is actively pulling past the threshold */
  isPulling: boolean;
}

export function usePullToRefresh<T extends HTMLElement = HTMLDivElement>(
  { threshold = 70, onRefresh }: Options,
): PullToRefreshResult<T> {
  const containerRef = useRef<T>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);

  // Stable refs so the touch handlers never close over stale state
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;
  const thresholdRef = useRef(threshold);
  thresholdRef.current = threshold;

  useEffect(() => {
    // Only activate on actual touch devices
    if (typeof window === "undefined" || !("ontouchstart" in window)) return;

    // Respect prefers-reduced-motion — skip the visual pull indicator
    const prefersReduced =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let startY = 0;
    let currentY = 0;
    let active = false;

    function isAtTop(): boolean {
      // Check both window scroll and the container element's scroll
      if (window.scrollY > 0) return false;
      const el = containerRef.current;
      if (el && el.scrollTop > 0) return false;
      return true;
    }

    function handleTouchStart(e: TouchEvent) {
      if (!isAtTop()) return;
      startY = e.touches[0].clientY;
      active = true;
    }

    function handleTouchMove(e: TouchEvent) {
      if (!active) return;
      currentY = e.touches[0].clientY;
      const delta = currentY - startY;
      if (delta <= 0) {
        if (!prefersReduced) setPullDistance(0);
        setIsPulling(false);
        return;
      }
      // Resist the pull with a sqrt curve so it feels natural
      const resistance = Math.sqrt(delta) * 4;
      const clamped = Math.min(resistance, thresholdRef.current * 1.5);
      if (!prefersReduced) setPullDistance(clamped);
      setIsPulling(clamped >= thresholdRef.current);
    }

    function handleTouchEnd() {
      if (!active) return;
      active = false;
      const delta = currentY - startY;
      // Use raw delta (not the visual resistance value) for trigger check
      if (delta >= thresholdRef.current) {
        onRefreshRef.current();
      }
      setPullDistance(0);
      setIsPulling(false);
      startY = 0;
      currentY = 0;
    }

    const el = containerRef.current ?? document;
    el.addEventListener("touchstart", handleTouchStart as EventListener, { passive: true });
    el.addEventListener("touchmove", handleTouchMove as EventListener, { passive: true });
    el.addEventListener("touchend", handleTouchEnd as EventListener);
    el.addEventListener("touchcancel", handleTouchEnd as EventListener);

    return () => {
      el.removeEventListener("touchstart", handleTouchStart as EventListener);
      el.removeEventListener("touchmove", handleTouchMove as EventListener);
      el.removeEventListener("touchend", handleTouchEnd as EventListener);
      el.removeEventListener("touchcancel", handleTouchEnd as EventListener);
    };
  }, []); // stable — all mutable values go through refs

  return { containerRef, pullDistance, isPulling };
}
