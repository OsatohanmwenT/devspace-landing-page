// Skill-city compositions per breakpoint (spec §7–8, §25).
// All numbers are design units; the SVG is scaled to viewport width and anchored to the bottom.
import type { Mode } from './config';

export type Box = { x0: number; x1: number; top: number; base: number };
export type CityLayout = {
  W: number;
  H: number;
  depth: number; // side-face depth (30°)
  ground: number;
  foundation: { x0: number; x1: number; top: number; keyH: number; gapX: number; gapW: number };
  devy: { cx: number; feetY: number; h: number };
  crates: { x: number; y: number; w: number; h: number }[];
  structures: {
    design?: Box;
    data?: Box;
    product?: Box;
    dev?: Box;
    marketing?: Box;
  };
  bgBlocks: { x: number; w: number; top: number }[];
  gridBottom: number;
  beam?: { x: number; y: number; w: number; h: number; rot: number };
  /** which module ids become which artefact card */
  named: Record<string, string>;
  /** protected reading zone in design units, used by tests/debug overlay */
};

export function cityLayout(mode: Mode): CityLayout {
  if (mode === 'mobile') {
    return {
      W: 390,
      H: 844,
      depth: 12,
      ground: 844,
      foundation: { x0: 40, x1: 350, top: 790, keyH: 18, gapX: 112, gapW: 40 },
      devy: { cx: 195, feetY: 790, h: 60 },
      crates: [
        { x: 232, y: 758, w: 36, h: 32 },
        { x: 268, y: 770, w: 26, h: 20 },
      ],
      structures: {
        design: { x0: -46, x1: 64, top: 590, base: 844 },
        dev: { x0: 324, x1: 434, top: 584, base: 844 },
      },
      bgBlocks: [
        { x: 60, w: 50, top: 470 },
        { x: 150, w: 40, top: 520 },
        { x: 250, w: 60, top: 480 },
      ],
      gridBottom: 520,
      named: { 'dev-m4': 'video', key: 'chat', 'design-m2': 'design', 'dev-m2': 'course' },
    };
  }
  if (mode === 'tablet') {
    return {
      W: 1024,
      H: 900,
      depth: 16,
      ground: 900,
      foundation: { x0: 300, x1: 724, top: 830, keyH: 22, gapX: 492, gapW: 48 },
      devy: { cx: 578, feetY: 830, h: 68 },
      crates: [
        { x: 620, y: 788, w: 42, h: 42 },
        { x: 662, y: 802, w: 30, h: 28 },
      ],
      structures: {
        design: { x0: 14, x1: 186, top: 400, base: 900 },
        data: { x0: 206, x1: 326, top: 660, base: 900 },
        product: { x0: 700, x1: 820, top: 650, base: 900 },
        dev: { x0: 840, x1: 1010, top: 380, base: 900 },
      },
      bgBlocks: [
        { x: 90, w: 70, top: 240 },
        { x: 260, w: 60, top: 330 },
        { x: 430, w: 80, top: 300 },
        { x: 600, w: 60, top: 350 },
        { x: 760, w: 90, top: 260 },
        { x: 930, w: 60, top: 310 },
      ],
      gridBottom: 540,
      beam: { x: -50, y: 800, w: 190, h: 20, rot: -9 },
      named: { 'dev-m6': 'video', 'product-bridge': 'roadmap', key: 'chat', 'data-m3': 'course', 'design-m3': 'design' },
    };
  }
  return {
    W: 1440,
    H: 900,
    depth: 18,
    ground: 900,
    foundation: { x0: 432, x1: 1008, top: 828, keyH: 22, gapX: 749, gapW: 48 },
    devy: { cx: 835, feetY: 828, h: 76 },
    crates: [
      { x: 872, y: 786, w: 46, h: 42 },
      { x: 918, y: 800, w: 32, h: 28 },
    ],
    structures: {
      design: { x0: 40, x1: 290, top: 262, base: 900 },
      data: { x0: 318, x1: 468, top: 600, base: 900 },
      product: { x0: 968, x1: 1118, top: 590, base: 900 },
      dev: { x0: 1146, x1: 1372, top: 262, base: 900 },
      marketing: { x0: 1392, x1: 1500, top: 400, base: 900 },
    },
    bgBlocks: [
      { x: 120, w: 90, top: 170 },
      { x: 330, w: 70, top: 300 },
      { x: 470, w: 110, top: 220 },
      { x: 640, w: 70, top: 330 },
      { x: 780, w: 100, top: 190 },
      { x: 950, w: 80, top: 290 },
      { x: 1110, w: 110, top: 200 },
      { x: 1300, w: 80, top: 250 },
    ],
    gridBottom: 540,
    beam: { x: -60, y: 772, w: 240, h: 22, rot: -8 },
    named: {
      'dev-m6': 'video',
      'product-bridge': 'roadmap',
      'marketing-m2': 'thread',
      key: 'chat',
      'data-m3': 'course',
      'design-m3': 'design',
    },
  };
}
