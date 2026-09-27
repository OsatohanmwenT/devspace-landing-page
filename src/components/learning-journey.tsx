import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { smoothFollow } from "../lib/smooth-scroll";
import Reveal from "./reveal";

/* =========================================================
   Resource cards (wireframe mocks of where people learn)
========================================================= */

const Shell = ({ label, children, dark = false }: { label: string; children: ReactNode; dark?: boolean }) => (
  <div
    className={`border p-3 shadow-[0_10px_30px_rgba(0,0,0,0.06)] ${
      dark ? "border-neutral-800 bg-neutral-900 text-white" : "border-neutral-300 bg-white text-neutral-800"
    }`}
  >
    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">{label}</p>
    {children}
  </div>
);

const GoogleCard = () => (
  <Shell label="Search">
    <p className="truncate rounded-full border border-neutral-300 px-2.5 py-1 text-[11px] text-neutral-500">what should I learn for frontend</p>
    <p className="mt-2 text-[10px] text-neutral-400">About 8,420,000 results</p>
    <p className="text-xs font-medium underline">Frontend developer roadmap</p>
  </Shell>
);

const YouTubeCard = () => (
  <Shell label="Video">
    <div className="relative h-14 bg-neutral-800">
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border-y-[7px] border-l-[11px] border-y-transparent border-l-white" />
      <span className="absolute bottom-1 right-1 bg-white px-1 text-[10px] font-medium text-neutral-700">12:18</span>
    </div>
    <p className="mt-2 text-xs font-semibold leading-tight">Frontend roadmap for beginners</p>
    <p className="mt-0.5 text-[10px] text-neutral-400">48K views</p>
  </Shell>
);

const DocsCard = () => (
  <Shell label="Docs">
    <p className="text-xs font-semibold">React · Quick start</p>
    <p className="mt-1.5 font-mono text-[10px] leading-4 text-neutral-500">
      function MyButton() {"{"}
      <br />
      &nbsp;&nbsp;return &lt;button /&gt;
    </p>
  </Shell>
);

const RoadmapCard = () => (
  <Shell label="Roadmap · PDF">
    <p className="text-xs font-semibold">Frontend developer 2026</p>
    <div className="mt-2.5 flex items-center">
      {["HTML", "React", "Jobs"].map((step, i) => (
        <div key={step} className="flex flex-1 items-center last:flex-none">
          <span className="size-2 rounded-full border border-neutral-500" />
          {i < 2 && <span className="h-px flex-1 bg-neutral-300" />}
        </div>
      ))}
    </div>
    <div className="mt-1 flex justify-between text-[10px] text-neutral-400">
      <span>HTML</span>
      <span>React</span>
      <span>Jobs</span>
    </div>
  </Shell>
);

const BlogCard = () => (
  <Shell label="Article">
    <p className="text-xs font-semibold leading-tight">How to become a better frontend developer</p>
    <p className="mt-1.5 text-[10px] text-neutral-400">web.dev · 8 min read</p>
  </Shell>
);

const AICard = () => (
  <Shell label="AI chat">
    <p className="ml-6 bg-neutral-100 px-2 py-1 text-[11px] leading-tight text-neutral-600">React or Next.js first?</p>
    <p className="mr-4 mt-1.5 border-l-2 border-neutral-400 pl-2 text-[11px] leading-tight text-neutral-500">
      It depends on your goals. Both are great choices…
    </p>
  </Shell>
);

const RedditCard = () => (
  <Shell label="r/learnprogramming">
    <p className="text-xs font-semibold leading-tight">What should I learn after JavaScript?</p>
    <p className="mt-2 flex gap-3 text-[10px] text-neutral-400">
      <span>↑ 184</span>
      <span>42 replies · 42 answers</span>
    </p>
  </Shell>
);

const GitHubCard = () => (
  <Shell label="GitHub" dark>
    <p className="text-xs font-semibold">someone-else/ecommerce-dashboard</p>
    <p className="mt-1 text-[11px] leading-tight text-neutral-300">Cloned. Didn&apos;t change a line.</p>
    <p className="mt-2 text-[10px] text-neutral-400">TypeScript · ★ 3.2k</p>
  </Shell>
);

const CourseCard = () => (
  <Shell label="Course">
    <p className="text-xs font-semibold leading-tight">The complete React course</p>
    <div className="mt-2 h-1 bg-neutral-200">
      <div className="h-full w-2/5 bg-neutral-600" />
    </div>
    <p className="mt-1 text-[10px] text-neutral-400">6 of 15 modules · last opened 3 weeks ago</p>
  </Shell>
);

const InstagramCard = () => (
  <Shell label="Reel">
    <div className="grid h-12 grid-cols-3 gap-px bg-neutral-200">
      <span className="bg-neutral-100" />
      <span className="bg-neutral-300" />
      <span className="bg-neutral-100" />
    </div>
    <p className="mt-2 text-[11px] font-medium text-neutral-600">5 stacks you NEED to learn in 2026</p>
  </Shell>
);

const JobCard = () => (
  <Shell label="Job post">
    <p className="text-xs font-semibold">Junior frontend developer</p>
    <div className="mt-2 flex flex-wrap gap-1 text-[10px] text-neutral-500">
      {["React", "TypeScript", "3+ years"].map((tag) => (
        <span key={tag} className="border border-neutral-300 px-1">
          {tag}
        </span>
      ))}
    </div>
  </Shell>
);

/* =========================================================
   Route data — listed in the order the route visits them.
   x / y are the card's pinned corner, in % of the scene.
========================================================= */

type Stop = { id: string; x: number; y: number; rotate: number; hours: number; Card: () => ReactNode };

const STOPS: Stop[] = [
  { id: "google", x: 2, y: 62, rotate: 2, hours: 1, Card: GoogleCard },
  { id: "youtube", x: 4, y: 2, rotate: -3, hours: 3, Card: YouTubeCard },
  { id: "docs", x: 19, y: 34, rotate: 2.5, hours: 2, Card: DocsCard },
  { id: "roadmap", x: 31, y: 0, rotate: 1.5, hours: 1, Card: RoadmapCard },
  { id: "blog", x: 26, y: 66, rotate: -2.5, hours: 1, Card: BlogCard },
  { id: "ai", x: 46, y: 30, rotate: -2, hours: 1, Card: AICard },
  { id: "reddit", x: 59, y: 3, rotate: -1.5, hours: 2, Card: RedditCard },
  { id: "github", x: 46, y: 64, rotate: 1.5, hours: 4, Card: GitHubCard },
  { id: "course", x: 66, y: 60, rotate: -2, hours: 18, Card: CourseCard },
  { id: "instagram", x: 83, y: 6, rotate: 3, hours: 2, Card: InstagramCard },
  { id: "job", x: 84, y: 58, rotate: 2, hours: 1, Card: JobCard },
];

// Where the route gives up.
const END = { x: 70, y: 36 };

const ROUTE_POINTS = [...STOPS.map(({ x, y }) => ({ x, y })), END];

// Catmull-Rom through every point, as cubic béziers (viewBox is 0–100 on both axes).
const toPath = (pts: { x: number; y: number }[]) =>
  pts.slice(0, -1).reduce((d, p1, i) => {
    const p0 = pts[i - 1] ?? p1;
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    return `${d} C${c1.x} ${c1.y} ${c2.x} ${c2.y} ${p2.x} ${p2.y}`;
  }, `M${pts[0].x} ${pts[0].y}`);

const ROUTE = toPath(ROUTE_POINTS);
const TOTAL_HOURS = STOPS.reduce((sum, stop) => sum + stop.hours, 0);

// Scroll timeline for the route section (0 → 1 while it's pinned).
const DRAW_START = 0.04;
const DRAW_END = 0.78;

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/* =========================================================
   Scroll progress (eased): writes --p onto the element every frame
   and calls onProgress so JS-only bits can follow along.
========================================================= */

const useScrollProgress = (ref: RefObject<HTMLElement | null>, onProgress?: (p: number) => void) => {
  const onProgressRef = useRef(onProgress);
  onProgressRef.current = onProgress;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const apply = (p: number) => {
      el.style.setProperty("--p", p.toFixed(4));
      onProgressRef.current?.(p);
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      apply(1);
      return;
    }

    const target = () => {
      const { top, height } = el.getBoundingClientRect();
      const scrollable = height - window.innerHeight;
      return scrollable > 0 ? clamp(-top / scrollable) : 1;
    };
    // eased like the opening, so the whole flow scrolls with one feel
    const follow = smoothFollow(target, apply);
    const schedule = () => follow.kick();

    follow.snap();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      follow.cancel();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [ref]);
};

/* =========================================================
   Section 1 — the route
========================================================= */

const Stat = ({ label, value, emphasis = false }: { label: string; value: string; emphasis?: boolean }) => (
  <div className={`flex items-baseline justify-between gap-4 px-5 py-3 transition-colors duration-500 ${emphasis ? "bg-neutral-900 text-white" : ""}`}>
    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">{label}</span>
    <span className="font-google-sans-flex text-2xl font-bold tabular-nums">{value}</span>
  </div>
);

const RouteScene = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const headRef = useRef<HTMLSpanElement | null>(null);
  const [stopAt, setStopAt] = useState<number[]>([]);
  const stopAtRef = useRef<number[]>([]);
  const drawRef = useRef(0);
  const [opened, setOpened] = useState(0);
  const [finished, setFinished] = useState(false);

  const syncTally = () => {
    const draw = drawRef.current;
    setOpened(stopAtRef.current.filter((at) => draw >= at).length);
    setFinished(draw >= 1);
  };

  // Where along the route (0–1) each card sits, so it appears as the line reaches it.
  useLayoutEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const total = path.getTotalLength();
    const probe = document.createElementNS("http://www.w3.org/2000/svg", "path");
    stopAtRef.current = STOPS.map((_, i) => {
      if (i === 0) return -0.04; // the route starts here, so it is already open
      probe.setAttribute("d", toPath(ROUTE_POINTS.slice(0, i + 1)));
      return probe.getTotalLength() / total;
    });
    setStopAt(stopAtRef.current);
    syncTally();
  }, []);

  useScrollProgress(sectionRef, (p) => {
    const draw = clamp((p - DRAW_START) / (DRAW_END - DRAW_START));
    drawRef.current = draw;
    sectionRef.current?.style.setProperty("--draw", draw.toFixed(4));

    const path = pathRef.current;
    const head = headRef.current;
    if (path && head) {
      const pt = path.getPointAtLength(draw * path.getTotalLength());
      head.style.left = `${pt.x}%`;
      head.style.top = `${pt.y}%`;
      head.style.opacity = draw > 0 && draw < 1 ? "1" : "0";
    }

    syncTally();
  });

  const hours = STOPS.slice(0, opened).reduce((sum, stop) => sum + stop.hours, 0);

  return (
    <section ref={sectionRef} className="relative hidden h-[320vh] bg-white md:block" aria-labelledby="learning-route-title" style={{ "--draw": 0 } as CSSProperties}>
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden px-8 pt-24 lg:px-12">
        <header className="relative z-30 mx-auto max-w-3xl text-center">
          <h2 id="learning-route-title" className="font-google-sans-flex text-[clamp(2.25rem,3.6vw,4rem)] font-bold leading-[0.98] tracking-tight text-neutral-900">
            You&apos;re not short on things to learn.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[clamp(.95rem,1vw,1.1rem)] leading-relaxed text-neutral-500">
            There&apos;s a lot out there. The hard part is knowing what matters next.
          </p>
        </header>

        {/* Scene: route + pinned cards share the same 0–100 coordinate space */}
        <div className="relative mx-auto mb-6 mt-10 w-full max-w-[1500px] flex-1 [container-type:inline-size]">
          <svg aria-hidden="true" className="absolute inset-0 z-0 h-full w-full overflow-visible text-neutral-900" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none">
            <path d={ROUTE} stroke="currentColor" strokeOpacity="0.12" strokeWidth="1.5" strokeDasharray="4 6" vectorEffect="non-scaling-stroke" />
            <path
              ref={pathRef}
              d={ROUTE}
              pathLength={1}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="1 1"
              vectorEffect="non-scaling-stroke"
              style={{ strokeDashoffset: "calc(1 - var(--draw))" }}
            />
          </svg>

          <span ref={headRef} aria-hidden="true" className="absolute z-20 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neutral-900 opacity-0 ring-4 ring-neutral-900/10" />

          {STOPS.map(({ id, x, y, rotate, Card }, i) => (
            <div
              key={id}
              className="journey-stop absolute z-10 w-[clamp(168px,14.5cqw,216px)]"
              style={{ left: `${x}%`, top: `${y}%`, "--at": stopAt[i] ?? 0, "--rotate": `${rotate}deg` } as CSSProperties}
            >
              <span aria-hidden="true" className="absolute -left-1.5 -top-1.5 z-10 size-3 rounded-full border-2 border-neutral-900 bg-white" />
              <Card />
            </div>
          ))}

          <div className="journey-stop absolute z-10 -translate-x-1/2 -translate-y-1/2" style={{ left: `${END.x}%`, top: `${END.y}%`, "--at": 0.96, "--rotate": "0deg" } as CSSProperties}>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="flex size-9 items-center justify-center rounded-full border-2 border-dashed border-neutral-900 bg-white font-google-sans-flex text-lg font-bold">?</span>
              <span className="bg-white px-1 text-sm font-semibold text-neutral-900">What&apos;s next?</span>
            </div>
          </div>
        </div>

        {/* Running tally */}
        <div className="relative z-30 mx-auto mb-6 grid w-full max-w-[1500px] grid-cols-3 divide-x divide-neutral-300 border border-neutral-300 bg-white">
          <Stat label="Resources opened" value={`${opened}/${STOPS.length}`} />
          <Stat label="Hours spent" value={`${hours}h`} />
          <Stat label="Things you've built" value="0" emphasis={finished} />
        </div>
      </div>
    </section>
  );
};

/* =========================================================
   Section 1 (mobile) — same story, stacked
========================================================= */

const RouteStack = () => (
  <section className="bg-white px-5 pb-16 pt-20 md:hidden" aria-labelledby="learning-route-title-mobile">
    <h2 id="learning-route-title-mobile" className="font-google-sans-flex text-[2.5rem] font-bold leading-[0.98] tracking-tight text-neutral-900">
      You&apos;re not short on things to learn.
    </h2>
    <p className="mt-4 text-base leading-relaxed text-neutral-500">There&apos;s a lot out there. The hard part is knowing what matters next.</p>

    <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-4">
      {STOPS.map(({ id, rotate, Card }, i) => (
        <div key={id} className={i % 2 ? "mt-8" : ""}>
          <Reveal from="bottom">
            <div style={{ rotate: `${rotate * 0.6}deg` }}>
              <Card />
            </div>
          </Reveal>
        </div>
      ))}
    </div>

    <div className="mt-12 grid grid-cols-1 divide-y divide-neutral-300 border border-neutral-300">
      <Stat label="Resources opened" value={`${STOPS.length}`} />
      <Stat label="Hours spent" value={`${TOTAL_HOURS}h`} />
      <Stat label="Things you've built" value="0" emphasis />
    </div>
  </section>
);

/* =========================================================
   Section 2 — question / text fill
========================================================= */

// Each line is a list of words; the last word gets the underline.
const QUESTION_LINES = [
  ["You're", "learning."],
  ["But", "are", "you", "actually", "getting", "better?"],
];

// `className` sets the background, e.g. to match the paper stage of the opening that precedes it.
export const Question = ({ className = "bg-neutral-50" }: { className?: string }) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  useScrollProgress(sectionRef);

  let wordIndex = 0;

  return (
    <section ref={sectionRef} className={`question-scene relative h-[180vh] ${className}`} aria-labelledby="learning-question-title" style={{ "--p": 0 } as CSSProperties}>
      <div className="sticky top-0 flex h-screen items-center justify-center px-6 text-center">
        <h2
          id="learning-question-title"
          className="journey-question max-w-6xl font-google-sans-flex text-[clamp(2.75rem,7.5vw,7.5rem)] font-bold leading-[0.95] tracking-tight"
        >
          {QUESTION_LINES.map((words, line) => (
            <span key={line} className={`block ${line ? "mt-4" : ""}`}>
              {words.map((word, i) => {
                const style = { "--i": wordIndex++ } as CSSProperties;
                const isLast = line === QUESTION_LINES.length - 1 && i === words.length - 1;
                return (
                  <span key={word}>
                    {i > 0 && " "}
                    <span className={`journey-word ${isLast ? "relative inline-block" : ""}`} style={style}>
                      {word}
                      {isLast && (
                        <svg aria-hidden="true" className="absolute -bottom-[0.12em] left-0 h-[0.18em] w-full overflow-visible" viewBox="0 0 200 20" preserveAspectRatio="none" fill="none">
                          <path
                            className="journey-underline"
                            d="M3 13 C40 6 80 5 120 8 C150 10 175 12 197 7"
                            pathLength={1}
                            stroke="currentColor"
                            strokeWidth="6"
                            strokeLinecap="round"
                            vectorEffect="non-scaling-stroke"
                          />
                        </svg>
                      )}
                    </span>
                  </span>
                );
              })}
            </span>
          ))}
        </h2>
      </div>
    </section>
  );
};

const LearningJourney = () => (
  <>
    <RouteScene />
    <RouteStack />
    <Question />
  </>
);

export default LearningJourney;
