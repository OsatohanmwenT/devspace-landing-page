import { useEffect, useLayoutEffect, useRef, useState } from "react";
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
  useLayoutEffect(() => {
    const measure = () => setWidths(wordRefs.current.map((el) => (el ? Math.ceil(el.getBoundingClientRect().width) : 0)));
    measure();
    document.fonts.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
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
          <h1 aria-label="Learn tech on a path that adapts to you.">
            <span className="v6-line" aria-hidden="true">Learn tech on a path</span>
            <span className="v6-line" aria-hidden="true">that adapts to</span>
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
