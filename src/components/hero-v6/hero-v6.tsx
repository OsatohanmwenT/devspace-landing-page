import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type React from "react";
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

/* Six learners in the side gutters, three a side. Each sits in a rounded card with one
   deliberate irregularity, taken from the Devspace avatar board: a stepped-off corner,
   a diagonal notch, or folder-style tabs. Paths are drawn in a 100 x 100 box. */
const SHAPES = {
  // top-right corner stepped down, like a file card
  step: "M8 0H76Q83 0 83 7V9Q83 16 90 16H92Q100 16 100 24V92Q100 100 92 100H8Q0 100 0 92V8Q0 0 8 0Z",
  // bottom-right corner cut back on a diagonal
  notch: "M8 0H92Q100 0 100 8V79Q100 83 97 86L92 91Q89 94 89 97Q89 100 84 100H8Q0 100 0 92V8Q0 0 8 0Z",
  // a raised tab along the top and a small tab on the side
  tab: "M8 9H52Q57 9 57 4.5Q57 0 62 0H85Q93 0 93 8V41Q93 45 96.5 45Q100 45 100 49V63Q100 67 96.5 67Q93 67 93 71V92Q93 100 85 100H8Q0 100 0 92V17Q0 9 8 9Z",
} as const;

const FACES = [
  { id: "frontend", shape: "tab", tone: "#e3dcfa", side: "l", x: 5, y: 11, size: 1, delay: 0 },
  { id: "data", shape: "notch", tone: "#fbe0b8", side: "l", x: 13, y: 43, size: 0.86, delay: -2.4 },
  { id: "security", shape: "step", tone: "#d6e4fb", side: "l", x: 4, y: 70, size: 0.94, delay: -4.1 },
  { id: "backend", shape: "step", tone: "#d8f1fa", side: "r", x: 5, y: 10, size: 0.96, delay: -1.2 },
  { id: "ai", shape: "tab", tone: "#f6ecdf", side: "r", x: 13, y: 42, size: 0.86, delay: -3.3 },
  { id: "devops", shape: "notch", tone: "#dcebd3", side: "r", x: 4, y: 69, size: 1, delay: -5 },
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
    const root = rootRef.current;
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

  const pose = BEATS[beat].pose;

  return (
    <div ref={rootRef} className="hero-v6">
      <header className="v6-nav">
        <a className="v6-brand" href="#" aria-label="Devspace home">
          <img src="/logo-dark.svg" width="129" height="19" alt="Devspace" />
        </a>
        <nav className="v6-links" aria-label="Main navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#paths">Learning paths</a>
          <a href="#pricing">Pricing</a>
        </nav>
        <div className="v6-actions">
          <a className="v6-login" href="#">Log in</a>
          <a className="v6-btn v6-btn-ink" href="#paths">Get started</a>
        </div>
      </header>

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
            // cards on the right are mirrored so their notches and tabs face the centre column
            const flip = f.side === "r" ? "translate(100 0) scale(-1 1)" : undefined;
            return (
              <svg
                key={f.id}
                className={`v6-face v6-face-${f.side}`}
                viewBox="-2 -2 104 104"
                style={{ "--x": `${f.x}%`, "--y": `${f.y}%`, "--k": f.size, "--d": `${f.delay}s` } as React.CSSProperties}
              >
                <clipPath id={`v6-card-${f.id}`}>
                  <path d={SHAPES[f.shape]} transform={flip} />
                </clipPath>
                <path d={SHAPES[f.shape]} transform={flip} fill={f.tone} />
                <image href={`/hero-v6/face-${f.id}.png`} x="-9" y="-2" width="118" height="118" clipPath={`url(#v6-card-${f.id})`} />
                <path className="v6-card-edge" d={SHAPES[f.shape]} transform={flip} />
              </svg>
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
  );
};

export default HeroV6;
