// Devy rig built from the supplied devy.svg.
// The body (incl. arms) is ONE fused shape by design: it is never re-rigged.
// Only eyes (white/iris/pupil), brows and feet are grouped so they can move independently.
import paths from './devy-paths.json';

type P = { f: string; d: string };
const p = paths as P[];

// Index map of devy.svg paths (see asset notes in README)
const BODY = [0, 1, 10, 11];
const MOUTH = [12, 13, 14, 15, 16, 17, 18];
const EYE_L = { white: 2, iris: [3, 4] };
const EYE_R = { white: 5, iris: [6, 7] };
const BROW_L = 8;
const BROW_R = 9;
const FOOT_L = [19, 20];
const FOOT_R = [21];

/** Crop of the original 1024 canvas that tightly holds Devy (feet end at y≈842). */
export const DEVY_VIEWBOX = { x: 226, y: 136, w: 572, h: 712 };
/** Where the feet touch the ground, in Devy units. */
export const DEVY_FEET_Y = 842;
export const DEVY_CENTER_X = 512;
/** Eye tops, used as the blink pivot. */
export const DEVY_EYE_TOP = 402;

const path = (i: number) => `<path fill="${p[i].f}" d="${p[i].d}"/>`;

/**
 * Returns the inner markup of Devy (no outer <svg>). `id` makes clip ids unique per instance.
 */
export function devyInner(id: string): string {
  return `
  <defs>
    <clipPath id="${id}-cl"><path d="${p[EYE_L.white].d}"/></clipPath>
    <clipPath id="${id}-cr"><path d="${p[EYE_R.white].d}"/></clipPath>
  </defs>
  <g class="dv-lean">
    <g class="dv-foot dv-foot-l">${FOOT_L.map(path).join('')}</g>
    <g class="dv-foot dv-foot-r">${FOOT_R.map(path).join('')}</g>
    <g class="dv-upper">
      <g class="dv-body">${BODY.map(path).join('')}</g>
      <g class="dv-eyes">
        <g class="dv-eye dv-eye-l">
          ${path(EYE_L.white)}
          <g clip-path="url(#${id}-cl)"><g class="dv-pupil">${EYE_L.iris.map(path).join('')}</g></g>
        </g>
        <g class="dv-eye dv-eye-r">
          ${path(EYE_R.white)}
          <g clip-path="url(#${id}-cr)"><g class="dv-pupil">${EYE_R.iris.map(path).join('')}</g></g>
        </g>
      </g>
      <g class="dv-brow dv-brow-l">${path(BROW_L)}</g>
      <g class="dv-brow dv-brow-r">${path(BROW_R)}</g>
      <g class="dv-mouth">${MOUTH.map(path).join('')}</g>
    </g>
  </g>`;
}

export function devySvg(id: string, cls = ''): string {
  const v = DEVY_VIEWBOX;
  return `<svg class="devy ${cls}" viewBox="${v.x} ${v.y} ${v.w} ${v.h}" aria-hidden="true" focusable="false">${devyInner(id)}</svg>`;
}

/** Handles to the animatable parts of one Devy instance. */
export type DevyRig = {
  root: SVGElement;
  lean: SVGGElement;
  upper: SVGGElement;
  eyes: SVGGElement;
  pupils: SVGGElement[];
  browL: SVGGElement;
  browR: SVGGElement;
  footL: SVGGElement;
  footR: SVGGElement;
};

export function rig(root: SVGElement): DevyRig {
  const q = <T extends Element>(s: string) => root.querySelector(s) as unknown as T;
  return {
    root,
    lean: q('.dv-lean'),
    upper: q('.dv-upper'),
    eyes: q('.dv-eyes'),
    pupils: Array.from(root.querySelectorAll('.dv-pupil')) as SVGGElement[],
    browL: q('.dv-brow-l'),
    browR: q('.dv-brow-r'),
    footL: q('.dv-foot-l'),
    footR: q('.dv-foot-r'),
  };
}
