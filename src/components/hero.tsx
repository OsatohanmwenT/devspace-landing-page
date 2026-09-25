import { useEffect, useRef } from "react";
import { getMode, prefersReduced } from "./opening-hero/config";
import { HeroEngine } from "./opening-hero/engine";
import "./opening-hero/hero.css";

// Devy starts the keystone sequence this long after the loader starts revealing the page.
const SEQUENCE_DELAY_MS = 400;
const SCROLL_SMOOTHING = 0.14;

const Hero = ({ ready = true }: { ready?: boolean }) => {
  const heroRef = useRef<HTMLElement | null>(null);
  const copyRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<HeroEngine | null>(null);
  const playedRef = useRef(false);

  // Build the skill city; rebuild on breakpoint changes, relayout on other resizes.
  useEffect(() => {
    const hero = heroRef.current;
    const copy = copyRef.current;
    if (!hero || !copy) return;

    let mode = getMode();
    const engine = new HeroEngine(hero, copy, mode);
    engineRef.current = engine;
    if (playedRef.current || prefersReduced()) engine.playSequence({ instant: true });
    else engine.playSequence().pause(0);

    // Idle (blinks, cursor) only while the hero is on screen and the tab is visible.
    let onScreen = true;
    const syncIdle = () => engine.setIdle(onScreen && engine.sequenceDone && document.visibilityState === "visible");
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      engine.enabled = onScreen;
      syncIdle();
    });
    io.observe(hero);
    const idleTimer = window.setInterval(syncIdle, 500);
    document.addEventListener("visibilitychange", syncIdle);

    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        const next = getMode();
        if (next === mode) return engine.layout();
        mode = next;
        engine.setIdle(false);
        engine.mode = next;
        engine.mount();
        engine.playSequence({ instant: true });
        syncIdle();
      }, 150);
    };
    window.addEventListener("resize", onResize);

    return () => {
      io.disconnect();
      window.clearInterval(idleTimer);
      window.clearTimeout(resizeTimer);
      document.removeEventListener("visibilitychange", syncIdle);
      window.removeEventListener("resize", onResize);
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  // Devy installs the keystone once the loader reveals the page.
  useEffect(() => {
    if (!ready || playedRef.current) return;
    const timer = window.setTimeout(() => {
      playedRef.current = true;
      engineRef.current?.seq?.play(0);
    }, SEQUENCE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [ready]);

  // Scroll exit: smoothed progress written to --hp.
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero || prefersReduced()) return;

    let target = 0;
    let current = 0;
    let raf = 0;
    const measure = () => {
      target = Math.min(Math.max(window.scrollY / hero.offsetHeight, 0), 1);
    };
    const tick = () => {
      current += (target - current) * SCROLL_SMOOTHING;
      if (Math.abs(target - current) < 0.0005) current = target;
      hero.style.setProperty("--hp", current.toFixed(4));
      raf = current === target ? 0 : requestAnimationFrame(tick);
    };
    const onScroll = () => {
      measure();
      if (!raf) raf = requestAnimationFrame(tick);
    };

    measure();
    current = target;
    hero.style.setProperty("--hp", current.toFixed(4));
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <section ref={heroRef} className="opening-hero" aria-labelledby="hero-title">
      <div ref={copyRef} className="hero-copy">
        <h1 id="hero-title">
          <span className="l">Become impossible</span> <span className="l">to ignore.</span>
        </h1>
        <p>Learn the right things, build real work, and prove what you can do.</p>
        <div className="actions">
          <a className="btn btn-primary cta-start" href="#">
            Start learning <span className="ar" aria-hidden="true">→</span>
          </a>
          <a className="btn btn-secondary cta-how" href="#how-it-works">
            See how it works <span className="ar" aria-hidden="true">↓</span>
          </a>
        </div>
      </div>
      <p className="sr-only">
        Illustration: Devy the hamster sets the keystone into a foundation, and a city of skills (design, development, data, product and marketing) comes to life.
      </p>
    </section>
  );
};

export default Hero;
