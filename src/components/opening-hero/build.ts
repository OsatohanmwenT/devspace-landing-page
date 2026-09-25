// Builds the modular skill-city SVG from a layout.
// Every module is its own <g class="mod"> with front/side/top faces and a detail layer,
// so the deconstruction can move each one independently (spec §7–8, §12).
import { cityLayout, type CityLayout } from './layout';
import type { Mode } from './config';
import { devyInner, DEVY_VIEWBOX, DEVY_FEET_Y, DEVY_CENTER_X } from './devy';

export type ModuleInfo = {
  id: string;
  struct: string;
  x: number;
  y: number;
  w: number;
  h: number;
  named?: string;
};

export type Route = { struct: string; d: string; len: number };

export type City = {
  layout: CityLayout;
  svg: string;
  modules: ModuleInfo[];
  routes: Route[];
  hoverRoute: Route;
  key: { x: number; y: number; w: number; h: number; startX: number; startY: number };
};

const n = (v: number) => Math.round(v * 10) / 10;

function polyLen(pts: [number, number][]) {
  let L = 0;
  for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return L;
}
const polyD = (pts: [number, number][]) => 'M' + pts.map((p) => `${n(p[0])} ${n(p[1])}`).join(' L');

export function buildCity(mode: Mode): City {
  const L = cityLayout(mode);
  const dx = L.depth * Math.cos(Math.PI / 6);
  const dy = -L.depth * Math.sin(Math.PI / 6);
  const modules: ModuleInfo[] = [];
  const out: string[] = [];
  let hoverTarget: Route | null = null;

  /** One module: front rect + side + top faces + detail markup (absolute coords). */
  function mod(id: string, struct: string, x: number, y: number, w: number, h: number, detail = '', opts: { side?: boolean; top?: boolean } = {}) {
    const side = opts.side !== false;
    const top = opts.top !== false;
    const named = L.named[id];
    modules.push({ id, struct, x, y, w, h, named });
    const sidePoly = `${n(x + w)},${n(y)} ${n(x + w + dx)},${n(y + dy)} ${n(x + w + dx)},${n(y + h + dy)} ${n(x + w)},${n(y + h)}`;
    const topPoly = `${n(x)},${n(y)} ${n(x + dx)},${n(y + dy)} ${n(x + w + dx)},${n(y + dy)} ${n(x + w)},${n(y)}`;
    out.push(
      `<g class="mod" id="m-${id}" data-struct="${struct}"${named ? ` data-named="${named}"` : ''}>` +
        (side ? `<polygon class="s" points="${sidePoly}"/>` : '') +
        (top ? `<polygon class="t" points="${topPoly}"/>` : '') +
        `<rect class="f" x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}"/>` +
        `<g class="d">${detail}</g>` +
        `</g>`,
    );
  }
  const line = (x1: number, y1: number, x2: number, y2: number, cls = '') =>
    `<line ${cls ? `class="${cls}" ` : ''}x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}"/>`;

  const routes: Route[] = [];
  const F = L.foundation;
  const jointY = F.top + F.keyH / 2;
  const keyCx = F.gapX + F.gapW / 2;
  const groundY = L.ground - 8;
  /** Signal route: keystone → along the foundation joint → (ground) → up the structure's interior line. */
  function addRoute(struct: string, sx: number, topY: number, extra: [number, number][] = []) {
    const pts: [number, number][] = [[keyCx, jointY]];
    const ax = Math.min(F.x1, Math.max(F.x0, sx));
    pts.push([ax, jointY]);
    if (sx < F.x0 || sx > F.x1) {
      pts.push([ax, groundY]);
      pts.push([sx, groundY]);
    }
    pts.push([sx, topY], ...extra);
    const r = { struct, d: polyD(pts), len: polyLen(pts) };
    routes.push(r);
    return r;
  }

  // ───────────── background plane ─────────────
  const bg: string[] = [];
  for (let gx = 0; gx <= L.W; gx += 48) bg.push(line(gx, 0, gx, L.gridBottom, 'grid'));
  for (let gy = 0; gy <= L.gridBottom; gy += 48) bg.push(line(0, gy, L.W, gy, 'grid'));
  for (const b of L.bgBlocks) bg.push(`<rect class="bgb" x="${b.x}" y="${b.top}" width="${b.w}" height="${L.ground - b.top}"/>`);

  // ───────────── structures (midground) ─────────────
  const S = L.structures;
  const hints: string[] = [];
  const acts: string[] = [];

  if (S.design) {
    const b = S.design;
    const W = b.x1 - b.x0 - dx;
    const n5 = mode === 'mobile' ? 4 : 5;
    const h = (b.base - b.top) / n5;
    const widths = [1, 0.84, 0.94, 0.72, 0.86];
    const offs = [0, 0.1, 0.02, 0.2, 0.06];
    for (let i = 0; i < n5; i++) {
      const w = W * widths[i];
      const x = b.x0 + W * offs[i];
      const y = b.base - (i + 1) * h;
      let det = `<rect x="${n(x + 8)}" y="${n(y + 8)}" width="${n(w - 16)}" height="${n(h - 16)}"/>`;
      if (i === 1) det += `<circle cx="${n(x + w / 2)}" cy="${n(y + h / 2)}" r="${n(Math.min(w, h) * 0.22)}"/>`;
      if (i === 0) for (let c = 1; c < 3; c++) det += line(x + (w * c) / 3, y + 8, x + (w * c) / 3, y + h - 8);
      if (i === 2) det += `<rect class="snap" x="${n(x + 18)}" y="${n(y + 18)}" width="${n(w * 0.4)}" height="${n(h - 36)}"/>`;
      mod(`design-m${i + 1}`, 'design', x, y, w, h, det);
      if (i === 1 || i === 3) hints.push(line(x - 22, y, x + w + dx + 22, y, 'hint guide'));
    }
    hints.push(line(b.x0 + W * 0.5, b.top - 40, b.x0 + W * 0.5, b.top - 4, 'hint guide'));
    addRoute('design', b.x0 + W * 0.3, b.top + h * 0.6);
  }

  if (S.data) {
    const b = S.data;
    const bw = (b.x1 - b.x0 - dx - 4 * 4) / 5;
    const fr = [0.45, 0.72, 1, 0.6];
    for (let i = 0; i < 4; i++) {
      const hh = (b.base - b.top) * fr[i];
      const x = b.x0 + i * (bw + 4);
      const y = b.base - hh;
      let det = '';
      // dot grid on the front face
      for (let yy = y + 10; yy < b.base - 6; yy += 12) det += `<circle cx="${n(x + bw / 2)}" cy="${n(yy)}" r="1"/>`;
      mod(`data-m${i + 1}`, 'data', x, y, bw, hh, det);
    }
    // unbuilt bar: dashed outline that fills when the signal arrives
    const x = b.x0 + 4 * (bw + 4);
    const hh = (b.base - b.top) * 0.86;
    hints.push(`<rect class="hint" x="${n(x)}" y="${n(b.base - hh)}" width="${n(bw)}" height="${n(hh)}"/>`);
    acts.push(`<rect class="act act-data" x="${n(x)}" y="${n(b.base - hh)}" width="${n(bw)}" height="${n(hh)}"/>`);
    addRoute('data', b.x0 + 2 * (bw + 4) + bw / 2, b.top + 12);
  }

  if (S.product) {
    const b = S.product;
    const vw = (b.x1 - b.x0 - dx) * 0.36;
    const H = b.base - b.top;
    const lx = b.x0;
    const rx = b.x1 - dx - vw;
    mod('product-m1', 'product', lx, b.base - H * 0.5, vw, H * 0.5, line(lx + vw / 2, b.base - H * 0.5 + 10, lx + vw / 2, b.base - 10));
    mod('product-m2', 'product', lx, b.base - H * 0.78, vw, H * 0.28);
    mod('product-m3', 'product', rx, b.base - H * 0.62, vw, H * 0.62, line(rx + vw / 2, b.base - H * 0.62 + 10, rx + vw / 2, b.base - 10));
    mod('product-m4', 'product', rx, b.top, vw, H * 0.38);
    const by = b.base - H * 0.7;
    const bh = H * 0.1;
    mod(
      'product-bridge',
      'product',
      lx + vw + dx,
      by,
      rx - lx - vw - dx,
      bh,
      `<circle class="node" cx="${n(lx + vw + dx)}" cy="${n(by + bh / 2)}" r="3.5"/><circle class="node" cx="${n(rx)}" cy="${n(by + bh / 2)}" r="3.5"/>`,
      { side: false },
    );
    hints.push(`<rect class="hint" x="${n(lx + vw + dx)}" y="${n(b.base - H * 0.34)}" width="${n(rx - lx - vw - dx)}" height="${n(bh * 0.8)}"/>`);
    acts.push(`<circle class="act act-product" cx="${n(rx)}" cy="${n(by + bh / 2)}" r="3.5"/>`);
    addRoute('product', lx + vw / 2, b.base - H * 0.5 + 12);
  }

  if (S.dev) {
    const b = S.dev;
    const W = b.x1 - b.x0 - dx;
    const nn = mode === 'mobile' ? 4 : 6;
    const h = (b.base - b.top) / nn;
    let topX = 0;
    let topW = 0;
    for (let i = 0; i < nn; i++) {
      const w = W - i * (W * 0.035);
      const x = b.x0 + (W - w) / 2;
      const y = b.base - (i + 1) * h;
      let det = line(x + w / 3, y + 4, x + w / 3, y + h - 4) + line(x + (2 * w) / 3, y + 4, x + (2 * w) / 3, y + h - 4);
      if (i >= nn - 2) {
        det = '';
        const lens = [0.55, 0.38, 0.62, 0.3, 0.48, 0.24];
        const ind = [0, 1, 1, 2, 1, 0];
        const lines = Math.min(6, Math.floor((h - 12) / 9));
        for (let k = 0; k < lines; k++) {
          const lx = x + 10 + ind[k] * 8;
          const ly = y + 10 + k * 9;
          det += line(lx, ly, lx + (w - 30) * lens[k], ly, 'code');
        }
      }
      if (i === nn - 1) {
        topX = x;
        topW = w;
      }
      mod(`dev-m${i + 1}`, 'dev', x, y, w, h, det);
    }
    // unbuilt floor + hoist line
    hints.push(`<rect class="hint" x="${n(topX)}" y="${n(b.top - h * 0.6)}" width="${n(topW)}" height="${n(h * 0.6)}"/>`);
    hints.push(line(topX + topW * 0.7, b.top - h * 0.6 - 46, topX + topW * 0.7, b.top - h * 0.6, 'hint hoist'));
    // cursor at the end of the top code stroke
    const cy = b.top + 10;
    const cx = topX + 10 + (topW - 30) * 0.55 + 4;
    acts.push(`<rect class="cursor" x="${n(cx)}" y="${n(cy - 6)}" width="${mode === 'mobile' ? 4 : 6}" height="${mode === 'mobile' ? 7 : 10}"/>`);
    const r = addRoute('dev', b.x0 + W * 0.16, b.top + 4);
    hoverTarget = { struct: 'hover', d: r.d + ` L${n(cx)} ${n(b.top + 4)}`, len: r.len + Math.abs(cx - (b.x0 + W * 0.16)) };
  }

  if (S.marketing) {
    const b = S.marketing;
    const W = b.x1 - b.x0 - dx;
    const h = (b.base - b.top) / 3;
    for (let i = 0; i < 3; i++) {
      const w = W * [1, 0.9, 0.8][i];
      const x = b.x0;
      const y = b.base - (i + 1) * h;
      const cy = y + h / 2;
      let det = '';
      [10, 18, 26].forEach((r, k) => {
        det += `<path class="${k === 2 ? 'dash' : ''}" d="M${n(x + 8)} ${n(cy - r)} A${r} ${r} 0 0 1 ${n(x + 8)} ${n(cy + r)}"/>`;
      });
      mod(`marketing-m${i + 1}`, 'marketing', x, y, w, h, det);
      if (i === 2) acts.push(`<circle class="act act-marketing" cx="${n(x + 8)}" cy="${n(cy)}" r="26"/>`);
    }
    addRoute('marketing', b.x0 + 8, b.top + h / 2);
  }

  // ───────────── foundation + keystone ─────────────
  const fb = L.ground;
  const g0 = F.gapX;
  const g1 = F.gapX + F.gapW;
  const a = F.x0 + (g0 - F.x0) * 0.5;
  const c = g1 + (F.x1 - g1) * 0.5;
  const joints = (x0: number, x1: number, y0: number) => {
    let s = '';
    for (let x = x0 + 48; x < x1 - 8; x += 48) s += line(x, y0 + 4, x, fb - 4);
    return s;
  };
  mod('found-m1', 'found', F.x0, F.top, a - F.x0, fb - F.top, joints(F.x0, a, F.top), { side: false });
  mod('found-m2', 'found', a, F.top, g0 - a, fb - F.top, joints(a, g0, F.top), { side: false });
  mod('found-base', 'found', g0, F.top + F.keyH, g1 - g0, fb - F.top - F.keyH, '', { side: false });
  mod('found-m3', 'found', g1, F.top, c - g1, fb - F.top, joints(g1, c, F.top), { side: false });
  mod('found-m4', 'found', c, F.top, F.x1 - c, fb - F.top, joints(c, F.x1, F.top));
  const joint = `<line class="joint" x1="${F.x0}" y1="${n(jointY)}" x2="${F.x1}" y2="${n(jointY)}"/>`;
  const gapHint = `<rect class="hint gap" x="${g0}" y="${F.top}" width="${F.gapW}" height="${F.keyH}"/>`;

  // crates (foreground action area; kept in the midground plane so the keystone stays aligned)
  const crates = L.crates
    .map((c2, i) => `<g class="crate"><rect x="${c2.x}" y="${c2.y}" width="${c2.w}" height="${c2.h}"/>${line(c2.x, c2.y, c2.x + c2.w, c2.y + c2.h)}${i === 0 ? line(c2.x + c2.w, c2.y, c2.x, c2.y + c2.h) : ''}</g>`)
    .join('');

  // keystone: sits on the first crate at load, installed into the gap by Devy
  const c0 = L.crates[0];
  const key = { x: g0, y: F.top, w: F.gapW, h: F.keyH, startX: c0.x + (c0.w - F.gapW) / 2, startY: c0.y - F.keyH };
  modules.push({ id: 'key', struct: 'found', x: key.x, y: key.y, w: key.w, h: key.h, named: L.named['key'] });
  const keyMarkup =
    `<g class="mod key" id="m-key" data-struct="found" data-named="${L.named['key']}">` +
    `<g class="key-inner"><polygon class="t" points="${n(g0)},${n(F.top)} ${n(g0 + dx)},${n(F.top + dy)} ${n(g1 + dx)},${n(F.top + dy)} ${n(g1)},${n(F.top)}"/>` +
    `<rect class="f" x="${g0}" y="${F.top}" width="${F.gapW}" height="${F.keyH}"/>` +
    `<line class="keyjoint" x1="${g0 + 3}" y1="${n(jointY)}" x2="${g1 - 3}" y2="${n(jointY)}"/></g></g>`;

  // Devy: nested svg positioned so his feet sit on the foundation
  const dh = L.devy.h;
  const sc = dh / DEVY_VIEWBOX.h;
  const dwid = DEVY_VIEWBOX.w * sc;
  const dxv = L.devy.cx - (DEVY_CENTER_X - DEVY_VIEWBOX.x) * sc;
  const dyv = L.devy.feetY - (DEVY_FEET_Y - DEVY_VIEWBOX.y) * sc;
  const devy = `<g class="hero-devy"><svg class="devy" x="${n(dxv)}" y="${n(dyv)}" width="${n(dwid)}" height="${n(dh)}" viewBox="${DEVY_VIEWBOX.x} ${DEVY_VIEWBOX.y} ${DEVY_VIEWBOX.w} ${DEVY_VIEWBOX.h}" overflow="visible">${devyInner('hd')}</svg></g>`;

  const beam = L.beam
    ? `<g class="beam" transform="rotate(${L.beam.rot} ${L.beam.x + L.beam.w / 2} ${L.beam.y})"><rect x="${L.beam.x}" y="${L.beam.y}" width="${L.beam.w}" height="${L.beam.h}"/>${Array.from({ length: 8 }, (_, i) => line(L.beam!.x + i * (L.beam!.w / 8), L.beam!.y, L.beam!.x + (i + 1) * (L.beam!.w / 8), L.beam!.y + L.beam!.h)).join('')}</g>`
    : '';

  // signal layer (moving 60-unit segments), drawn above everything in the midground
  const sig = routes
    .map((r) => `<path class="sig" data-struct="${r.struct}" d="${r.d}" pathLength="1"/>`)
    .join('');
  const hover = hoverTarget ? `<path class="sig sig-hover" d="${hoverTarget.d}" pathLength="1"/>` : '';

  const svg = `
  <g class="plane plane-bg">${bg.join('')}</g>
  <g class="plane plane-mid">
    <g class="hints">${hints.join('')}${gapHint}</g>
    <g class="mods">${out.join('')}</g>
    <g class="acts">${acts.join('')}</g>
    ${joint}
    ${crates}
    ${devy}
    ${keyMarkup}
    <g class="sigs">${sig}${hover}</g>
  </g>
  <g class="plane plane-fg">${beam}</g>`;

  return {
    layout: L,
    svg,
    modules,
    routes,
    hoverRoute: hoverTarget ?? routes[0],
    key,
  };
}
