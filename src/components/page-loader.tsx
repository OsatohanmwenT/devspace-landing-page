import { useLayoutEffect, useRef, useState, type RefObject } from "react";
import { FILL_PATH, OPENING_PATH, TRACE_PATH } from "./loader-paths";

// Mark geometry (viewBox units) and the point inside the opening we zoom through.
const W = 382;
const H = 205;
const OX = 220;
const OY = 142;
const MARK_H = 72;
const MARK_H_MOBILE = 56;

// Timeline (ms). The trace draws over LOAD, then everything below is relative to 100%.
const LOAD = 1800;
const REVEAL_AT = 900;
const REVEAL_FOR = 900;
const END = REVEAL_AT + REVEAL_FOR;
const CONTENT_VISIBLE_AT = 700; // matches the old `k < 700` cutoff

const NIGHT = "#0B0D11";
const PAPER = "#F4F2ED";

const ease = {
  arrive: (t: number) => 1 - Math.pow(1 - t, 4),
  move: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  reveal: (t: number) => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2),
};
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (t: number, at: number, dur: number) => clamp((t - at) / dur);

const PageLoader = ({
  contentRef,
  onReveal,
}: {
  contentRef: RefObject<HTMLElement | null>;
  onReveal?: () => void;
}) => {
  const [done, setDone] = useState(false);
  const stageRef = useRef<SVGSVGElement | null>(null);
  const worldRef = useRef<SVGGElement | null>(null);
  const traceRef = useRef<SVGPathElement | null>(null);
  const fillRef = useRef<SVGPathElement | null>(null);
  const plugRef = useRef<SVGUseElement | null>(null);
  const pctRef = useRef<HTMLDivElement | null>(null);
  const onRevealRef = useRef(onReveal);
  onRevealRef.current = onReveal;

  // If this fires more than twice (StrictMode legitimately double-invokes once
  // in dev), `contentRef` almost certainly doesn't have a stable identity and
  // the whole timeline is restarting from 0 on every parent re-render.
  const mountCountRef = useRef(0);

  // Layout effect, so the mark is centred before the first paint rather than on the first animation frame.
  useLayoutEffect(() => {
    const world = worldRef.current;
    const trace = traceRef.current;
    const fill = fillRef.current;
    const plug = plugRef.current;
    const pct = pctRef.current;
    const stage = stageRef.current;
    if (!world || !trace || !fill || !plug || !pct || !stage) return;

    if (process.env.NODE_ENV !== "production") {
      mountCountRef.current += 1;
      if (mountCountRef.current > 2) {
        // eslint-disable-next-line no-console
        console.warn(
          "[PageLoader] effect has re-run %d times — check that `contentRef` " +
            "passed in is a stable useRef() and not recreated on every render.",
          mountCountRef.current
        );
      }
    }

    const content = contentRef.current;
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";

    let revealed = false;
    const reveal = () => {
      if (revealed) return;
      revealed = true;
      onRevealRef.current?.();
    };

    const layout = (scale: number) => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const s0 = (vw < 768 ? MARK_H_MOBILE : MARK_H) / H;
      const cx = vw / 2;
      const cy = vh / 2;
      // Mark stays centred; scaling happens about the opening point.
      const s = s0 * scale;
      const ox = cx + (OX - W / 2) * s0;
      const oy = cy + (OY - H / 2) * s0;
      trace.setAttribute("stroke-width", String(1.5 / s));
      world.setAttribute("transform", `translate(${ox} ${oy}) scale(${s}) translate(${-OX} ${-OY})`);
      pct.style.top = `${cy + (H * s0) / 2 + 40}px`;
    };

    // `visibility: hidden` alone still fully lays out and paints the subtree
    // every frame. If `content` is a real page (not a couple lines of text),
    // that's genuine work competing with this rAF loop for the same frame
    // budget — the most common reason this feels janky next to a bare HTML
    // preview with almost nothing behind it. `content-visibility: hidden`
    // skips layout/paint/hit-testing for the children entirely while the box
    // itself keeps its dimensions, so nothing shifts when we flip it back.
    const setContentHidden = (hidden: boolean) => {
      if (!content) return;
      content.style.visibility = hidden ? "hidden" : "visible";
      (content.style as any).contentVisibility = hidden ? "hidden" : "visible";
    };

    const finish = () => {
      if (content) {
        content.style.filter = "";
        content.style.transform = "";
        content.style.visibility = "";
        (content.style as any).contentVisibility = "";
      }
      html.style.overflow = prevOverflow;
      reveal();
      setDone(true);
    };

    const onResize = () => layout(1);
    window.addEventListener("resize", onResize);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      trace.setAttribute("stroke-dashoffset", "0");
      fill.setAttribute("opacity", "1");
      pct.style.display = "none";
      layout(1);
      stage.style.transition = "opacity .2s";
      const timer = window.setTimeout(() => {
        stage.style.opacity = "0";
        window.setTimeout(finish, 200);
      }, 800);
      return () => {
        window.clearTimeout(timer);
        window.removeEventListener("resize", onResize);
        html.style.overflow = prevOverflow;
      };
    }

    setContentHidden(true);
    layout(1);

    let start: number | null = null;
    let raf = 0;
    let contentShown = false;

    const frame = (now: number) => {
      if (start === null) start = now;
      const t = now - start;

      const p = clamp(t / LOAD);
      trace.setAttribute("stroke-dashoffset", String(1 - p));
      pct.textContent = `${Math.floor(p * 100)}%`;

      const k = t - LOAD; // time since 100%
      fill.setAttribute("opacity", String(ease.arrive(seg(k, 0, 240))));
      trace.style.opacity = String(1 - seg(k, 0, 240));
      pct.style.opacity = String(1 - ease.arrive(seg(k, 0, 200)));
      plug.setAttribute("opacity", String(1 - ease.arrive(seg(k, 700, 200))));

      let scale = 1 + 0.08 * ease.move(seg(k, 500, 400));
      scale *= 1 + ease.reveal(seg(k, REVEAL_AT, REVEAL_FOR)) * 60;

      if (content) {
        const shouldShow = k >= CONTENT_VISIBLE_AT;
        if (shouldShow !== contentShown) {
          contentShown = shouldShow;
          setContentHidden(!shouldShow);
        }
        const r = ease.arrive(seg(k, REVEAL_AT, REVEAL_FOR));
        content.style.filter = `blur(${8 * (1 - r)}px)`;
        content.style.transform = `scale(${1.04 - 0.04 * r})`;
      }
      if (k >= REVEAL_AT) reveal();

      layout(scale);
      if (k < END) raf = requestAnimationFrame(frame);
      else finish();
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      html.style.overflow = prevOverflow;
      if (content) {
        content.style.filter = "";
        content.style.transform = "";
        content.style.visibility = "";
        (content.style as any).contentVisibility = "";
      }
    };
  }, [contentRef]);

  if (done) return null;

  return (
    <>
      <svg ref={stageRef} aria-hidden="true" className="pointer-events-auto fixed inset-0 z-[100] h-full w-full">
        <defs>
          <path id="page-loader-opening" d={OPENING_PATH} />
          <mask id="page-loader-mask" maskUnits="userSpaceOnUse" x="-100000" y="-100000" width="200000" height="200000">
            <rect x="-100000" y="-100000" width="200000" height="200000" fill="#fff" />
            <use href="#page-loader-opening" fill="#000" />
          </mask>
        </defs>
        <g ref={worldRef}>
          <rect x="-100000" y="-100000" width="200000" height="200000" fill={NIGHT} mask="url(#page-loader-mask)" />
          <use
            ref={plugRef}
            href="#page-loader-opening"
            fill={NIGHT}
            stroke={NIGHT}
            strokeWidth="3"
            vectorEffect="non-scaling-stroke"
          />
          <path ref={fillRef} d={FILL_PATH} fill={PAPER} fillRule="evenodd" opacity="0" />
          <path
            ref={traceRef}
            d={TRACE_PATH}
            pathLength={1}
            fill="none"
            stroke={PAPER}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="1 1"
            strokeDashoffset="1"
          />
        </g>
      </svg>
      <div
        ref={pctRef}
        role="status"
        aria-label="Loading"
        className="pointer-events-none fixed left-1/2 z-[101] -translate-x-1/2 text-xs font-medium tracking-[0.08em] tabular-nums text-[rgba(244,242,237,0.45)]"
      >
        0%
      </div>
    </>
  );
};

export default PageLoader;