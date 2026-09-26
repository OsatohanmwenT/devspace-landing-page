// Hero-only subset of the devspace-opening prototype's config.
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";

gsap.registerPlugin(CustomEase);

// Named easings from the spec
export const EASE = {
  arrive: CustomEase.create("arrive", "M0,0 C0.16,1 0.3,1 1,1"),
  move: CustomEase.create("move", "M0,0 C0.65,0 0.35,1 1,1"),
  leave: CustomEase.create("leave", "M0,0 C0.7,0 0.84,0 1,1"),
};

export type Mode = "desktop" | "tablet" | "mobile";

export function getMode(w = window.innerWidth): Mode {
  if (w < 768) return "mobile";
  if (w < 1200) return "tablet";
  return "desktop";
}

/** Scroll budget in vh, measured from the top of the opening. Every stage is scrubbed by scroll:
 *  t1 (the city comes apart) → frag (the path, p 0 → 1) → t2 (pull back, drain to paper) → unpin. */
export function budget(mode: Mode) {
  const mobile = mode === "mobile";
  return {
    // Give the settled city time to be read before it begins to come apart.
    t1Start: 120,
    // Copy departure and the city deconstruction need distinct room to land.
    t1End: mobile ? 250 : 260,
    // The learner path is the longest beat: each checkpoint needs time to register.
    fragEnd: mobile ? 530 : 610,
    // Leave a full final beat for the path to settle into the paper handoff.
    t2End: mobile ? 630 : 750,
  };
}

export const prefersReduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Landscape phones under 500px tall use the static (reduced-motion) layout. */
export const isShortLandscape = () => window.innerHeight < 500 && window.innerWidth > window.innerHeight;

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/** Deterministic pseudo-random in [0,1) from an integer seed. */
export function rand(seed: number) {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}
