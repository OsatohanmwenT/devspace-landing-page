import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type React from "react";
import { smoothFollow } from "../../lib/smooth-scroll";
import Cta from "./cta";
import { PixelSticker } from "./pixel-stickers";
import Question from "./question";
import "./hero-v6.css";

/* One column, one focus. The eye runs straight down the centre:
   headline → the one word that changes → button → Devy.
   Only two things ever move: the word in the chip, and Devy.
   Devy holds one pose until the punchline, then puts the lab coat on. */
const BEATS = [
  { word: "you.", pose: "laptop" },
  { word: "your goals.", pose: "laptop" },
  { word: "your pace.", pose: "laptop" },
  { word: "even your headaches.", pose: "scientist" },
] as const;

const BEAT_MS = 3200;

const POSES = [
  { id: "laptop", src: "/hero-v6/devy-laptop.webp" },
  { id: "scientist", src: "/hero-v6/devy-scientist.webp" },
] as const;

/* Eight paths in the side gutters, four a side: one pixel-art object per role, with its
   role tag stuck underneath. Hover one and it comes forward; the others step back. */
const FACES = [
  { id: "frontend", side: "l", x: 5, y: 6, size: 0.95, delay: 0, depth: 22, role: "Frontend", tagRot: -4 },
  { id: "data", side: "l", x: 15, y: 29, size: 0.82, delay: -2.4, depth: 12, role: "Data", tagRot: 3 },
  { id: "pm", side: "l", x: 4, y: 51, size: 0.9, delay: -4.1, depth: 17, role: "PM", tagRot: -3 },
  { id: "security", side: "l", x: 14, y: 74, size: 0.82, delay: -5.6, depth: 14, role: "Security", tagRot: 4 },
  { id: "backend", side: "r", x: 5, y: 5, size: 0.92, delay: -1.2, depth: 18, role: "Backend", tagRot: 4 },
  { id: "ai", side: "r", x: 15, y: 28, size: 0.82, delay: -3.3, depth: 11, role: "AI / ML", tagRot: -3 },
  { id: "video", side: "r", x: 4, y: 50, size: 0.9, delay: -5, depth: 24, role: "Video editing", tagRot: 3 },
  { id: "devops", side: "r", x: 14, y: 73, size: 0.85, delay: -0.6, depth: 16, role: "DevOps", tagRot: -4 },
] as const;

const params = () => new URLSearchParams(window.location.search);
const prefersReduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Review aid: &beat=0..3 holds the loop on one word.
const heldBeat = () => {
  const raw = params().get("beat");
  const n = raw === null ? NaN : Number(raw);
  return Number.isInteger(n) && n >= 0 && n < BEATS.length ? n : null;
};
const HeroV6 = () => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const heroRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [beat, setBeat] = useState(() => heldBeat() ?? 0);
  const [prev, setPrev] = useState(-1);
  const [widths, setWidths] = useState<number[]>([]);

  // The chip hugs the current word, so measure every word and animate between widths.
  // Observing the words themselves catches every cause of a size change (the display font
  // arriving late, a resize, a breakpoint), so the chip can never keep a stale width.
  useLayoutEffect(() => {
    const measure = () => setWidths(wordRefs.current.map((el) => (el ? Math.ceil(el.offsetWidth) : 0)));
    measure();
    const ro = new ResizeObserver(measure);
    wordRefs.current.forEach((el) => el && ro.observe(el));
    return () => ro.disconnect();
  }, []);

  // Advance only while the hero is on screen and the tab is visible.
  useEffect(() => {
    const root = heroRef.current;
    if (!root || prefersReduced() || heldBeat() !== null) return;

    let onScreen = true;
    let timer = 0;
    const tick = () =>
      setBeat((current) => {
        setPrev(current);
        return (current + 1) % BEATS.length;
      });
    const sync = () => {
      window.clearInterval(timer);
      if (onScreen && document.visibilityState === "visible") timer = window.setInterval(tick, BEAT_MS);
    };
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      sync();
    });
    io.observe(root);
    document.addEventListener("visibilitychange", sync);
    sync();

    return () => {
      io.disconnect();
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  /* Scroll. The hero is not pinned and nothing covers it: it leaves with the page, as on the
     reference sites. --p (0 to 1 across the hero, eased with the shared follower) only adds a
     little depth: the face cards rise slightly faster than the stage. The nav stays put and
     picks up a solid backing once the page has moved. */
  useEffect(() => {
    const root = rootRef.current;
    const hero = heroRef.current;
    const nav = navRef.current;
    if (!root || !hero || !nav) return;

    const progress = () => Math.min(1, Math.max(0, window.scrollY / Math.max(1, hero.offsetHeight)));
    const follow = smoothFollow(progress, (p) => root.style.setProperty("--p", p.toFixed(4)));

    const onScroll = () => {
      nav.classList.toggle("is-scrolled", window.scrollY > 24);
      if (prefersReduced()) follow.snap();
      else follow.kick();
    };
    onScroll();
    follow.snap();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      follow.cancel();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  /* Cursor depth. Moving the pointer over the hero nudges the pixel art a few pixels the
     opposite way, each by its own amount, so they read as floating at different distances.
     Eased toward the pointer and asleep when settled; off for touch and reduced motion. */
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero || prefersReduced() || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    let raf = 0;
    const step = () => {
      raf = 0;
      x += (tx - x) * 0.085;
      y += (ty - y) * 0.085;
      if (Math.abs(tx - x) < 0.001 && Math.abs(ty - y) < 0.001) {
        x = tx;
        y = ty;
      }
      hero.style.setProperty("--mx", x.toFixed(4));
      hero.style.setProperty("--my", y.toFixed(4));
      if (x !== tx || y !== ty) raf = requestAnimationFrame(step);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(step);
    };
    const onMove = (e: PointerEvent) => {
      const r = hero.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width) * 2 - 1; // -1 at the left edge, 1 at the right
      ty = ((e.clientY - r.top) / r.height) * 2 - 1;
      kick();
    };
    const onLeave = () => {
      tx = 0;
      ty = 0;
      kick();
    };
    hero.addEventListener("pointermove", onMove);
    hero.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      hero.removeEventListener("pointermove", onMove);
      hero.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const pose = BEATS[beat].pose;

  return (
    <div ref={rootRef} className="hero-v6">
      <header ref={navRef} className="v6-nav">
        <div className="v6-nav-main">
          <a className="v6-brand" href="#" aria-label="Devspace home">
            <img src="/logo-dark.svg" width="129" height="19" alt="Devspace" />
          </a>
          <nav className="v6-links" aria-label="Main navigation">
            <a href="#how-it-works">How it works</a>
            <a href="#paths">Learning paths</a>
            <a href="#pricing">Pricing</a>
          </nav>
        </div>
        <div className="v6-actions">
          <a className="v6-login" href="#">Log in</a>
          <a className="v6-btn v6-btn-ink" href="#paths">Get started</a>
        </div>
      </header>

      <div ref={heroRef} className="v6-hero">
      <main className="v6-stage">
        <div className="v6-copy">
          <h1 aria-label="Learn tech, built around you.">
            <span className="v6-line" aria-hidden="true">Learn tech,</span>
            <span className="v6-line" aria-hidden="true">built around</span>
            <span className="v6-line" aria-hidden="true">
              <span className="v6-chip" style={widths[beat] ? { width: widths[beat] } : undefined}>
                {BEATS.map((b, i) => (
                  <span
                    key={b.word}
                    ref={(el) => { wordRefs.current[i] = el; }}
                    className={`v6-word${i === beat ? " is-in" : ""}${i === prev ? " is-out" : ""}`}
                  >
                    {b.word}
                  </span>
                ))}
              </span>
            </span>
          </h1>

          <p className="v6-sub">
            Tell Devy where you want to go. Your path skips what you know and slows down where you get stuck.
          </p>

          <div className="v6-cta">
            <a className="v6-btn v6-btn-paper" href="#paths">Create your path</a>
            <a className="v6-btn v6-btn-ghost" href="#how-it-works">See how it works</a>
          </div>
        </div>

        <div className="v6-faces" aria-hidden="true">
          {FACES.map((f) => {
            return (
              <div
                key={f.id}
                className={`v6-face v6-face-${f.side}`}
                style={{ "--x": `${f.x}%`, "--y": `${f.y}%`, "--k": f.size, "--d": `${f.delay}s`, "--depth": f.depth, "--tag-r": `${f.tagRot}deg` } as React.CSSProperties}
              >
                <PixelSticker name={f.id} className="v6-face-art" />
                <span className="v6-role">{f.role}</span>
              </div>
            );
          })}
        </div>

        <div className="v6-devy" aria-hidden="true">
          {POSES.map((p) => (
            <img key={p.id} src={p.src} alt="" className={`v6-pose v6-pose-${p.id}${p.id === pose ? " is-in" : ""}`} />
          ))}
        </div>
      </main>
      </div>

      <Question />
      <Cta />
    </div>
  );
};

export default HeroV6;
