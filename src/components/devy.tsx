const FEATURES = [
  {
    title: "Find your next move",
    copy: "Tell Devy what you want to do. Get a route that gives you somewhere real to start.",
  },
  {
    title: "Make hard things clearer",
    copy: "Highlight a concept, ask a question, and keep the lesson moving.",
  },
  {
    title: "Get unstuck while building",
    copy: "Bring Devy into your practice or project when the next step is not obvious.",
  },
];

const Devy = () => {
  return (
    <section id="devy" className="border-b border-neutral-300 px-8 py-35">
      <div className="flex flex-col gap-16 md:flex-row md:items-center">
        <div className="flex-1">
          <span className="text-xs uppercase tracking-wide text-neutral-400">Meet Devy</span>

          <h2 className="mt-4 max-w-md text-4xl font-semibold leading-tight text-neutral-700">
            Help that stays with you.
          </h2>

          <p className="mt-4 max-w-md text-base text-neutral-500">
            Devy knows the path you are on, the lesson you are learning, and the project you are
            trying to finish.
          </p>

          <div className="mt-10 flex flex-col gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="border-t border-neutral-200 pt-6">
                <h3 className="text-base font-semibold text-neutral-700">{f.title}</h3>
                <p className="mt-1 text-sm text-neutral-500">{f.copy}</p>
              </div>
            ))}
          </div>

          <span className="mt-10 inline-block text-sm font-medium text-neutral-600">
            Ask Devy →
          </span>
        </div>

        <div className="relative flex-1">
          <div className="flex h-96 items-center justify-center border border-dashed border-neutral-400 text-sm text-neutral-400">
            Devy — main product scene
          </div>

          <div className="absolute -left-6 -top-6 flex h-20 w-40 items-center justify-center border border-neutral-400 bg-white px-3 text-center text-xs text-neutral-400">
            Route recommendation
          </div>

          <div className="absolute -right-6 top-1/3 flex h-20 w-44 items-center justify-center border border-neutral-400 bg-white px-3 text-center text-xs text-neutral-400">
            In-lesson explanation
          </div>

          <div className="absolute -bottom-6 left-1/4 flex h-20 w-48 items-center justify-center border border-neutral-400 bg-white px-3 text-center text-xs text-neutral-400">
            Help inside practical work
          </div>
        </div>
      </div>
    </section>
  );
};

export default Devy;
