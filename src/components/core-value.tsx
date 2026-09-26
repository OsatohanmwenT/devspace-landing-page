import { useState } from "react";

const CHAPTERS = [
  {
    kicker: "1.0 — FIND YOUR DIRECTION",
    title: "Devspace finds the path that fits where you're trying to go.",
    copy: "Tell Devy where you're at and where you want to go. Devspace recommends a path and your next mission.",
    items: [
      { n: "1.1", label: "Your goals, interests, and time" },
      { n: "1.2", label: "A recommended starting point" },
      { n: "1.3", label: "A path built around your direction" },
      { n: "1.4", label: "Your next mission" },
    ],
    visual: [
      "The learner's inputs or conversation with Devy",
      "A recommended route appearing",
      "The path preview expanded",
      "“Backend Developer” selected",
      "A visible next mission",
    ],
  },
  {
    kicker: "2.0 — BUILD MOMENTUM",
    title: "Devspace turns your direction into something you can actually do.",
    copy: "Lessons, quick checks, practice, and projects keep moving together, so every session gives you a clear next step.",
    items: [
      { n: "2.1", label: "Learn the idea" },
      { n: "2.2", label: "Try it yourself" },
      { n: "2.3", label: "Get unstuck with Devy" },
      { n: "2.4", label: "Build with what you learned" },
    ],
    visual: null,
  },
  {
    kicker: "3.0 — MAKE YOUR PROOF",
    title: "Devspace turns progress into work with your name on it.",
    copy: "Build projects, submit them, get feedback, improve the details, and leave with work you can show.",
    items: [
      { n: "3.1", label: "Pick a project" },
      { n: "3.2", label: "Build the work" },
      { n: "3.3", label: "Get feedback" },
      { n: "3.4", label: "Share what you made" },
    ],
    visual: null,
  },
];

const AccordionItem = ({ n, label }: { n: string; label: string }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-neutral-300">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-sm text-neutral-700">
          <span className="mr-2 text-neutral-400">{n}</span>
          {label}
        </span>
        <span className="text-neutral-400">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <p className="border-t border-neutral-200 px-4 py-3 text-xs text-neutral-400">
          Detail for this step — placeholder, pending real copy.
        </p>
      )}
    </div>
  );
};

const CoreValue = () => {
  return (
    <section id="how-it-works" tabIndex={-1} className="border-b border-neutral-300 px-8 py-40">
      <span className="text-xs uppercase tracking-wide text-neutral-400">What Devspace does</span>

      <h2 className="mt-4 max-w-2xl text-4xl font-semibold leading-tight">
        <span className="text-neutral-700">Less guessing.</span>{" "}
        <span className="text-neutral-400">More building.</span>
      </h2>

      <p className="mt-4 max-w-xl border border-neutral-300 px-2 py-1 text-base text-neutral-500">
        Devspace gives you a direction, a way to move through it, and real proof when you do.
      </p>

      <div className="mt-15 flex flex-col gap-48">
        {CHAPTERS.map((chapter, i) => (
          <div
            key={chapter.kicker}
            className={`flex flex-col gap-10 md:gap-16 ${
              i % 2 === 1 ? "md:flex-row-reverse" : "md:flex-row"
            }`}
          >
            <div className="flex-1">
              <span className="font-mono text-xs uppercase tracking-wide text-neutral-400">
                {chapter.kicker}
              </span>
              <h3 className="mt-3 max-w-md text-2xl font-semibold text-neutral-700">
                {chapter.title}
              </h3>
              <p className="mt-3 max-w-md text-base text-neutral-500">{chapter.copy}</p>

              <div className="mt-6 flex max-w-md flex-col gap-2">
                {chapter.items.map((item) => (
                  <AccordionItem key={item.n} n={item.n} label={item.label} />
                ))}
              </div>
            </div>

            <div className="flex flex-1 items-center justify-center border border-dashed border-neutral-400 p-6">
              {chapter.visual ? (
                <ul className="flex flex-col gap-2 text-left text-sm text-neutral-400">
                  {chapter.visual.map((line) => (
                    <li key={line} className="flex gap-2">
                      <span className="text-neutral-300">—</span>
                      {line}
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-sm text-neutral-400">Image</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CoreValue;
