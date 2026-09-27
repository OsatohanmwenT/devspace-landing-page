import { useEffect, useRef } from "react";
import { Opening as OpeningSequence } from "./opening/opening";
import "./opening/opening.css";

/**
 * The pinned opening: hero (skill city + Devy) → the city comes apart into scattered
 * learning artefacts along a winding path → the tangle drains to paper, handing over to <Question />.
 * The DOM below is the stage; everything that moves is driven by ./opening/opening.ts.
 */
const Opening = ({ ready = true }: { ready?: boolean }) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const sequenceRef = useRef<OpeningSequence | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const q = <T extends HTMLElement>(sel: string) => root.querySelector(sel) as T;
    const sequence = new OpeningSequence({
      root,
      hero: q("#hero"),
      copy: q("#heroCopy"),
      frag: q("#frag"),
      scene: q<HTMLDivElement>("#scene"),
      sceneWrap: q(".scene-wrap"),
      scrim: q(".scrim"),
      narr: q("#narr"),
      payoff: q("#payoff"),
    });
    sequenceRef.current = sequence;
    return () => {
      sequence.destroy();
      sequenceRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (ready) sequenceRef.current?.reveal();
  }, [ready]);

  return (
    <div ref={rootRef} className="opening">
      <div id="stage">
        <section id="hero" aria-labelledby="hero-title">
          <div className="hero-copy" id="heroCopy">
            <h1 id="hero-title">
              <span className="l">Become impossible</span> <span className="l">to ignore.</span>
            </h1>
            <p>Learn the right things, build real work, and prove what you can do.</p>
            <div className="actions">
              <a className="btn btn-primary cta-start" href="#paths">
                Start learning <span className="ar" aria-hidden="true">→</span>
              </a>
              <a className="btn btn-secondary cta-how" href="#how-it-works">
                See how it works <span className="ar" aria-hidden="true">↓</span>
              </a>
            </div>
          </div>
        </section>

        <section id="frag" aria-label="How learning feels today">
          <div className="scene-wrap">
            <div id="scene" className="scene" aria-hidden="true" />
          </div>
          <div className="scrim" aria-hidden="true" />
          <div id="narr" />
          {/* T2 ends on this paper veil; the Question section picks up from there */}
          <div id="payoff">
            <div className="veil" aria-hidden="true" />
          </div>
          <p className="sr-only">
            Illustration: a connected city of skills comes apart into scattered tutorials, courses, saved posts and chats along a winding path.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Opening;
