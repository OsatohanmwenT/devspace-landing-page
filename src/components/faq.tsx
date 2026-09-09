import { useState } from "react";

const QUESTIONS = [
  {
    q: "Is Devspace free to use?",
    a: "Pricing details — placeholder, pending confirmation.",
  },
  {
    q: "How much time do I need each week?",
    a: "Time commitment — placeholder, pending confirmation.",
  },
  {
    q: "Do I need any experience to start?",
    a: "Paths are built to be beginner-friendly — exact prerequisites to be confirmed per path.",
  },
  {
    q: "Is Devspace available on mobile, or just the web?",
    a: "Platform availability — placeholder, pending confirmation.",
  },
  {
    q: "What if I get stuck on a lesson or project?",
    a: "Ask Devy about any text or code without leaving what you're working on.",
  },
  {
    q: "Can I switch paths after I've started?",
    a: "Yes — explore a different path, focus on one skill, or build a custom route any time.",
  },
  {
    q: "Do I get anything to show for completing a path?",
    a: "Submit real work — live links, Figma files, spreadsheets, or screenshots — as proof of progress.",
  },
  {
    q: "What happens after I finish a path?",
    a: "Next-path guidance — placeholder, pending confirmation.",
  },
];

const FaqItem = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-neutral-300">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <span className="text-base font-medium text-neutral-700">{q}</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className={`h-4 w-4 shrink-0 text-neutral-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        >
          <path
            d="m6 9 6 6 6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open && <p className="px-5 pb-4 text-sm text-neutral-500">{a}</p>}
    </div>
  );
};

const Faq = () => {
  return (
    <section className="border-b border-neutral-300 px-8 py-24">
      <div className="flex flex-col gap-10 md:flex-row md:gap-16">
        <div className="md:w-1/3">
          <span className="text-xs uppercase tracking-wide text-neutral-400">FAQ</span>
          <h2 className="mt-4 max-w-xs text-3xl font-semibold text-neutral-700">
            Questions you might have.
          </h2>
        </div>

        <div className="flex flex-1 flex-col gap-3">
          {QUESTIONS.map((item) => (
            <FaqItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Faq;
