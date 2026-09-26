// Fragmentation scene geometry per breakpoint (spec §14–16, §25).
import type { Mode } from './config';
import type { CardKey } from './artefacts';

export type Pt = [number, number];
export type CP = 'WATCH' | 'SAVE' | 'ASK' | 'START' | 'SWITCH' | 'REPEAT';
export type CardPlace = {
  key: CardKey;
  x: number; y: number; w: number;
  cp: CP;
  /** 'named' cards come out of a city module and sit dormant at 25% until reached */
  named?: boolean;
  /** extra delay after the checkpoint is reached, in path units */
  after?: number;
  rot?: number;
  z?: number;
  slide?: boolean;
};
export type SceneGeo = {
  W: number; H: number;
  /** visible horizontal window in scene units (tablet crops the desktop scene) */
  viewX0: number; viewW: number;
  points: Pt[];
  cps: { cp: CP; at: Pt; side: 'l' | 'r' | 'c' }[];
  loop: { cx: number; cy: number; r: number };
  cards: CardPlace[];
  devyH: number;
  pathOnTop: boolean;
};

function loopPts(cx: number, cy: number, r: number): Pt[] {
  const pts: Pt[] = [];
  for (let a = 180; a <= 540; a += 45) {
    const t = (a * Math.PI) / 180;
    pts.push([cx + r * Math.cos(t), cy + r * Math.sin(t)]);
  }
  return pts;
}

export function sceneGeo(mode: Mode): SceneGeo {
  if (mode === 'mobile') {
    const loop = { cx: 230, cy: 1310, r: 65 };
    return {
      W: 390, H: 1600, viewX0: 0, viewW: 390,
      points: [[195, 40], [310, 250], [80, 560], [340, 780], [250, 870], [300, 1230], [350, 1340], [50, 1420], ...loopPts(loop.cx, loop.cy, loop.r), [270, 1470]],
      cps: [
        { cp: 'WATCH', at: [310, 250], side: 'r' },
        { cp: 'SAVE', at: [80, 560], side: 'l' },
        { cp: 'ASK', at: [250, 870], side: 'r' },
        { cp: 'START', at: [300, 1230], side: 'r' },
        { cp: 'SWITCH', at: [50, 1420], side: 'r' },
        { cp: 'REPEAT', at: [loop.cx, loop.cy], side: 'c' },
      ],
      loop,
      cards: [
        { key: 'video', x: 16, y: 168, w: 190, cp: 'WATCH', named: true },
        { key: 'roadmap', x: 172, y: 470, w: 196, cp: 'SAVE' },
        { key: 'thread', x: 12, y: 640, w: 164, cp: 'SAVE', after: 30 },
        { key: 'chat', x: 16, y: 840, w: 200, cp: 'ASK', named: true },
        { key: 'chat2', x: 106, y: 960, w: 160, cp: 'ASK', after: 30, z: 2 },
        { key: 'snippet', x: 12, y: 1020, w: 164, cp: 'START', after: 20 },
        { key: 'course', x: 16, y: 1130, w: 196, cp: 'START', named: true },
        { key: 'repo', x: 16, y: 1262, w: 150, cp: 'START', after: 40 },
        { key: 'video2', x: 24, y: 1122, w: 196, cp: 'SWITCH', slide: true, z: 3 },
        { key: 'design', x: 12, y: 1446, w: 176, cp: 'SWITCH', named: true, after: 10 },
        { key: 'plan', x: 204, y: 1490, w: 150, cp: 'REPEAT', rot: 3 },
        { key: 'tabs', x: 196, y: 1392, w: 170, cp: 'REPEAT', after: 20, rot: -2 },
        { key: 'sticky', x: 298, y: 1052, w: 84, cp: 'REPEAT', after: 40, rot: 4, z: 4 },
      ],
      devyH: 48,
      pathOnTop: true,
    };
  }
  const loop = { cx: 860, cy: 1420, r: 120 };
  const g: SceneGeo = {
    W: 1440, H: 2000, viewX0: 0, viewW: 1440,
    points: [[760, 80], [1040, 360], [500, 700], [1160, 900], [880, 1000], [1040, 1360], [1160, 1480], [480, 1520], ...loopPts(loop.cx, loop.cy, loop.r), [940, 1560]],
    cps: [
      { cp: 'WATCH', at: [1040, 360], side: 'r' },
      { cp: 'SAVE', at: [500, 700], side: 'l' },
      { cp: 'ASK', at: [880, 1000], side: 'r' },
      { cp: 'START', at: [1040, 1360], side: 'r' },
      { cp: 'SWITCH', at: [480, 1520], side: 'l' },
      { cp: 'REPEAT', at: [loop.cx, loop.cy], side: 'c' },
    ],
    loop,
    cards: [
      { key: 'video', x: 1080, y: 378, w: 260, cp: 'WATCH', named: true },
      { key: 'roadmap', x: 220, y: 718, w: 240, cp: 'SAVE', named: true },
      { key: 'thread', x: 196, y: 850, w: 240, cp: 'SAVE', named: true, after: 30 },
      { key: 'chat', x: 920, y: 1018, w: 260, cp: 'ASK', named: true },
      { key: 'chat2', x: 1104, y: 1104, w: 200, cp: 'ASK', after: 40, z: 2 },
      { key: 'course', x: 1100, y: 1180, w: 240, cp: 'START', named: true },
      { key: 'repo', x: 1130, y: 1345, w: 240, cp: 'START', after: 40 },
      { key: 'snippet', x: 560, y: 1170, w: 220, cp: 'START', after: 80 },
      { key: 'video2', x: 1116, y: 1164, w: 240, cp: 'SWITCH', slide: true, z: 3 },
      { key: 'design', x: 200, y: 1538, w: 240, cp: 'SWITCH', named: true, after: 10 },
      { key: 'plan', x: 1180, y: 1560, w: 150, cp: 'REPEAT', rot: 3, z: 4 },
      { key: 'tabs', x: 748, y: 1584, w: 200, cp: 'REPEAT', after: 30, rot: -2 },
      { key: 'sticky', x: 596, y: 1366, w: 120, cp: 'REPEAT', after: 60, rot: -4 },
    ],
    devyH: 64,
    pathOnTop: false,
  };
  if (mode === 'tablet') {
    g.viewX0 = 170;
    g.viewW = 1200;
    g.devyH = 60;
  }
  return g;
}

/** Centripetal-ish Catmull-Rom through points → cubic Bézier path data. */
export function smoothPath(pts: Pt[]): string {
  const f = (v: number) => Math.round(v * 10) / 10;
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const t = 1 / 6;
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) * t, p1[1] + (p2[1] - p0[1]) * t];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) * t, p2[1] - (p3[1] - p1[1]) * t];
    d += ` C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d;
}
