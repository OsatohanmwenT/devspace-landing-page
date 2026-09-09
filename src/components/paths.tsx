const FEATURED_PATHS = [
  {
    title: "Frontend Developer",
    copy: "Build polished web experiences people want to use.",
    tags: ["HTML", "CSS", "JavaScript", "React"],
  },
  {
    title: "Data Analyst",
    copy: "Turn messy information into useful answers.",
    tags: ["Excel", "SQL", "Power BI", "Analytics"],
  },
  {
    title: "Product Designer",
    copy: "Shape ideas into digital experiences that work.",
    tags: ["Research", "UX", "UI Design", "Figma"],
  },
  {
    title: "Digital Marketer",
    copy: "Turn attention into action and ideas into growth.",
    tags: ["Strategy", "Content", "Campaigns", "Analytics"],
  },
];

const SKILL_STRIP = [
  "HTML", "CSS", "JavaScript", "Python", "SQL", "React", "Figma", "Power BI", "Git", "AI",
];

const Paths = () => {
  return (
    <section id="paths" className="border-b border-neutral-300 px-8 py-24">
      <span className="text-xs uppercase tracking-wide text-neutral-400">Explore paths</span>

      <h2 className="mt-4 max-w-2xl text-4xl font-semibold leading-tight text-neutral-700">
        There's more than one way in.
      </h2>

      <p className="mt-4 max-w-xl border border-neutral-300 px-2 py-1 text-base text-neutral-500">
        Start with what pulls you forward. Devspace gives you a route, the skills inside it, and
        a clear first mission.
      </p>

      <div className="mt-14 flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-neutral-400">Featured paths</p>
        <div className="flex gap-6">
          <span className="text-sm font-medium text-neutral-600">Explore all paths →</span>
          <span className="text-sm font-medium text-neutral-600">Create your own path →</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURED_PATHS.map((path) => (
          <div key={path.title} className="flex flex-col gap-6 border border-neutral-300 p-6">
            <div className="flex h-20 w-20 items-center justify-center border border-neutral-300 text-xs text-neutral-400">
              Badge
            </div>

            <div>
              <h3 className="text-lg font-semibold text-neutral-700">{path.title}</h3>
              <p className="mt-2 text-sm text-neutral-500">{path.copy}</p>
            </div>

            <div className="mt-auto flex flex-wrap gap-2">
              {path.tags.map((tag) => (
                <span
                  key={tag}
                  className="border border-neutral-300 px-2 py-1 text-xs text-neutral-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-14 flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
        {SKILL_STRIP.map((skill, i) => (
          <span key={skill} className="flex items-center gap-3 text-sm text-neutral-500">
            {i > 0 && <span className="h-1 w-1 rounded-full bg-neutral-300" />}
            {skill}
          </span>
        ))}
      </div>

      <div className="mt-16 flex flex-col items-start gap-4 border-t border-neutral-300 pt-10 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-base font-semibold text-neutral-700">Not sure where to begin?</p>
          <p className="mt-1 text-sm text-neutral-500">
            Tell Devy what interests you and get a recommended path.
          </p>
        </div>
        <div className="border border-neutral-400 px-6 py-3 text-sm text-neutral-500">
          Button
        </div>
      </div>
    </section>
  );
};

export default Paths;
