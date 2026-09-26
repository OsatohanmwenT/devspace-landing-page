/**
 * Shared scroll smoothing, so every scroll-driven section (the opening, Question, StraightPath)
 * eases the same way: value += (target − value)(1 − e^(−dt/τ)). Short enough to stay under the
 * finger, long enough to glide.
 */
export const SCROLL_SMOOTHING_MS = 90;

/** Progress jumps bigger than this (anchor links, reloads mid-page) snap instead of gliding. */
const SNAP_JUMP = 0.5;

/**
 * Eases a value toward target() on animation frames and calls render() each frame until it settles.
 * Call kick() on scroll/resize; the loop sleeps when there's nothing left to do.
 */
export function smoothFollow(target: () => number, render: (value: number) => void, epsilon = 0.0005) {
  let value = target();
  let raf = 0;
  let last = 0;

  const tick = (now: number) => {
    const dt = Math.min(64, now - last);
    last = now;
    raf = 0;
    const t = target();
    value += (t - value) * (1 - Math.exp(-dt / SCROLL_SMOOTHING_MS));
    if (Math.abs(t - value) < epsilon || Math.abs(t - value) > SNAP_JUMP) value = t;
    render(value);
    if (value !== t) raf = requestAnimationFrame(tick);
  };

  return {
    /** Start easing toward the current target (no-op if already running). */
    kick() {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    },
    /** Jump straight to the target (first paint, reduced motion). */
    snap() {
      value = target();
      render(value);
    },
    cancel() {
      cancelAnimationFrame(raf);
      raf = 0;
    },
  };
}
