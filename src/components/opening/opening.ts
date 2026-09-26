// Opening sequence, adapted from the devspace-opening prototype (main.ts).
//
// Nothing here hijacks the scroll: after Devy's intro, every stage is a pure function of one
// smoothed scroll position, so the page moves exactly as far as the visitor scrolls, forwards or back.
//
//   y (vh from the top of the opening, smoothed)
//   ├─ t1Start → t1End    T1: copy leaves, the city comes apart, six modules become cards
//   ├─ t1End   → fragEnd  the path: p 0 → 1 (Devy walks, checkpoints, cards, text fill)
//   └─ fragEnd → t2End    T2: camera pulls back, the tangle drains to paper; then the stage unpins
//                          and the Question section takes over.
import gsap from "gsap";
import { budget, clamp, getMode, isShortLandscape, prefersReduced, type Mode } from "./config";
import { HeroEngine } from "./engine";
import { SCROLL_SMOOTHING_MS } from "../../lib/smooth-scroll";
import { Scene } from "./scene";
import { Narrative } from "./narrative";
import { createT1, createT2, releaseCards, type StageDom } from "./transitions";

export type State = "LOADING" | "HERO" | "T1" | "FRAG" | "T2" | "END" | "STATIC";

export type OpeningDom = StageDom & {
  root: HTMLElement; // the tall scroll container
  hero: HTMLElement;
  copy: HTMLElement;
  scene: HTMLDivElement;
  sceneWrap: HTMLElement;
};

// Devy starts the keystone sequence this long after the page is revealed.
const SEQUENCE_DELAY = 0.4;
// Scroll smoothing time constant (ms), shared with the sections after the opening.
const SMOOTHING_MS = SCROLL_SMOOTHING_MS;
// Before the city comes apart, the hero still answers the scroll: copy and city lift slightly (px at t1Start).
const PRELUDE_COPY_LIFT = 28;
const PRELUDE_CITY_LIFT = 18;
/** CSS var (on <html>) with the length of the stage's scroll-out, so the next section can overlap it. */
const TAIL_VAR = "--opening-tail";
// Jumps bigger than this (anchor links) snap instead of animating through every stage.
const SNAP_VH = 150;
const IDLE_TIMEOUT = 5 * 60 * 1000;

export class Opening {
  state: State = "LOADING";
  private dom: OpeningDom;
  private mode: Mode = getMode();
  private isStatic = prefersReduced() || isShortLandscape();
  private hero: HeroEngine;
  private scene: Scene;
  private narr: Narrative;

  private t1: gsap.core.Timeline | null = null;
  private t2: gsap.core.Timeline | null = null;
  private cardsReleased = false;
  private vh = window.innerHeight;
  private yTarget = 0;
  private y = 0; // smoothed

  private raf = 0;
  private last = 0;
  private revealed = false;
  private startCall: gsap.core.Tween | null = null;
  private resizeT = 0;
  private idleT = 0;
  private idleTimedOut = false;
  private cleanups: (() => void)[] = [];
  private destroyed = false;

  constructor(dom: OpeningDom) {
    this.dom = dom;
    this.hero = new HeroEngine(dom.hero, dom.copy, this.mode);
    this.scene = new Scene(dom.scene, this.mode);
    this.narr = new Narrative(dom.narr as HTMLDivElement, this.mode);
    if (this.isStatic) this.initStatic();
    else this.initMotion();
  }

  // ───────────── helpers ─────────────
  private listen(target: EventTarget, type: string, fn: EventListener, opts?: AddEventListenerOptions) {
    target.addEventListener(type, fn, opts);
    this.cleanups.push(() => target.removeEventListener(type, fn, opts));
  }

  private setState(s: State) {
    this.state = s;
    this.dom.root.dataset.state = s;
    const atRest = s === "HERO" && this.hero.sequenceDone;
    this.hero.setIdle(atRest && !this.idleTimedOut && document.visibilityState === "visible");
    this.hero.enabled = s === "HERO";
    if (!this.hero.enabled) this.hero.resetParallax();
  }

  private sizeContainer() {
    this.vh = window.innerHeight;
    // the stage stays pinned until t2End, then scrolls away with the page
    this.dom.root.style.height = this.isStatic ? "" : ((budget(this.mode).t2End + 100) * this.vh) / 100 + "px";
    // that last screen of scroll-out is plain paper: the next section overlaps it (see .question-handoff)
    if (this.isStatic) document.documentElement.style.removeProperty(TAIL_VAR);
    else document.documentElement.style.setProperty(TAIL_VAR, this.vh + "px");
  }

  /** Scroll-linked lift while the hero holds (u: 0 → 1 over 0 → t1Start); T1 continues from its end. */
  private prelude(u: number) {
    gsap.set(this.dom.copy, { y: -PRELUDE_COPY_LIFT * u });
    gsap.set(this.hero.wrap, { y: -PRELUDE_CITY_LIFT * u });
  }

  /** Scroll position in vh, relative to the top of the opening. */
  private measureY() {
    const top = this.dom.root.getBoundingClientRect().top + window.scrollY;
    this.yTarget = (window.scrollY - top) / (this.vh / 100);
  }

  /** Initial stage: hero in place, fragmentation hidden and waiting. */
  private resetStage() {
    this.dom.frag.style.visibility = "hidden";
    this.scene.render(0, true);
    this.narr.render(0);
    gsap.set(this.scene.pathLayer, { opacity: 0 });
    gsap.set(this.scene.walker, { opacity: 0 });
    gsap.set(this.dom.payoff.querySelector(".veil"), { opacity: 0 });
  }

  // ───────────── motion version ─────────────
  private initMotion() {
    this.sizeContainer();
    this.resetStage();
    // keystone waits on the crate until the page is revealed
    this.hero.playSequence().pause(0);

    this.listen(window, "scroll", () => this.onScroll(), { passive: true });
    this.listen(window, "resize", () => this.onResize());
    this.listen(document, "visibilitychange", () => this.setState(this.state));
    for (const e of ["pointermove", "keydown", "touchstart"]) this.listen(window, e, () => this.noteActivity(), { passive: true });

    // text fill measures glyph boxes, so re-measure once the display font is in
    document.fonts.ready.then(() => {
      if (!this.destroyed) this.narr.measure();
    });
  }

  /** Called when the page loader starts revealing the page. */
  reveal() {
    if (this.revealed || this.destroyed) return;
    this.revealed = true;
    if (this.isStatic) return;
    this.hero.layout();
    this.narr.measure();
    this.hero.onRest = () => this.setState(this.state);
    this.setState("HERO");
    this.startCall = gsap.delayedCall(SEQUENCE_DELAY, () => {
      if (this.y <= budget(this.mode).t1Start) this.hero.playSequence();
    });
    this.measureY();
    this.y = this.yTarget;
    this.apply(this.y);
  }

  private onScroll() {
    this.noteActivity();
    this.measureY();
    if (!this.revealed) return;
    if (Math.abs(this.yTarget - this.y) > SNAP_VH) {
      this.y = this.yTarget;
      this.apply(this.y);
      return;
    }
    if (!this.raf) {
      this.last = performance.now();
      this.raf = requestAnimationFrame(this.tick);
    }
  }

  private tick = (now: number) => {
    const dt = Math.min(64, now - this.last);
    this.last = now;
    this.raf = 0;
    this.y += (this.yTarget - this.y) * (1 - Math.exp(-dt / SMOOTHING_MS));
    if (Math.abs(this.yTarget - this.y) < 0.02) this.y = this.yTarget;
    this.apply(this.y);
    if (this.y !== this.yTarget) this.raf = requestAnimationFrame(this.tick);
  };

  /** Render the whole opening for scroll position y (vh). Pure: the same y always gives the same frame. */
  private apply(y: number) {
    if (this.destroyed) return;
    const B = budget(this.mode);
    const u1 = clamp((y - B.t1Start) / (B.t1End - B.t1Start));
    const p = clamp((y - B.t1End) / (B.fragEnd - B.t1End));
    const u2 = clamp((y - B.fragEnd) / (B.t2End - B.fragEnd));

    // back inside T1: the path rewinds to its start before the flight is scrubbed
    if (u1 < 1 && this.scene.p !== 0) {
      this.scene.render(0, true);
      this.narr.render(0);
    }

    // ── T1 (hero → cards). Built lazily from the live geometry, with the hero at rest.
    if (u1 > 0 && !this.t1) {
      this.prelude(1); // T1 records its start from here, so it picks up exactly where the lift ended
      this.startCall?.kill();
      this.hero.finishNow();
      this.hero.setIdle(false);
      this.scene.camLocked = false;
      this.scene.render(0, true);
      this.t1 = createT1(this.hero, this.scene, this.mode, this.dom);
      this.t1.pause();
    }
    if (this.t1) {
      // the cards' flight styles hand over to their class-driven states at the end of T1
      if (u1 < 1 && this.cardsReleased) this.cardsReleased = false;
      this.t1.progress(u1);
      if (u1 >= 1 && !this.cardsReleased) {
        releaseCards(this.scene);
        this.cardsReleased = true;
      }
    }
    if (u1 <= 0) this.prelude(clamp(y / B.t1Start));

    // ── T2 (pull back, drain). Built the first time the path is complete.
    if (u2 > 0 && !this.t2) {
      this.scene.camLocked = false;
      this.scene.render(1, true);
      this.narr.render(1);
      this.t2 = createT2(this.scene, this.dom);
      this.t2.pause();
    }
    if (this.t2) {
      this.t2.progress(u2);
      this.scene.camLocked = u2 > 0;
    }

    // ── the path
    if (u1 >= 1 && u2 <= 0) {
      this.scene.render(p);
      this.narr.render(p);
    }

    const state: State = u1 <= 0 ? "HERO" : u1 < 1 ? "T1" : u2 <= 0 ? "FRAG" : u2 < 1 ? "T2" : "END";
    if (state !== this.state) this.setState(state);
  }

  // ───────────── resize: rebuild geometry, re-render the current position (never replay) ─────────────
  private onResize() {
    window.clearTimeout(this.resizeT);
    this.resizeT = window.setTimeout(() => {
      const m = getMode();
      this.sizeContainer();
      // put every animated element back to its authored state before rebuilding
      this.t2?.progress(0).kill();
      this.t1?.progress(0).kill();
      this.t1 = this.t2 = null;
      this.cardsReleased = false;
      this.scene.camLocked = false;
      gsap.set([this.dom.copy, this.dom.narr, this.dom.scrim], { clearProps: "all" });
      this.dom.hero.style.visibility = "";
      if (m !== this.mode) {
        this.mode = m;
        this.hero.mode = m;
        this.scene = new Scene(this.dom.scene, m);
        this.narr = new Narrative(this.dom.narr as HTMLDivElement, m);
      } else {
        this.scene.build();
        this.narr.measure();
      }
      // never replay Devy's intro on resize: settled city once revealed, keystone waiting before
      this.startCall?.kill();
      this.hero.mount();
      if (this.revealed) this.hero.playSequence({ instant: true });
      else this.hero.playSequence().pause(0);
      this.resetStage();
      if (!this.revealed) return;
      this.measureY();
      this.y = this.yTarget;
      this.apply(this.y);
    }, 150);
  }

  // ───────────── ambient pause after 5 minutes without input ─────────────
  private noteActivity() {
    window.clearTimeout(this.idleT);
    if (this.idleTimedOut) {
      this.idleTimedOut = false;
      this.setState(this.state);
    }
    this.idleT = window.setTimeout(() => {
      this.idleTimedOut = true;
      this.setState(this.state);
    }, IDLE_TIMEOUT);
  }

  // ───────────── static (reduced-motion) version ─────────────
  private initStatic() {
    this.dom.root.classList.add("static");
    this.setState("STATIC");
    this.hero.layout();
    this.hero.playSequence({ instant: true });
    this.hero.enabled = false;
    document.fonts.ready.then(() => {
      if (!this.destroyed) this.buildStaticScene();
    });
    let w = window.innerWidth;
    this.listen(window, "resize", () => {
      if (window.innerWidth === w) return;
      w = window.innerWidth;
      this.mode = getMode();
      this.hero.mode = this.mode;
      this.hero.mount();
      this.hero.playSequence({ instant: true });
      this.scene = new Scene(this.dom.scene, this.mode);
      this.narr = new Narrative(this.dom.narr as HTMLDivElement, this.mode);
      this.buildStaticScene();
    });
  }

  private buildStaticScene() {
    const wrap = this.dom.sceneWrap;
    const scene = this.scene;
    this.narr.renderStatic();
    scene.renderStatic();
    // fit the scene to the page width; height follows the drawn content
    let maxY = 0;
    scene.lut.forEach((q) => (maxY = Math.max(maxY, q.y)));
    scene.cards.forEach((c) => (maxY = Math.max(maxY, c.el.offsetTop + c.el.offsetHeight)));
    const s = window.innerWidth / scene.geo.viewW;
    scene.camLocked = true;
    scene.setCamera({ x: -scene.geo.viewX0 * s, y: 0, s });
    wrap.style.height = (maxY + 60) * s + "px";
    gsap.set([scene.pathLayer, scene.walker], { opacity: 1 });
  }

  destroy() {
    this.destroyed = true;
    this.cleanups.forEach((fn) => fn());
    this.cleanups = [];
    cancelAnimationFrame(this.raf);
    window.clearTimeout(this.resizeT);
    window.clearTimeout(this.idleT);
    this.startCall?.kill();
    this.t1?.kill();
    this.t2?.kill();
    this.hero.destroy();
    gsap.killTweensOf([this.dom.copy, this.dom.narr, this.dom.scrim, this.dom.frag, this.scene.root]);
    this.dom.scene.innerHTML = "";
    this.dom.narr.innerHTML = "";
    this.dom.root.classList.remove("static");
    this.dom.root.style.height = "";
    document.documentElement.style.removeProperty(TAIL_VAR);
  }
}
