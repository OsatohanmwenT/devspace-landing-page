// Hero engine, ported from the devspace-opening prototype (hero.ts):
// skill-city mount/scaling, Devy keystone sequence, idle + CTA interactions, pointer parallax.
// Takes its elements as arguments and cleans up after itself so React can own its lifecycle.
import gsap from "gsap";
import { EASE, type Mode, rand } from "./config";
import { buildCity, type City, type Route } from "./build";
import { rig, type DevyRig } from "./devy";

export class HeroEngine {
  city!: City;
  mode: Mode;
  el: HTMLElement;
  copy: HTMLElement;
  wrap!: HTMLDivElement;
  svg!: SVGSVGElement;
  devy!: DevyRig;
  devyG!: SVGGElement;
  keyInner!: SVGGElement;
  s = 1; // design → screen scale
  vy0 = 0; // design y at top of viewport
  shift = 0; // extra downward shift to keep structures clear of the copy
  seq: gsap.core.Timeline | null = null;
  sequenceDone = false;
  enabled = true;
  activated = new Set<string>();

  private idleOn = false;
  private blinkCall: gsap.core.Tween | null = null;
  private glanceCall: gsap.core.Tween | null = null;
  private glanced = false;
  private blinkN = 0;
  private hoverCool = 0;
  private hoverTl: gsap.core.Timeline | null = null;
  private px = { tx: 0, ty: 0, x: 0, y: 0, raf: 0 };
  private cleanups: (() => void)[] = [];

  constructor(el: HTMLElement, copy: HTMLElement, mode: Mode) {
    this.el = el;
    this.copy = copy;
    this.mode = mode;
    this.mount();
    this.bindInteractions();
  }

  mount() {
    this.city = buildCity(this.mode);
    this.wrap?.remove();
    this.activated.clear();
    this.wrap = document.createElement("div");
    this.wrap.className = "city-wrap";
    this.wrap.innerHTML = `<svg class="city" aria-hidden="true" focusable="false">${this.city.svg}</svg>`;
    this.el.insertBefore(this.wrap, this.copy);
    this.svg = this.wrap.querySelector("svg.city") as SVGSVGElement;
    this.devy = rig(this.svg.querySelector(".hero-devy svg") as SVGElement);
    this.devyG = this.svg.querySelector(".hero-devy") as SVGGElement;
    this.keyInner = this.svg.querySelector(".key-inner") as SVGGElement;
    this.layout();
  }

  /** Scale city to the hero's width, anchor to the bottom, keep clear of the copy. */
  layout() {
    const vw = this.el.clientWidth;
    const vh = this.el.clientHeight;
    const L = this.city.layout;
    this.s = vw / L.W;
    const visH = vh / this.s;
    this.vy0 = L.H - visH;
    // copy vertical rhythm: scale the top on short viewports
    const baseTop = this.mode === "desktop" ? 176 : this.mode === "tablet" ? 152 : 104;
    const k = this.mode === "mobile" ? 1 : Math.min(1, (vh - 72) / 828);
    this.copy.style.setProperty("--h-top", Math.round(baseTop * k) + "px");
    this.svg.setAttribute("width", String(vw));
    this.svg.setAttribute("height", String(vh));
    this.svg.setAttribute("viewBox", `0 ${this.vy0} ${L.W} ${visH}`);
    // keep midground structures that sit under the copy out of the reading zone
    // offsets, not rects, so the scroll transform on the copy doesn't skew this
    const copyBottom = this.copy.offsetTop + this.copy.offsetHeight + 24;
    const x0 = (vw - Math.min(vw, this.mode === "desktop" ? 820 : this.mode === "tablet" ? 640 : vw)) / 2;
    const x1 = vw - x0;
    let minTop = Infinity;
    for (const m of this.city.modules) {
      const sx0 = m.x * this.s;
      const sx1 = (m.x + m.w) * this.s;
      if (sx1 < x0 || sx0 > x1) continue;
      minTop = Math.min(minTop, this.toScreenY(m.y));
    }
    minTop = Math.min(minTop, this.toScreenY(L.devy.feetY - L.devy.h));
    this.shift = Math.max(0, copyBottom - minTop);
    this.svg.style.transform = `translateY(${this.shift}px)`;
    // signal stroke: 2px on screen
    this.svg.querySelectorAll<SVGPathElement>(".sig").forEach((p) => (p.style.strokeWidth = String(2 / this.s)));
  }

  toScreenY(y: number) {
    return (y - this.vy0) * this.s;
  }

  // ─────────── Devy keystone sequence ───────────
  playSequence(opts: { instant?: boolean } = {}) {
    this.seq?.kill();
    const d = this.devy;
    const K = this.city.key;
    const L = this.city.layout;
    const u = 1 / (L.devy.h / 712); // design px → Devy units
    const kx0 = K.startX - K.x;
    const ky0 = K.startY - K.y;
    const kc = { x: K.x + K.w / 2, y: K.y + K.h / 2 };
    const held = { x: L.devy.cx - kc.x, y: L.devy.feetY - L.devy.h * 0.28 - kc.y };
    gsap.set(this.keyInner, { x: kx0, y: ky0, rotation: 0, svgOrigin: `${kc.x} ${kc.y}` });
    gsap.set(this.svg.querySelector(".gap"), { opacity: 1 });
    const tl = gsap.timeline({ paused: true, defaults: { ease: EASE.move } });
    const pupils = d.pupils;
    tl.addLabel("start", 0)
      .to(pupils, { x: 18, y: 10, duration: 0.2, ease: EASE.arrive }, 0)
      .to(d.lean, { rotation: 5, svgOrigin: "512 842", duration: 0.18 }, 0)
      .to(this.keyInner, { y: ky0 - 14, duration: 0.2 }, 0.05)
      .to(this.keyInner, { x: held.x, y: held.y, duration: 0.22 }, 0.23)
      .to(d.lean, { rotation: 0, svgOrigin: "512 842", duration: 0.25 }, 0.2)
      .to(pupils, { x: -16, y: 14, duration: 0.25 }, 0.3)
      // lower it — stops 3px short, 2° off, with a small bump
      .to(d.lean, { rotation: -7, svgOrigin: "512 842", duration: 0.3 }, 0.45)
      .to(this.keyInner, { x: 0, y: -3, rotation: 2, duration: 0.3, ease: EASE.arrive }, 0.45)
      .to(this.keyInner, { y: -5, duration: 0.06, ease: "power1.out" }, 0.72)
      .to(this.keyInner, { y: -3, duration: 0.06, ease: "power1.in" }, 0.78)
      // pause, look, brow
      .to(d.lean, { rotation: -3, svgOrigin: "512 842", duration: 0.3 }, 0.75)
      .to(pupils, { x: -20, y: 20, duration: 0.3, ease: EASE.arrive }, 0.8)
      .to(d.browR, { y: -3 * u, duration: 0.25, ease: EASE.arrive }, 0.85)
      // second adjustment: push with a 4° lean and a 2px hop
      .to(d.lean, { rotation: -7, svgOrigin: "512 842", duration: 0.2 }, 1.15)
      .to(this.devyG, { y: -2, duration: 0.1, ease: "power1.out" }, 1.2)
      .to(this.devyG, { y: 0, duration: 0.12, ease: "power1.in" }, 1.3)
      .to(this.keyInner, { rotation: 0, x: -1, duration: 0.3 }, 1.2)
      .to(this.keyInner, { x: 0, duration: 0.1 }, 1.45)
      // lock
      .to(this.keyInner, { y: 0, duration: 0.08, ease: EASE.leave }, 1.55)
      .set(this.svg.querySelector(".gap"), { opacity: 0 }, 1.63)
      .call(() => this.flash(), [], 1.63)
      .addLabel("lock", 1.63)
      .to(d.lean, { rotation: 0, svgOrigin: "512 842", duration: 0.3, ease: EASE.arrive }, 1.63)
      .to(d.browR, { y: 0, duration: 0.3 }, 1.7);
    // signal: 60-unit segments along each route at 900 units/s, detail activates on arrival
    for (const r of this.city.routes) {
      const p = this.svg.querySelector(`.sig[data-struct="${r.struct}"]`) as SVGPathElement;
      const segLen = 60 / r.len;
      const dur = r.len / 900;
      tl.set(p, { strokeDasharray: `${segLen} 2`, strokeDashoffset: segLen, opacity: 1 }, 1.63)
        .to(p, { strokeDashoffset: -1, duration: dur + 60 / 900, ease: "none" }, 1.63)
        .set(p, { opacity: 0 }, 1.63 + dur + 60 / 900)
        .call(() => this.activate(r.struct), [], 1.63 + dur);
    }
    tl.to(pupils, { x: -24, y: 6, duration: 0.3 }, 1.7)
      .to(pupils, { x: 24, y: 6, duration: 0.35 }, 2.05)
      .to(this.svg.querySelector(".joint"), { stroke: "rgba(36,58,221,0.3)", duration: 0.2 }, 1.9)
      .to(this.svg.querySelector(".joint"), { stroke: "rgba(14,17,22,0.8)", duration: 0.3 }, 2.6)
      // step back, inspect, settle
      .to(this.devyG, { x: 8, duration: 0.45, ease: EASE.arrive }, 2.5)
      .to(pupils, { x: -12, y: 12, duration: 0.4, ease: EASE.arrive }, 2.6)
      .to(pupils, { x: -6, y: 4, duration: 0.4, ease: EASE.arrive }, 3.0)
      .addLabel("rest", 3.1)
      .call(() => (this.sequenceDone = true), [], 3.1);
    this.seq = tl;
    if (opts.instant) {
      tl.progress(1).pause();
      this.city.routes.forEach((r) => this.activate(r.struct, true));
      this.sequenceDone = true;
    } else {
      this.sequenceDone = false;
      tl.play(0);
    }
    return tl;
  }

  private flash() {
    const els = [this.svg.querySelector("#m-key"), ...this.svg.querySelectorAll('[id^="m-found"]')];
    els.forEach((e) => e?.classList.add("flash"));
    setTimeout(() => els.forEach((e) => e?.classList.remove("flash")), 80);
  }

  activate(struct: string, instant = false) {
    if (this.activated.has(struct) && !instant) return;
    this.activated.add(struct);
    const q = (s: string) => this.svg.querySelector(s);
    const d = instant ? 0 : 1;
    if (struct === "dev") q(".cursor")?.classList.add("on");
    if (struct === "design") gsap.to(q(".snap"), { x: 2, y: -2, duration: 0.18 * d, ease: EASE.arrive });
    if (struct === "data") gsap.to(q(".act-data"), { opacity: 1, duration: 0.3 * d, ease: EASE.arrive });
    if (struct === "product") gsap.to(q(".act-product"), { opacity: 1, duration: 0.16 * d });
    if (struct === "marketing" && !instant && q(".act-marketing")) {
      const c = q(".act-marketing") as SVGCircleElement;
      gsap.fromTo(c, { opacity: 0.8, attr: { r: 26 } }, { opacity: 0, attr: { r: 32 }, duration: 0.6, ease: EASE.arrive });
    }
  }

  // ─────────── Idle: cursor blink, Devy blinks, one glance ───────────
  setIdle(on: boolean) {
    if (on === this.idleOn) return;
    this.idleOn = on;
    const cur = this.svg.querySelector(".cursor");
    cur?.classList.toggle("blink", on && cur.classList.contains("on"));
    this.blinkCall?.kill();
    if (on) {
      this.scheduleBlink();
      if (!this.glanceCall && !this.glanced) this.glanceCall = gsap.delayedCall(6, () => this.glance());
    } else {
      this.glanceCall?.kill();
      this.glanceCall = null;
    }
  }

  private glance() {
    this.glanced = true;
    const p = this.devy.pupils;
    gsap
      .timeline()
      .to(p, { x: -14, y: -16, duration: 0.35, ease: EASE.arrive })
      .to(p, { x: -6, y: 4, duration: 0.45, ease: EASE.arrive }, 1.2);
  }

  private scheduleBlink() {
    const wait = 4 + rand(++this.blinkN) * 3;
    this.blinkCall = gsap.delayedCall(wait, () => {
      this.blink(rand(this.blinkN * 7) < 0.2);
      if (this.idleOn) this.scheduleBlink();
    });
  }

  blink(double = false) {
    const eyes = this.devy.eyes;
    const one = () =>
      gsap
        .timeline()
        .to(eyes, { scaleY: 0.08, svgOrigin: "512 404", duration: 0.09, ease: "power1.in" })
        .to(eyes, { scaleY: 1, svgOrigin: "512 404", duration: 0.12, ease: "power1.out" });
    const tl = gsap.timeline().add(one());
    if (double) tl.add(one(), "+=0.08");
    return tl;
  }

  // ─────────── Interactions ───────────
  private listen(target: EventTarget, type: string, fn: EventListener, opts?: AddEventListenerOptions) {
    target.addEventListener(type, fn, opts);
    this.cleanups.push(() => target.removeEventListener(type, fn, opts));
  }

  private bindInteractions() {
    const start = this.copy.querySelector(".cta-start") as HTMLElement;
    const how = this.copy.querySelector(".cta-how") as HTMLElement;

    // "Start learning": a signal runs up to the Development cursor
    const onStart = () => {
      if (!this.enabled || !this.sequenceDone || performance.now() < this.hoverCool || this.hoverTl?.isActive()) return;
      const p = this.svg.querySelector(".sig-hover") as SVGPathElement;
      if (!p) return;
      const r: Route = this.city.hoverRoute;
      const seg = 40 / r.len;
      const cur = this.svg.querySelector(".cursor");
      this.hoverTl = gsap
        .timeline()
        .set(p, { strokeDasharray: `${seg} 2`, strokeDashoffset: seg, opacity: 1 })
        .to(p, { strokeDashoffset: 0, duration: 0.7, ease: "none" })
        .set(p, { opacity: 0 })
        .call(() => cur?.classList.remove("blink"))
        .call(() => {
          if (this.idleOn) cur?.classList.add("blink");
        }, [], "+=0.4");
    };
    const offStart = () => (this.hoverCool = performance.now() + 1000);
    this.listen(start, "pointerenter", onStart);
    this.listen(start, "focus", onStart);
    this.listen(start, "pointerleave", offStart);
    this.listen(start, "blur", offStart);

    // "See how it works": Devy looks down at it
    const look = (on: boolean) => {
      if (!this.enabled || !this.sequenceDone) return;
      gsap.to(this.devy.pupils, { x: on ? 16 : -6, y: on ? 22 : 4, duration: 0.22, ease: EASE.arrive, overwrite: "auto" });
      gsap.to(this.devy.browL, { y: on ? -9 : 0, duration: 0.22, ease: EASE.arrive, overwrite: "auto" });
    };
    this.listen(how, "pointerenter", () => look(true));
    this.listen(how, "focus", () => look(true));
    this.listen(how, "pointerleave", () => look(false));
    this.listen(how, "blur", () => look(false));

    // pointer parallax: fine pointers on desktop only, damped 8%/frame, copy never moves
    const fine = window.matchMedia("(pointer: fine)");
    this.listen(window, "pointermove", (e) => {
      const ev = e as PointerEvent;
      if (!fine.matches || this.mode !== "desktop" || !this.enabled) return;
      this.px.tx = (ev.clientX / window.innerWidth - 0.5) * 2;
      this.px.ty = (ev.clientY / window.innerHeight - 0.5) * 2;
      this.runParallax();
    });
    this.listen(document, "pointerleave", () => {
      this.px.tx = 0;
      this.px.ty = 0;
      this.runParallax();
    });
  }

  private runParallax() {
    if (this.px.raf) return;
    const planes = {
      bg: this.svg.querySelector(".plane-bg") as SVGGElement,
      mid: this.svg.querySelector(".plane-mid") as SVGGElement,
      fg: this.svg.querySelector(".plane-fg") as SVGGElement,
    };
    const step = () => {
      const p = this.px;
      if (!this.enabled) p.tx = p.ty = 0;
      p.x += (p.tx - p.x) * 0.08;
      p.y += (p.ty - p.y) * 0.08;
      const k = 1 / this.s;
      planes.bg.setAttribute("transform", `translate(${p.x * 4 * k} ${p.y * 4 * k})`);
      planes.mid.setAttribute("transform", `translate(${p.x * 2 * k} ${p.y * 2 * k})`);
      planes.fg.setAttribute("transform", `translate(${p.x * 6 * k} ${p.y * 6 * k})`);
      p.raf = Math.abs(p.tx - p.x) + Math.abs(p.ty - p.y) > 0.002 ? requestAnimationFrame(step) : 0;
    };
    this.px.raf = requestAnimationFrame(step);
  }

  destroy() {
    this.setIdle(false);
    this.seq?.kill();
    this.hoverTl?.kill();
    this.glanceCall?.kill();
    cancelAnimationFrame(this.px.raf);
    this.cleanups.forEach((fn) => fn());
    this.cleanups = [];
    gsap.killTweensOf(this.svg.querySelectorAll("*"));
    this.wrap.remove();
  }
}
