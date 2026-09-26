import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { devySvg } from "./opening/devy";
import { sceneGeo, smoothPath } from "./opening/geometry";

/* =========================================================
   "Your learning should lead somewhere."
   The chaotic path from the opening becomes one straight line.
   Scroll-scrubbed (no hijack), in three beats:
     1. the tangle pulls taut into a straight line      (--morph 0 → 1)
     2. the line fills from the screen edge; each card drops
        onto the line as the tip reaches it              (--fill 0 → 1, .landed)
     3. just after landing, each artefact gets fixed     (.fix-before → .fix-after)
   Devy is waiting at the end.

   Edit the copy and stages here. Each card shows its "before"
   (the mess from the opening) and "after" (sorted) via <Fix />.
========================================================= */

const HEADLINE = "Your learning should lead somewhere.";
const LINES = [
  "What you learn should become something you use.",
  "What you build should show you what to improve.",
  "What you improve should become proof.",
];

// Scroll timeline (0–1 while pinned).
const MORPH_END = 0.26; // the tangle is straight by here
const FILL_START = 0.28;
const FILL_END = 0.86;
// Points sampled along the tangle for the morph.
const MORPH_POINTS = 160;

/** Swaps the mess for the sorted version once the card has landed. */
const Fix = ({ before, after, className = "" }: { before: ReactNode; after: ReactNode; className?: string }) => (
  <span className={`fix ${className}`}>
    <span className="fix-before">{before}</span>
    <span className="fix-after" aria-hidden="true">
      {after}
    </span>
  </span>
);

const Card = ({ children, dark = false, className = "" }: { children: ReactNode; dark?: boolean; className?: string }) => (
  <div
    className={`path-card w-full overflow-hidden rounded-lg border ${
      dark ? "border-neutral-800 bg-neutral-900 text-neutral-200" : "border-neutral-200 bg-white text-neutral-800"
    } ${className}`}
  >
    {children}
  </div>
);

/* The same artefacts that were scattered in the opening, now in order. */

const RoadmapCard = () => (
  <Card className="p-3">
    <p className="flex items-center gap-1.5 text-xs font-semibold">
      <span className="rounded bg-neutral-800 px-1 text-[9px] font-bold text-white">PDF</span>
      <Fix className="min-w-0" before={<span className="block truncate">frontend-roadmap-FINAL(2).pdf</span>} after={<span className="block truncate">Frontend path · step 2 of 6</span>} />
    </p>
    <div className="mt-2 flex flex-col items-center gap-1.5 border border-neutral-100 py-3">
      <span className="h-2.5 w-10 border border-neutral-400 bg-neutral-900" />
      <div className="flex w-full justify-around">
        {/* the current step gets ticked */}
        <span className="fix-fill relative h-2.5 w-8 border border-neutral-400">
          <span className="fix-after absolute -right-3 -top-1.5 text-[10px] font-bold leading-none">✓</span>
        </span>
        <span className="h-2.5 w-8 border border-neutral-400" />
      </div>
      <span className="h-2.5 w-10 border border-neutral-400" />
    </div>
  </Card>
);

const VideoCard = () => (
  <Card>
    <div className="relative flex h-16 items-center justify-center bg-neutral-800">
      <span className="flex h-5 w-7 items-center justify-center rounded-md bg-neutral-100">
        <span className="ml-0.5 border-y-[4px] border-l-[7px] border-y-transparent border-l-neutral-800" />
      </span>
      <span className="absolute bottom-1 right-1 bg-black/80 px-1 font-mono text-[9px] text-white">11:42:08</span>
      {/* progress: 14% → finished */}
      <span className="fix-progress absolute bottom-0 left-0 h-0.5 bg-neutral-300" />
    </div>
    <div className="p-2.5">
      <p className="text-[11px] font-semibold leading-tight">Full-Stack Web Development for Absolute Beginners (2026)</p>
      <p className="mt-1 text-[10px] text-neutral-500">
        <Fix before="Watched 14% · saved 3 months ago" after="✓ Finished · notes saved" />
      </p>
    </div>
  </Card>
);

const CodeCard = () => (
  <Card dark className="p-3 font-mono text-[10px] leading-4">
    <p>
      useEffect(() =&gt; {"{"}
    </p>
    <p className="pl-3 text-neutral-500">
      <Fix before="// why does this run twice??" after={<span className="text-neutral-300">// ✓ runs once: cleanup added</span>} />
    </p>
    <p className="pl-3">fetch("/api/todos")</p>
    <p>{"}"}, [])</p>
  </Card>
);

const ChatCard = () => (
  <Card className="p-3">
    <p className="ml-auto w-fit max-w-[85%] rounded-xl rounded-br-sm bg-neutral-100 px-2.5 py-1.5 text-[11px] leading-snug">
      is my code good enough to apply for jobs?
    </p>
    <Fix
      className="fix-block mt-2.5"
      before={
        <span className="flex flex-col gap-1.5">
          <span className="h-1.5 w-[92%] rounded-full bg-neutral-200" />
          <span className="h-1.5 w-[84%] rounded-full bg-neutral-200" />
          <span className="h-1.5 w-[55%] rounded-full bg-neutral-200" />
        </span>
      }
      after={
        <span className="block border-l-2 border-neutral-900 pl-2 text-[11px] leading-snug text-neutral-700">
          Almost. Fix the 2 notes on your project, then apply.
        </span>
      }
    />
  </Card>
);

const PLAN: [string, string][] = [
  ["Finish JS basics", "Finish JS basics"],
  ["Learn React??", "Learn React"],
  ["Docker (later)", "Ship the todo app"],
  ["Portfolio — fix later", "Portfolio live"],
];

const PlanCard = () => (
  <Card className="p-3">
    <p className="text-xs font-semibold">
      <Fix before="Learning plan v4" after="Plan: on track" />
    </p>
    <ul className="mt-2 flex flex-col gap-1 text-[11px] text-neutral-600">
      {PLAN.map(([before, after], i) => (
        <li key={before} className="flex items-center gap-1.5" style={{ "--i": i } as CSSProperties}>
          {/* the first box was already ticked; the rest tick off in turn */}
          <span className={`fix-check size-2.5 shrink-0 rounded-sm border border-neutral-400 ${i === 0 ? "is-done" : ""}`} />
          <Fix className="fix-strike" before={<span className={i === 0 ? "text-neutral-400 line-through" : ""}>{before}</span>} after={after} />
        </li>
      ))}
    </ul>
  </Card>
);

const PortfolioCard = () => (
  <Card dark className="p-3">
    <p className="flex items-center justify-between gap-2 text-xs font-semibold text-white">
      <Fix before="Portfolio v3 (untitled)" after="Portfolio · 3 projects" />
      <span className="fix-after shrink-0 rounded-full bg-white px-1.5 py-0.5 text-[9px] font-bold text-neutral-900">● Live</span>
    </p>
    <p className="text-[10px] text-neutral-400">
      <Fix before="Edited 5 months ago" after="Updated today" />
    </p>
    <div className="mt-2.5 grid grid-cols-3 gap-1.5">
      <span className="h-9 rounded-sm bg-neutral-200" />
      <span className="h-9 rounded-sm bg-neutral-500" />
      <span className="h-9 rounded-sm bg-neutral-700" />
    </div>
  </Card>
);

const STAGES: { name: string; sub: string; Card: () => ReactNode }[] = [
  { name: "Direction", sub: "know what's next", Card: RoadmapCard },
  { name: "Learn", sub: "what matters", Card: VideoCard },
  { name: "Build", sub: "real projects", Card: CodeCard },
  { name: "Feedback", sub: "what to fix", Card: ChatCard },
  { name: "Improve", sub: "fix and resubmit", Card: PlanCard },
  { name: "Prove", sub: "work people can see", Card: PortfolioCard },
];

// The opening's tangle (desktop scene, 1440 × 2000 units).
const TANGLE_GEO = sceneGeo("desktop");
const TANGLE = smoothPath(TANGLE_GEO.points);
const DEVY = devySvg("sp");

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (t: number) => t * t * (3 - 2 * t);

const Stage = ({ i, vertical = false }: { i: number; vertical?: boolean }) => {
  const { name, sub, Card: StageCard } = STAGES[i];
  // where along the line this stage sits (desktop: re-measured against the full-bleed line)
  const at = vertical ? i / (STAGES.length - 1) : (i + 0.5) / STAGES.length;
  return (
    <div className="path-stage" style={{ "--at": at } as CSSProperties}>
      <div className="path-stage-card">
        <StageCard />
      </div>
      <div className="path-stage-label">
        <p className="font-google-sans-flex text-2xl font-bold tracking-tight text-neutral-900 md:text-[1.75rem]">{name}</p>
        <p className="text-sm text-neutral-500">{sub}</p>
      </div>
    </div>
  );
};

/**
 * Drives the whole section from scroll: writes --morph and --fill, lands the cards,
 * and redraws the tangle as it pulls straight.
 */
const useStraightPath = (
  sectionRef: React.RefObject<HTMLElement | null>,
  stageRef: React.RefObject<HTMLDivElement | null>,
  rowRef: React.RefObject<HTMLDivElement | null>,
  morphRef: React.RefObject<SVGPathElement | null>,
  sampleRef: React.RefObject<SVGPathElement | null>,
) => {
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // tangle points (px, in the stage) and their straight-line targets
    let from: [number, number][] = [];
    let to: [number, number][] = [];
    let lastMorph = -1;

    const measure = () => {
      const stage = stageRef.current;
      const row = rowRef.current;
      const sample = sampleRef.current;
      if (!stage || !row || !sample) return;
      const sr = stage.getBoundingClientRect();
      const line = row.querySelector<HTMLElement>(".path-line")!.getBoundingClientRect();
      if (!line.width) return; // mobile: no morph

      // each stage's position along the full-bleed line
      row.querySelectorAll<HTMLElement>(".path-stage").forEach((el) => {
        const b = el.getBoundingClientRect();
        el.style.setProperty("--at", ((b.left + b.width / 2 - line.left) / line.width).toFixed(4));
      });

      // the tangle, fitted like `xMidYMid slice` over the stage
      const sc = Math.max(sr.width / TANGLE_GEO.W, sr.height / TANGLE_GEO.H);
      const ox = (sr.width - TANGLE_GEO.W * sc) / 2;
      const oy = (sr.height - TANGLE_GEO.H * sc) / 2;
      const L = sample.getTotalLength();
      const x0 = line.left - sr.left;
      const x1 = line.right - sr.left;
      const y = line.top - sr.top + 1;
      from = [];
      to = [];
      for (let i = 0; i <= MORPH_POINTS; i++) {
        const u = i / MORPH_POINTS;
        const pt = sample.getPointAtLength(u * L);
        from.push([pt.x * sc + ox, pt.y * sc + oy]);
        to.push([x0 + (x1 - x0) * u, y]);
      }
      lastMorph = -1;
    };

    const drawMorph = (m: number) => {
      const path = morphRef.current;
      if (!path || !from.length || m === lastMorph) return;
      lastMorph = m;
      let d = "";
      for (let i = 0; i <= MORPH_POINTS; i++) {
        // pulled taut from the left: points further along straighten a little later
        const t = smooth(clamp(m * 1.35 - (i / MORPH_POINTS) * 0.35));
        const x = from[i][0] + (to[i][0] - from[i][0]) * t;
        const yy = from[i][1] + (to[i][1] - from[i][1]) * t;
        d += `${i ? "L" : "M"}${x.toFixed(1)} ${yy.toFixed(1)}`;
      }
      path.setAttribute("d", d);
    };

    let raf = 0;
    const update = () => {
      raf = 0;
      let morph = 1;
      let fill = 1;
      if (!reduced) {
        const { top, height } = section.getBoundingClientRect();
        const scrollable = height - window.innerHeight;
        const p = scrollable > 0 ? clamp(-top / scrollable) : 1;
        morph = clamp(p / MORPH_END);
        fill = clamp((p - FILL_START) / (FILL_END - FILL_START));
      }
      section.style.setProperty("--morph", morph.toFixed(4));
      section.style.setProperty("--fill", fill.toFixed(4));
      drawMorph(morph);
      // a card lands once the tip reaches its stage (and lifts off again on the way back)
      section.querySelectorAll<HTMLElement>(".path-stage").forEach((el) => {
        el.classList.toggle("landed", fill > 0 && fill >= parseFloat(el.style.getPropertyValue("--at")));
      });
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const onResize = () => {
      measure();
      schedule();
    };

    measure();
    update();
    document.fonts.ready.then(onResize);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", onResize);
    };
  }, [sectionRef, stageRef, rowRef, morphRef, sampleRef]);
};

const StraightPath = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const rowRef = useRef<HTMLDivElement | null>(null);
  const morphRef = useRef<SVGPathElement | null>(null);
  const sampleRef = useRef<SVGPathElement | null>(null);
  useStraightPath(sectionRef, stageRef, rowRef, morphRef, sampleRef);

  return (
    <section
      ref={sectionRef}
      className="straight-path relative bg-[#f4f2ed] md:h-[360vh]"
      aria-labelledby="straight-path-title"
      style={{ "--fill": 0, "--morph": 0 } as CSSProperties}
    >
      <div ref={stageRef} className="relative overflow-hidden md:sticky md:top-0 md:flex md:h-screen md:flex-col">
        {/* beat 1: the opening's tangle, pulled taut into the line (desktop) */}
        <svg aria-hidden="true" className="path-morph pointer-events-none absolute inset-0 hidden h-full w-full overflow-visible md:block" fill="none">
          <path ref={sampleRef} d={TANGLE} visibility="hidden" />
          <path ref={morphRef} className="path-morph-line" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        <header className="path-intro relative mx-auto w-full max-w-7xl px-6 pt-24 md:px-10 md:pt-[15vh]">
          <h2 id="straight-path-title" className="font-google-sans-flex text-[clamp(2.25rem,4vw,3.75rem)] font-bold leading-[1.02] tracking-tight text-neutral-900">
            {HEADLINE}
          </h2>
          <div className="mt-5 flex flex-col gap-1 text-base text-neutral-600 md:text-lg">
            {LINES.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </header>

        {/* Desktop: the straight line, cards on top, labels below, Devy at the end */}
        <div className="relative mx-auto mt-auto hidden w-full max-w-7xl px-10 pb-[16vh] md:block">
          <div ref={rowRef} className="relative grid grid-cols-6 gap-6">
            {STAGES.map((stage, i) => (
              <Stage key={stage.name} i={i} />
            ))}

            {/* the line sits between the cards and the labels: in from the left edge, out to Devy near the right edge */}
            <div aria-hidden="true" className="path-line pointer-events-none absolute">
              <span className="path-line-dashed absolute inset-x-0 top-0 border-t-2 border-dashed" />
              <span className="path-line-fill absolute left-0 top-0 h-0.5 bg-neutral-900" />
              <span className="path-line-head absolute top-0 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neutral-900" />
            </div>

            <div aria-hidden="true" className="path-devy pointer-events-none absolute w-[72px]" dangerouslySetInnerHTML={{ __html: DEVY }} />
          </div>
        </div>

        {/* Mobile: the same idea running down the page */}
        <div className="relative px-6 pb-24 pt-12 md:hidden">
          <div className="relative flex flex-col gap-12 pl-8">
            <div aria-hidden="true" className="path-line-v pointer-events-none absolute bottom-0 left-2 top-0">
              <span className="absolute inset-y-0 left-0 border-l-2 border-dashed border-neutral-300" />
              <span className="path-line-fill-v absolute left-0 top-0 w-0.5 bg-neutral-900" />
            </div>
            {STAGES.map((stage, i) => (
              <Stage key={stage.name} i={i} vertical />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StraightPath;
