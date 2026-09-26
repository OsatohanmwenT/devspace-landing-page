import { useEffect, useRef, useState } from "react";

/* =========================================================
   Product tour: sticky copy on the left swaps as each
   product image on the right passes the middle of the screen.

   Edit the content here. Replace `image` with a real
   screenshot/video later (see <Shot /> below).
========================================================= */

type Step = {
  kicker: string;
  title: string;
  copy: string;
  image: { label: string; width: number; height: number };
};

const INTRO = {
  kicker: "Inside Devspace",
  title: "From “what should I learn?” to “look what I built.”",
};

const STEPS: Step[] = [
  {
    kicker: "Find your path",
    title: "We recommend. You decide.",
    copy: "Devy suggests a path from your goals, interests, experience and time. Or explore a path you already like, focus on one skill, or build your own.",
    image: { label: "Path recommendation", width: 1200, height: 900 },
  },
  {
    kicker: "Learn",
    title: "Learn, watch and practise in one flow.",
    copy: "Clear explanations, short video clips, examples and diagrams, quick checks and practical exercises, all in the same lesson.",
    image: { label: "Lesson view", width: 1200, height: 900 },
  },
  {
    kicker: "Build",
    title: "Code live, with Devy beside you.",
    copy: "Write and run code in the live editor, and ask Devy about any text or code while you work.",
    image: { label: "Live code editor + Devy", width: 1200, height: 900 },
  },
  {
    kicker: "Prove it",
    title: "Submit real work, not just answers.",
    copy: "Hand in live links, Figma files, spreadsheets, Power BI reports or screenshots. Proof for design and data paths too, not only code.",
    image: { label: "Project submission", width: 1200, height: 900 },
  },
  {
    kicker: "Keep going",
    title: "Progress you can see, and rewards you can earn.",
    copy: "XP, streaks and leaderboards keep you moving, and cash rewards make the effort count.",
    image: { label: "Progress & rewards", width: 1200, height: 900 },
  },
];

const pad = (n: number) => String(n).padStart(2, "0");

/** Placeholder product image (right column, 60% of the width): states its size. Swap the inside for an <img> or <video> later. */
const Shot = ({ image, active }: { image: Step["image"]; active: boolean }) => (
  <div
    className={`relative w-full border border-neutral-300 bg-neutral-100 transition-[opacity,scale] duration-500 ease-out ${
      active ? "scale-100 opacity-100" : "scale-[0.97] opacity-40"
    }`}
    style={{ aspectRatio: `${image.width} / ${image.height}` }}
  >
    {/* corner markers */}
    {["left-3 top-3", "right-3 top-3", "bottom-3 left-3", "bottom-3 right-3"].map((pos) => (
      <span key={pos} aria-hidden="true" className={`absolute ${pos} size-1.5 rounded-full bg-neutral-400`} />
    ))}
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-center">
      <span className="text-sm font-medium text-neutral-500">{image.label}</span>
      <span className="font-mono text-xs text-neutral-400">
        {image.width} × {image.height}
      </span>
    </div>
  </div>
);

/** Index of the step whose image currently crosses the middle of the viewport. */
const useActiveStep = (refs: React.RefObject<(HTMLElement | null)[]>) => {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const els = refs.current.filter(Boolean) as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.step));
        }
      },
      // a 1px line across the middle of the screen
      { rootMargin: "-50% 0px -50% 0px" },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [refs]);

  return active;
};

const ProductTour = () => {
  const shotRefs = useRef<(HTMLElement | null)[]>([]);
  const active = useActiveStep(shotRefs);

  return (
    <section className="border-b border-neutral-300 bg-white px-6 md:px-10" aria-labelledby="product-tour-title">
      <div className="mx-auto max-w-7xl">
        {/* Intro */}
        <header className="max-w-2xl pb-16 pt-32 md:pb-8">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-400">{INTRO.kicker}</span>
          <h2 id="product-tour-title" className="mt-4 font-google-sans-flex text-[clamp(2.25rem,4vw,3.5rem)] font-bold leading-[1.02] tracking-tight text-neutral-900">
            {INTRO.title}
          </h2>
        </header>

        {/* Desktop: sticky copy (left, 40%) + scrolling images (right, 60%) */}
        <div className="hidden md:grid md:grid-cols-[2fr_3fr] md:gap-16 lg:gap-24">
          <div className="sticky top-0 flex h-screen flex-col justify-center">
            <div className="flex items-center gap-3 font-mono text-xs text-neutral-400">
              <span className="text-neutral-900">{pad(active + 1)}</span>
              <span className="relative h-px w-24 bg-neutral-200">
                <span
                  className="absolute inset-y-0 left-0 bg-neutral-900 transition-[width] duration-500 ease-out"
                  style={{ width: `${((active + 1) / STEPS.length) * 100}%` }}
                />
              </span>
              <span>{pad(STEPS.length)}</span>
            </div>

            {/* all steps share one grid cell, so the column keeps the height of the tallest */}
            <div className="mt-8 grid">
              {STEPS.map((step, i) => (
                <div
                  key={step.kicker}
                  aria-hidden={i !== active}
                  className={`col-start-1 row-start-1 transition-[opacity,translate] duration-500 ease-out ${
                    i === active ? "translate-y-0 opacity-100" : i < active ? "-translate-y-4 opacity-0" : "translate-y-4 opacity-0"
                  }`}
                >
                  <span className="inline-block rounded-full bg-neutral-900 px-3 py-1 text-xs font-semibold text-white">{step.kicker}</span>
                  <h3 className="mt-5 max-w-md font-google-sans-flex text-[clamp(1.75rem,2.6vw,2.5rem)] font-bold leading-[1.05] tracking-tight text-neutral-900">
                    {step.title}
                  </h3>
                  <p className="mt-4 max-w-md text-base leading-relaxed text-neutral-500">{step.copy}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-[20vh] py-[25vh]">
            {STEPS.map((step, i) => (
              <figure
                key={step.kicker}
                ref={(el) => {
                  shotRefs.current[i] = el;
                }}
                data-step={i}
                className="m-0"
              >
                <Shot image={step.image} active={i === active} />
              </figure>
            ))}
          </div>
        </div>

        {/* Mobile: each step's copy sits above its image */}
        <div className="flex flex-col gap-20 pb-24 md:hidden">
          {STEPS.map((step, i) => (
            <div key={step.kicker}>
              <span className="font-mono text-xs text-neutral-400">
                {pad(i + 1)} / {pad(STEPS.length)}
              </span>
              <span className="ml-3 inline-block rounded-full bg-neutral-900 px-3 py-1 text-xs font-semibold text-white">{step.kicker}</span>
              <h3 className="mt-4 font-google-sans-flex text-3xl font-bold leading-[1.05] tracking-tight text-neutral-900">{step.title}</h3>
              <p className="mt-3 text-base leading-relaxed text-neutral-500">{step.copy}</p>
              <div className="mt-6">
                <Shot image={step.image} active />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductTour;
