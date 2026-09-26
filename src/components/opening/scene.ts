// Fragmentation scene (spec §14–16, §19): winding path, checkpoints, artefact cards, Devy walker, camera.
// Everything here is a pure function of smoothed progress p, so scrolling back restores earlier frames.
import gsap from 'gsap';
import { EASE, type Mode, clamp } from './config';
import { sceneGeo, smoothPath, type SceneGeo, type CP } from './geometry';
import { cardMarkup, type CardKey } from './artefacts';
import { devySvg, rig, type DevyRig, DEVY_VIEWBOX, DEVY_FEET_Y, DEVY_CENTER_X } from './devy';

/** Progress at which the path has (almost) reached its end and the question appears. */
const END_MARK_AT = 0.985;

type CardRt = {
  key: CardKey; el: HTMLElement; trigger: number; cpP: number; named: boolean;
  state: 'hidden' | 'dormant' | 'arrived'; aged: boolean;
};

export class Scene {
  geo: SceneGeo;
  mode: Mode;
  root: HTMLDivElement;
  pathEl!: SVGPathElement;
  pathLayer!: HTMLDivElement;
  cardsLayer!: HTMLDivElement;
  L = 1;
  lut: { x: number; y: number }[] = [];
  cpP: Record<CP, number> = {} as Record<CP, number>;
  cpEls: { cp: CP; node: SVGCircleElement; label: HTMLElement; p: number }[] = [];
  cards: CardRt[] = [];
  devy!: DevyRig;
  walker!: HTMLDivElement;
  caption!: HTMLDivElement;
  endMark!: HTMLDivElement;
  s = 1; // scene → screen scale
  cam = { x: 0, y: 0, s: 1 };
  camLocked = false; // T2 owns the camera
  p = 0;
  pStop = 0; // Devy stop (START)
  pLoopNear = 0; // loop point closest to START
  private seriouslyShown = false;
  private reacted = false;
  private loopReacted = false;
  private eye = { x: 0, y: 0 };

  constructor(root: HTMLDivElement, mode: Mode) {
    this.root = root;
    this.mode = mode;
    this.geo = sceneGeo(mode);
    this.build();
  }

  build() {
    const g = this.geo;
    this.root.innerHTML = '';
    this.root.style.width = g.W + 'px';
    this.root.style.height = g.H + 'px';
    const d = smoothPath(g.points);
    this.pathLayer = document.createElement('div');
    this.pathLayer.className = 'path-layer';
    this.pathLayer.style.zIndex = g.pathOnTop ? '5' : '0';
    this.pathLayer.innerHTML = `<svg class="pathsvg" width="${g.W}" height="${g.H}" viewBox="0 0 ${g.W} ${g.H}">
      <path class="trail" d="${d}" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1"/>
      ${g.cps.filter((c) => c.cp !== 'REPEAT').map((c) => `<circle class="cp-node" data-cp="${c.cp}" cx="${c.at[0]}" cy="${c.at[1]}" r="3.5"/>`).join('')}
      <circle class="cp-node start" cx="${g.points[0][0]}" cy="${g.points[0][1]}" r="3.5"/>
    </svg>`;
    this.root.appendChild(this.pathLayer);
    this.pathEl = this.pathLayer.querySelector('.trail') as SVGPathElement;
    this.cardsLayer = document.createElement('div');
    this.cardsLayer.className = 'cards-layer';
    this.cardsLayer.style.cssText = 'position:absolute;left:0;top:0;z-index:1;width:100%;height:100%';
    this.root.appendChild(this.cardsLayer);

    // arc-length lookup table (computed once)
    this.L = this.pathEl.getTotalLength();
    const N = 1600;
    this.lut = [];
    for (let i = 0; i <= N; i++) {
      const pt = this.pathEl.getPointAtLength((i / N) * this.L);
      this.lut.push({ x: pt.x, y: pt.y });
    }
    const nearestP = (x: number, y: number, from = 0, to = 1) => {
      let best = 0, bd = Infinity;
      const a = Math.floor(from * N), b = Math.ceil(to * N);
      for (let i = a; i <= b; i++) {
        const q = this.lut[i];
        const dd = (q.x - x) ** 2 + (q.y - y) ** 2;
        if (dd < bd) { bd = dd; best = i; }
      }
      return best / N;
    };
    let last = 0;
    for (const c of g.cps) {
      if (c.cp === 'REPEAT') {
        // reached when the pen completes the loop's top
        this.cpP[c.cp] = nearestP(g.loop.cx, g.loop.cy - g.loop.r, last);
      } else this.cpP[c.cp] = nearestP(c.at[0], c.at[1], last);
      last = this.cpP[c.cp];
    }
    this.pStop = this.cpP.START;
    this.pLoopNear = nearestP(g.loop.cx + g.loop.r, g.loop.cy, this.pStop);

    // checkpoint labels
    this.cpEls = g.cps.map((c) => {
      const label = document.createElement('div');
      label.className = `cp-label ${c.side}`;
      label.textContent = c.cp;
      label.style.top = c.at[1] - 5.5 + 'px';
      if (c.side === 'r') label.style.left = c.at[0] + 4 + 'px';
      if (c.side === 'l') { label.style.right = g.W - c.at[0] + 4 + 'px'; }
      if (c.side === 'c') { label.style.left = c.at[0] + 'px'; label.style.transform = 'translateX(-50%)'; }
      this.cardsLayer.appendChild(label);
      const node = this.pathLayer.querySelector(`[data-cp="${c.cp}"]`) as SVGCircleElement;
      return { cp: c.cp, node, label, p: this.cpP[c.cp] };
    });

    // cards
    this.cards = g.cards.map((c) => {
      const { cls, html } = cardMarkup(c.key);
      const el = document.createElement('div');
      el.className = `card ${cls}`;
      el.dataset.key = c.key;
      el.style.left = c.x + 'px';
      el.style.top = c.y + 'px';
      el.style.width = c.w + 'px';
      if (c.key === 'tabs') el.style.height = '84px';
      if (c.rot) el.style.rotate = c.rot + 'deg';
      el.style.zIndex = String(c.z ?? 1);
      el.innerHTML = `<div class="skin"></div><div class="ct">${html}</div>`;
      if (c.slide) el.style.transition = 'opacity .36s var(--ease-arrive), translate .36s var(--ease-arrive)';
      this.cardsLayer.appendChild(el);
      const cpP = this.cpP[c.cp];
      const trigger = c.named ? cpP - 120 / this.L : cpP + (c.after ?? 0) / this.L;
      return { key: c.key, el, trigger, cpP, named: !!c.named, state: 'hidden', aged: false } as CardRt;
    });

    // "What's next?" at the end of the line, shown once the pen gets there
    const end = g.points[g.points.length - 1];
    this.endMark = document.createElement('div');
    this.endMark.className = 'end-mark';
    this.endMark.style.left = end[0] + 'px';
    this.endMark.style.top = end[1] + 'px';
    this.endMark.innerHTML = `<span class="q" aria-hidden="true">?</span><span>What’s next?</span>`;
    this.cardsLayer.appendChild(this.endMark);

    // Devy walker
    this.walker = document.createElement('div');
    this.walker.className = 'walker';
    this.walker.style.zIndex = '6';
    const h = g.devyH;
    const w = (DEVY_VIEWBOX.w / DEVY_VIEWBOX.h) * h;
    this.walker.innerHTML = devySvg('fd');
    const svg = this.walker.querySelector('svg') as SVGSVGElement;
    svg.style.width = w + 'px';
    svg.style.height = h + 'px';
    const sc = h / DEVY_VIEWBOX.h;
    svg.style.left = -(DEVY_CENTER_X - DEVY_VIEWBOX.x) * sc + 'px';
    svg.style.top = -(DEVY_FEET_Y - DEVY_VIEWBOX.y) * sc + 'px';
    this.caption = document.createElement('div');
    this.caption.className = 'caption';
    this.caption.textContent = 'Seriously?';
    this.caption.style.top = -h - 22 + 'px';
    this.walker.appendChild(this.caption);
    this.root.appendChild(this.walker);
    this.devy = rig(svg);
    this.layout();
    this.render(0, true);
  }

  layout() {
    const vw = window.innerWidth;
    this.s = vw / this.geo.viewW;
    (this.pathEl as SVGPathElement).style.strokeWidth = String(1.5 / this.s);
    this.pathLayer.querySelectorAll('.cp-node').forEach((n) => ((n as SVGElement).style.strokeWidth = String(1.5 / this.s)));
    this.pathLayer.querySelectorAll('.cp-node').forEach((n) => n.setAttribute('r', String(3.5 / Math.min(1.25, Math.max(0.8, this.s)))));
    if (!this.camLocked) this.applyCamera(this.p);
  }

  point(p: number) {
    const f = clamp(p) * (this.lut.length - 1);
    const i = Math.floor(f);
    const a = this.lut[i], b = this.lut[Math.min(i + 1, this.lut.length - 1)];
    const t = f - i;
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
  }

  /** Camera: vertical only, pen held at 58% of the viewport height. */
  cameraFor(p: number) {
    const vh = window.innerHeight;
    const pen = this.point(p);
    const s = this.s;
    let y = pen.y * s - vh * 0.58;
    y = Math.min(y, this.geo.H * s - vh * 0.7);
    return { x: -this.geo.viewX0 * s, y: -y, s };
  }
  applyCamera(p: number) {
    const c = this.cameraFor(p);
    this.cam = c;
    this.root.style.transform = `translate3d(${c.x}px, ${c.y}px, 0) scale(${c.s})`;
  }
  setCamera(c: { x: number; y: number; s: number }) {
    this.cam = c;
    this.root.style.transform = `translate3d(${c.x}px, ${c.y}px, 0) scale(${c.s})`;
  }

  /** Fit the whole tangle (path + cards) in the viewport with 80px margins (spec §20). */
  fitCamera() {
    const vw = window.innerWidth, vh = window.innerHeight;
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const q of this.lut) { x0 = Math.min(x0, q.x); x1 = Math.max(x1, q.x); y0 = Math.min(y0, q.y); y1 = Math.max(y1, q.y); }
    for (const c of this.cards) {
      const l = c.el.offsetLeft, t = c.el.offsetTop;
      x0 = Math.min(x0, l); y0 = Math.min(y0, t); x1 = Math.max(x1, l + c.el.offsetWidth); y1 = Math.max(y1, t + c.el.offsetHeight);
    }
    const m = vw < 768 ? 24 : 80;
    const s = Math.min((vw - 2 * m) / (x1 - x0), (vh - 2 * m) / (y1 - y0));
    return { x: (vw - (x1 - x0) * s) / 2 - x0 * s, y: (vh - (y1 - y0) * s) / 2 - y0 * s, s };
  }

  /** Render one frame at progress p (0..1). */
  render(p: number, force = false) {
    const prev = this.p;
    this.p = p;
    this.pathEl.setAttribute('stroke-dashoffset', String(1 - p));
    if (!this.camLocked) this.applyCamera(p);
    const L = this.L;
    // checkpoints
    for (const c of this.cpEls) {
      const reached = p >= c.p - 20 / L;
      const passed = p >= c.p + 300 / L;
      c.node?.classList.toggle('on', p >= c.p);
      c.label.classList.toggle('on', reached && !passed);
      c.label.classList.toggle('passed', passed);
    }
    // cards
    const switchP = this.cpP.SWITCH;
    for (const c of this.cards) {
      let st: CardRt['state'] = p >= c.trigger ? 'arrived' : c.named ? 'dormant' : 'hidden';
      if (p <= 0.0001 && !this.dormantVisible && c.named) st = 'hidden';
      if (st !== c.state || force) {
        c.state = st;
        c.el.classList.toggle('dormant', st === 'dormant');
        c.el.classList.toggle('arrived', st === 'arrived');
        if (st === 'hidden') c.el.style.translate = c.key === 'video2' ? '60px 0' : '0 8px';
        else c.el.style.translate = '';
      }
      // older cards not near the pen drop to 60% once START is reached; course dims under SWITCH's video
      const aged = (p > this.pStop && p - c.cpP > 0.14) || (c.key === 'course' && p >= switchP);
      if (aged !== c.aged) { c.aged = aged; c.el.classList.toggle('aged', aged); }
    }
    this.endMark.classList.toggle('on', p >= END_MARK_AT);
    this.renderDevy(p, prev);
  }
  dormantVisible = true;

  private renderDevy(p: number, prev: number) {
    const lag = p < 0.4 ? 0.04 : p < 0.46 ? 0.04 + ((p - 0.4) / 0.06) * 0.02 : 0.06;
    const pd = clamp(Math.min(p - lag, this.pStop));
    const pt = this.point(pd);
    this.walker.style.transform = `translate(${pt.x}px, ${pt.y}px)`;
    const moving = pd < this.pStop && p > lag;
    // walk cycle driven by distance travelled (reversible, no clock)
    const dist = pd * this.L;
    const ph = (dist / 26) * Math.PI;
    const k = 712 / this.geo.devyH; // design px → Devy units
    if (moving) {
      gsap.set(this.devy.footL, { y: -Math.max(0, Math.sin(ph)) * 3 * k });
      gsap.set(this.devy.footR, { y: -Math.max(0, -Math.sin(ph)) * 3 * k });
      gsap.set(this.devy.upper, { y: -Math.abs(Math.sin(ph)) * 2 * k });
    } else {
      gsap.set([this.devy.footL, this.devy.footR, this.devy.upper], { y: 0 });
    }
    // reaction at START once Devy has stopped
    const stoppedAt = this.pStop + 0.06;
    const react = p >= stoppedAt + 0.02;
    if (react && !this.reacted) {
      this.reacted = true;
      const tl = gsap.timeline();
      tl.to(this.devy.pupils, { x: 22, y: 8, duration: 0.3, ease: EASE.arrive })
        .to(this.devy.pupils, { x: -22, y: -10, duration: 0.35, ease: EASE.arrive }, 0.45)
        .to(this.devy.browR, { y: -3 * k, duration: 0.25, ease: EASE.arrive }, 0.8)
        .to(this.devy.pupils, { x: 0, y: 4, duration: 0.3 }, 1.1);
      if (!this.seriouslyShown && this.captionEnabled) {
        this.seriouslyShown = true;
        gsap.timeline({ delay: 0.8 })
          .to(this.caption, { opacity: 1, duration: 0.2, ease: 'none' })
          .to(this.caption, { opacity: 0, duration: 0.3, ease: 'none' }, '+=1.6');
      }
    } else if (!react && this.reacted && p < stoppedAt) {
      this.reacted = false;
      gsap.to(this.devy.browR, { y: 0, duration: 0.25 });
    }
    // after the stop, eyes track the pen with ~300ms lag
    if (p >= stoppedAt) {
      const pen = this.point(p);
      const dx = clamp((pen.x - pt.x) / 300, -1, 1) * 22;
      const dy = clamp((pen.y - (pt.y - this.geo.devyH * 0.6)) / 300, -1, 1) * 18;
      this.eye.x += (dx - this.eye.x) * 0.1;
      this.eye.y += (dy - this.eye.y) * 0.1;
      if (this.reacted && !gsap.isTweening(this.devy.pupils)) gsap.set(this.devy.pupils, { x: this.eye.x, y: this.eye.y });
    }
    // the loop passes right beside him: eyes follow it round, brows lower, one slow blink
    const loopHit = p >= this.pLoopNear;
    if (loopHit && !this.loopReacted) {
      this.loopReacted = true;
      gsap.timeline()
        .to([this.devy.browL, this.devy.browR], { y: 1 * k, duration: 0.3, ease: EASE.arrive })
        .add(this.slowBlink(), 0.4);
    } else if (!loopHit && this.loopReacted && p < this.pLoopNear - 0.02) {
      this.loopReacted = false;
      gsap.to([this.devy.browL], { y: 0, duration: 0.25 });
    }
    void prev;
  }
  captionEnabled = true;
  private slowBlink() {
    return gsap.timeline()
      .to(this.devy.eyes, { scaleY: 0.08, svgOrigin: '512 404', duration: 0.24, ease: 'power1.in' })
      .to(this.devy.eyes, { scaleY: 1, svgOrigin: '512 404', duration: 0.34, ease: 'power1.out' }, '+=0.12');
  }

  /** Screen rect of a card at the current camera (for T1's FLIP flights). */
  cardScreenRect(key: CardKey) {
    const c = this.cards.find((x) => x.key === key)!;
    return c.el.getBoundingClientRect();
  }
  walkerScreen() {
    return this.walker.getBoundingClientRect();
  }

  /** Static render for reduced motion: everything drawn, all cards in place. */
  renderStatic() {
    this.dormantVisible = true;
    this.render(1, true);
    this.cards.forEach((c) => { c.el.classList.remove('aged'); c.el.style.transition = 'none'; });
    this.cpEls.forEach((c) => { c.label.classList.add('on'); c.label.classList.remove('passed'); });
    // Devy stands at START, brow raised, caption shown
    const pt = this.point(this.pStop);
    this.walker.style.transform = `translate(${pt.x}px, ${pt.y}px)`;
    gsap.set(this.devy.browR, { y: -3 * (712 / this.geo.devyH) });
    gsap.set(this.caption, { opacity: 1 });
  }
}
