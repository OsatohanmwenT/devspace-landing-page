// Triggered timelines (Tier 1, spec §21).
// T1: hero exit → deconstruction → transformation (§11–13). T2: pull-back → drain → payoff (§20).
// Both are time-based, run to a designed rest state, and reverse only from reverse intent.
import gsap from 'gsap';
import { EASE, rand, type Mode } from './config';
import type { HeroEngine as Hero } from './engine';
import type { Scene } from './scene';
import type { CardKey } from './artefacts';

/** Stage elements the transitions animate. */
export type StageDom = { frag: HTMLElement; scrim: HTMLElement; narr: HTMLElement; payoff: HTMLElement };

const EXIT = 0.7, HOLD = 0.12, DECON = 1.0, XFORM = 0.8;
const tDecon = EXIT + HOLD;
const tXform = tDecon + DECON;

/**
 * Build T1 from the CURRENT geometry. Assumes the hero is at rest (keystone locked)
 * and the scene camera sits at p = 0.
 */
export function createT1(hero: Hero, scene: Scene, mode: Mode, dom: StageDom) {
  const svg = hero.svg;
  const vh = innerHeight;
  const { frag, scrim } = dom;
  const K = hero.city.key;
  const kc = { x: K.x + K.w / 2, y: K.y + K.h / 2 };
  const ks = hero.toScreen(kc.x, kc.y);
  const camS = 1.1;
  const tl = gsap.timeline({ paused: true });

  // ── Exit (700ms): copy leaves as one group; camera lifts the city to centre on the keystone
  tl.to(hero.copy, { y: -48, autoAlpha: 0, duration: 0.35, ease: EASE.leave }, 0)
    .to(hero.wrap, { x: -(camS - 1) * ks.x, y: vh * 0.5 - camS * ks.y, scale: camS, transformOrigin: '0 0', duration: 0.55, ease: EASE.move }, 0.15)
    .to(svg.querySelectorAll('.plane-bg, .plane-fg'), { opacity: 0, duration: 0.3, ease: EASE.leave }, 0.4);

  // ── Deconstruction (1000ms): connection fails first, modules drift loose from the keystone outward
  const D = tDecon;
  tl.to(svg.querySelector('.joint'), { stroke: 'rgba(214,210,200,1)', duration: 0.15, ease: EASE.leave }, D)
    .to(hero.keyInner, { y: -6, rotation: 3, duration: 0.25, ease: EASE.move }, D + 0.15)
    .to(hero.devy.browR, { y: -28, duration: 0.25, ease: EASE.arrive }, D + 0.15)
    .to(hero.devyG, { x: '+=6', duration: 0.25, ease: EASE.arrive }, D + 0.15)
    .to(svg.querySelectorAll('.hints, .acts, .crate, .sigs, .joint'), { opacity: 0, duration: 0.4, ease: EASE.leave }, D + 0.2);

  // structure centres
  const centres: Record<string, { x: number; y: number; top: number; base: number }> = {};
  for (const m of hero.city.modules) {
    const c = (centres[m.struct] ??= { x: 0, y: 0, top: Infinity, base: -Infinity, n: 0 } as never);
    (c as unknown as { n: number }).n++;
    c.x += m.x + m.w / 2; c.y += m.y + m.h / 2;
    c.top = Math.min(c.top, m.y); c.base = Math.max(c.base, m.y + m.h);
  }
  for (const k in centres) { const c = centres[k] as unknown as { x: number; y: number; n: number }; c.x /= c.n; c.y /= c.n; }

  const maxDrift = mode === 'mobile' ? 90 : 160;
  const minDrift = mode === 'mobile' ? 24 : 40;
  const mods = hero.city.modules;
  mods.forEach((m, i) => {
    const el = svg.querySelector(`#m-${m.id}`) as SVGGElement;
    const cx = m.x + m.w / 2, cy = m.y + m.h / 2;
    const c = centres[m.struct];
    let vx = cx - c.x, vy = cy - c.y - 20;
    if (m.id === 'key') { vx = 0; vy = -1; }
    const len = Math.hypot(vx, vy) || 1;
    vx /= len; vy /= len;
    const hf = Math.max(0, Math.min(1, (c.base - cy) / Math.max(1, c.base - c.top)));
    const dist = minDrift + (maxDrift - minDrift) * (0.35 + 0.65 * hf) * (0.8 + rand(i + 3) * 0.4);
    const dx = vx * dist;
    const dy = Math.min(20, vy * dist);
    const rot = (rand(i + 11) - 0.5) * 12;
    const delay = Math.min(0.18, Math.hypot(cx - kc.x, cy - kc.y) * 0.00008);
    const target = m.id === 'key' ? hero.keyInner : el;
    if (m.id === 'key') tl.to(target, { y: -28, x: -10, rotation: 6, duration: 0.6, ease: EASE.move }, D + 0.4);
    else tl.to(target, { x: dx, y: dy, rotation: rot, svgOrigin: `${cx} ${cy}`, duration: 0.75, ease: EASE.move }, D + 0.25 + delay);
    const faces = el.querySelectorAll('.s, .t');
    const det = el.querySelectorAll('.d');
    if (faces.length) tl.to(faces, { opacity: 0, duration: 0.6, ease: EASE.move }, D + 0.4);
    if (det.length) tl.to(det, { opacity: 0.3, duration: 0.6, ease: EASE.move }, D + 0.4);
  });

  // ── Transformation (800ms): six named modules become cards and fly to their checkpoints
  // Measure module rects at rest point B by rendering the timeline there, then rewind.
  frag.style.visibility = 'hidden';
  tl.time(tXform - 0.001);
  const modRects: Record<string, DOMRect> = {};
  for (const m of mods) if (m.named) modRects[m.named] = (svg.querySelector(`#m-${m.id} .f`) as SVGRectElement).getBoundingClientRect();
  const devyRect = (svg.querySelector('.hero-devy svg') as SVGSVGElement).getBoundingClientRect();
  tl.time(0);

  const X = tXform;
  tl.set(frag, { visibility: 'visible' }, X);
  const s = scene.s;
  for (const [key, mr] of Object.entries(modRects)) {
    const card = scene.cards.find((c) => c.key === (key as CardKey));
    if (!card) continue;
    const cr = card.el.getBoundingClientRect();
    const src = svg.querySelector(`[data-named="${key}"]`) as SVGGElement;
    tl.set(src, { opacity: 0 }, X);
    tl.fromTo(card.el,
      { x: (mr.left - cr.left) / s, y: (mr.top - cr.top) / s, scaleX: mr.width / cr.width, scaleY: mr.height / cr.height, opacity: 1, borderRadius: 0, transformOrigin: '0 0' },
      { x: 0, y: 0, scaleX: 1, scaleY: 1, borderRadius: 10, duration: XFORM, ease: EASE.move, immediateRender: false }, X);
    tl.to(card.el, { opacity: 0.25, duration: 0.3, ease: EASE.arrive }, X + 0.5);
    tl.fromTo(card.el.querySelector('.skin'), { opacity: 1 }, { opacity: 0, duration: 0.5, ease: EASE.move, immediateRender: false }, X);
    tl.fromTo(card.el.querySelector('.ct'), { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'none', immediateRender: false }, X + 0.3);
  }
  // the other modules shrink and fade (kept as later clutter)
  mods.forEach((m) => {
    if (m.named) return;
    const el = svg.querySelector(`#m-${m.id}`) as SVGGElement;
    tl.to(el, { scale: 0.4, opacity: 0, duration: 0.4, ease: EASE.leave }, X + 0.2);
  });
  tl.to(hero.wrap, { opacity: 0, duration: 0.5, ease: EASE.move }, X + 0.3)
    .fromTo(scene.pathLayer, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: EASE.move, immediateRender: false }, X + 0.3)
    .fromTo(scrim, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'none', immediateRender: false }, X + 0.5);
  // Devy lands on the path start
  const walkerSvg = scene.walker.querySelector('svg') as SVGSVGElement;
  const wr = walkerSvg.getBoundingClientRect();
  tl.set(hero.devyG, { opacity: 0 }, X + 0.5)
    .fromTo(walkerSvg,
      { x: (devyRect.left - wr.left) / s, y: (devyRect.top - wr.top) / s, scale: devyRect.height / wr.height, transformOrigin: '0 0', opacity: 1 },
      { x: 0, y: 0, scale: 1, duration: 0.3, ease: EASE.arrive, immediateRender: false }, X + 0.5);
  tl.set(scene.walker, { opacity: 0 }, 0).set(scene.walker, { opacity: 1 }, X + 0.5);
  tl.set(hero.el, { visibility: 'hidden' }, X + XFORM);
  frag.style.visibility = '';
  gsap.set(frag, { visibility: 'hidden' });
  gsap.set(scene.pathLayer, { opacity: 0 });
  gsap.set(scene.walker, { opacity: 0 });
  gsap.set(scrim, { opacity: 0 });
  return tl;
}

/** Remove inline flight styles so the cards' class-driven states take over again. */
export function releaseCards(scene: Scene) {
  scene.cards.forEach((c) => gsap.set(c.el, { clearProps: 'transform,opacity,borderRadius' }));
  scene.cards.forEach((c) => {
    const sk = c.el.querySelector('.skin'), ct = c.el.querySelector('.ct');
    gsap.set([sk, ct], { clearProps: 'opacity' });
  });
}

/** T2: pen stops → text out → pull back → drain → paper veil. The Question section takes over from there. */
export function createT2(scene: Scene, dom: StageDom) {
  const tl = gsap.timeline({ paused: true });
  const { narr, scrim, payoff } = dom;
  const veil = payoff.querySelector('.veil')!;
  const cam = { ...scene.cam };
  const fit = scene.fitCamera();
  const proxy = { ...cam };
  tl.to([narr, scrim], { opacity: 0, duration: 0.3, ease: EASE.leave }, 0.25)
    .to(proxy, {
      x: fit.x, y: fit.y, s: fit.s, duration: 1.2, ease: EASE.move,
      onUpdate: () => scene.setCamera(proxy),
    }, 0.25)
    .to(scene.cardsLayer, { filter: 'grayscale(1)', opacity: 0.55, duration: 1.0, ease: EASE.move }, 0.45)
    .to(scene.pathLayer, { opacity: 0.43, duration: 1.0, ease: EASE.move }, 0.45)
    .to(scene.walker, { opacity: 0.7, duration: 1.0, ease: EASE.move }, 0.45)
    .to(veil, { opacity: 1, duration: 0.6, ease: EASE.arrive }, 1.45);
  return tl;
}
