import { useEffect, useRef } from "react";
import { smoothFollow } from "../../lib/smooth-scroll";
import "./question.css";

/* "Sometimes, it starts with a question" (from the section 2 reference).
   A white panel fills the screen with that line, then shrinks into the centre tile of a mosaic
   while six tiles rise out from under it: the things everyone tells you to try. As it settles,
   the line becomes the question itself: "Where do I even start?"
   Focus: the centre tile, always. The six tiles are the noise around it and only drift.

   Scroll-scrubbed and reversible. Geometry is the reference's own 1920 x 1080 stage (1 unit = --u),
   scaled to cover the screen; phones get a portrait arrangement of the same seven tiles.
   Lives inside .hero-v6 so it shares the same colour and type tokens. */

const prefersReduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp = (v: number) => Math.min(1, Math.max(0, v));

/* Scroll timeline, 0 to 1 while pinned (same beats as the reference):
   0.10 - 0.50  the panel shrinks into the mosaic      0.24 - 0.33  the lead-in line leaves
   0.31 - 0.43  the question arrives                    0.50 - 1.00  the rows keep drifting */
const SHRINK = [0.1, 0.5] as const;

const PyVsJs = () => (
  <svg viewBox="0 0 286 198" aria-hidden="true" fill="none" stroke="#10004a" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round">
    <g transform="rotate(-9 78 104)">
      <rect x="20" y="30" width="116" height="140" rx="16" fill="#f6d77a" />
      <path d="M40 132h56M40 148h36" />
      <text x="78" y="104" textAnchor="middle" stroke="none" fill="#10004a" fontWeight="700" fontSize="46">PY</text>
    </g>
    <g transform="rotate(8 208 104)">
      <rect x="150" y="30" width="116" height="140" rx="16" fill="#a8dcf0" />
      <path d="M170 132h56M170 148h36" />
      <text x="208" y="104" textAnchor="middle" stroke="none" fill="#10004a" fontWeight="700" fontSize="46">JS</text>
    </g>
    <circle cx="143" cy="100" r="27" fill="#fff" />
    <text x="143" y="110" textAnchor="middle" stroke="none" fill="#10004a" fontWeight="700" fontSize="26">vs</text>
    <path d="M126 12l6 10M143 6v12M160 12l-6 10" stroke="#fff" />
  </svg>
);

const RoadmapPdf = () => (
  <svg viewBox="0 0 176 206" aria-hidden="true" fill="none" stroke="#10004a" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round">
    <path d="M30 8h96l32 32v150a8 8 0 01-8 8H30a8 8 0 01-8-8V16a8 8 0 018-8z" fill="#fff" />
    <path d="M126 8v32h32" fill="#dde7f9" />
    <path d="M44 50h50" strokeWidth="6" />
    <path d="M52 168c-6-22 30-14 26-34s-36-10-30-32 40-8 46-26 34-4 34 12-28 14-14 30 12 40-14 42" stroke="#253bdf" strokeDasharray="2 9" />
    <circle cx="52" cy="168" r="6" fill="#ff7b00" />
    <circle cx="94" cy="162" r="6" fill="#25d38f" />
    <path d="M118 64l12 12M130 64l-12 12" stroke="#be0000" />
    <rect x="2" y="112" width="70" height="34" rx="7" fill="#ff5a4f" />
    <text x="37" y="137" textAnchor="middle" stroke="none" fill="#fff" fontWeight="700" fontSize="21">PDF</text>
  </svg>
);

const Question = () => {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const view = viewRef.current;
    if (!wrap || !view) return;
    if (prefersReduced()) {
      wrap.classList.add("is-static"); // finished mosaic, unpinned
      return;
    }

    const progress = () => {
      const r = wrap.getBoundingClientRect();
      return clamp(-r.top / Math.max(1, r.height - window.innerHeight));
    };
    const follow = smoothFollow(progress, (p) => {
      const t = clamp((p - SHRINK[0]) / (SHRINK[1] - SHRINK[0]));
      const set = (name: string, v: number) => view.style.setProperty(name, v.toFixed(4));
      set("--e", 1 - (1 - t) * (1 - t)); // settles quickly at first, then eases in
      set("--out", clamp((p - 0.5) / 0.5));
      set("--t1", 1 - clamp((p - 0.24) / 0.09));
      set("--t2", clamp((p - 0.31) / 0.12));
      set("--bc", clamp((p - 0.1) / 0.3));
    });
    // The panel must start exactly large enough to cover the screen, whatever its shape.
    const centre = view.querySelector<HTMLElement>(".qs-centre");
    const fit = () => {
      if (!centre || !centre.offsetWidth) return;
      const zoom = Math.max(window.innerWidth / centre.offsetWidth, window.innerHeight / centre.offsetHeight) * 1.03;
      view.style.setProperty("--zoom", zoom.toFixed(3));
    };
    const kick = () => follow.kick();
    const onResize = () => {
      fit();
      follow.kick();
    };
    fit();
    follow.snap();
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      follow.cancel();
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <section className="qs" id="how-it-works" aria-labelledby="qs-title">
      <div ref={wrapRef} className="qs-wrap">
        <div ref={viewRef} className="qs-view">
          <div className="qs-stage">
            <div className="qs-tile qs-a qs-row-top" aria-hidden="true">
              <p>50-hour videos??</p>
              <img src="/hero-v6/q/videos.png" alt="" />
            </div>
            <div className="qs-tile qs-b qs-row-top" aria-hidden="true">
              <p>Python or<br />JavaScript??</p>
              <PyVsJs />
            </div>
            <div className="qs-tile qs-c qs-row-side" aria-hidden="true">
              <p>Certifications??</p>
              <img src="/hero-v6/q/certifications.png" alt="" />
            </div>
            <div className="qs-tile qs-d qs-row-side" aria-hidden="true">
              <p>YouTube<br />tutorials??</p>
              <img src="/hero-v6/q/tutorials.png" alt="" />
            </div>
            <div className="qs-tile qs-e qs-row-bottom" aria-hidden="true">
              <p>Roadmaps??</p>
              <RoadmapPdf />
            </div>
            <div className="qs-tile qs-f qs-row-bottom" aria-hidden="true">
              <p>Courses??</p>
              <img src="/hero-v6/q/courses.png" alt="" />
            </div>

            <div className="qs-centre">
              <p className="qs-lead" aria-hidden="true">Sometimes, it starts<br />with a question</p>
              <h2 id="qs-title" className="qs-ask">Where do I even start?</h2>
              <img src="/hero-v6/q/devy-thinking.webp" alt="" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Question;
