type Item =
  | {
      kind: "story";
      name: string;
      path: string;
      outcome: string;
      quote: string;
      span: string;
    }
  | { kind: "image"; label: string; span: string };

const WALL: Item[] = [
  {
    kind: "story",
    name: "Example learner",
    path: "Frontend Developer Path",
    outcome: "Shipped a personal portfolio site",
    quote: "I stopped jumping between tutorials and finally built something I could show.",
    span: "sm:col-span-2 sm:row-span-2",
  },
  { kind: "image", label: "Project image — what they made", span: "sm:col-span-1" },
  {
    kind: "story",
    name: "Example learner",
    path: "Data Analyst Path",
    outcome: "Built a dashboard from a real dataset",
    quote: "Having a next mission waiting meant I never had to guess what to study.",
    span: "sm:col-span-1",
  },
  { kind: "image", label: "Project image — what they made", span: "sm:col-span-1 sm:row-span-2" },
  {
    kind: "story",
    name: "Example learner",
    path: "Product Designer Path",
    outcome: "Redesigned a local business's booking flow",
    quote: "Feedback on real work taught me more than any course video.",
    span: "sm:col-span-1",
  },
  {
    kind: "story",
    name: "Example learner",
    path: "Backend Developer Path",
    outcome: "Deployed their first REST API",
    quote: "Devy explaining my own code back to me is what made it click.",
    span: "sm:col-span-1",
  },
];

const LearnerProof = () => {
  return (
    <section className="border-b border-neutral-300 px-8 py-24">
      <span className="text-xs uppercase tracking-wide text-neutral-400">
        The builders are building
      </span>

      <h2 className="mt-4 max-w-2xl text-4xl font-semibold leading-tight text-neutral-700">
        See what people are becoming capable of.
      </h2>

      <p className="mt-4 max-w-xl border border-neutral-300 px-2 py-1 text-xs text-neutral-400">
        Example stories below — placeholders until real learner submissions are approved to
        feature.
      </p>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {WALL.map((item, i) =>
          item.kind === "image" ? (
            <div
              key={i}
              className={`flex min-h-48 items-center justify-center border border-dashed border-neutral-400 px-4 text-center text-sm text-neutral-400 ${item.span}`}
            >
              {item.label}
            </div>
          ) : (
            <div
              key={i}
              className={`flex flex-col gap-4 border border-neutral-300 p-6 ${item.span}`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-neutral-300 text-[10px] text-neutral-400">
                  Photo
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-700">{item.name}</p>
                  <p className="text-xs text-neutral-400">{item.path}</p>
                </div>
              </div>

              <p className="text-sm italic leading-snug text-neutral-600">“{item.quote}”</p>

              <p className="mt-auto text-xs text-neutral-400">{item.outcome}</p>
            </div>
          )
        )}
      </div>
    </section>
  );
};

export default LearnerProof;
