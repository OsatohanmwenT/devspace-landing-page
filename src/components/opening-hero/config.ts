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

export const prefersReduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Deterministic pseudo-random in [0,1) from an integer seed. */
export function rand(seed: number) {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}
