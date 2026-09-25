const AUDIENCES = [
  {
    title: "Universities",
    copy: "Give students a structured, project-based path alongside coursework — with proof of work they can show employers.",
  },
  {
    title: "Bootcamps",
    copy: "Extend your curriculum with guided practice, an AI tutor, and project submissions your cohorts can build a portfolio from.",
  },
  {
    title: "Companies training talent",
    copy: "Upskill your team on a real path with missions, feedback, and visible progress — not just a course library nobody finishes.",
  },
];

const Institutions = () => {
  return (
    <section id="institutions" className="border-b border-neutral-300 px-8 py-24">
      <span className="text-xs uppercase tracking-wide text-neutral-400">
        For institutions &amp; employers
      </span>

      <h2 className="mt-4 max-w-2xl text-4xl font-semibold leading-tight text-neutral-700">
        Bring Devspace to your organization.
      </h2>

      <p className="mt-4 max-w-xl border border-neutral-300 px-2 py-1 text-base text-neutral-500">
        Custom plans for universities, bootcamps, and companies training talent at scale — the
        same paths, missions, and proof of work, built around your cohort.
      </p>

      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        {AUDIENCES.map((a) => (
          <div key={a.title} className="flex flex-col gap-3 border border-neutral-300 p-6">
            <h3 className="text-lg font-semibold text-neutral-700">{a.title}</h3>
            <p className="text-sm text-neutral-500">{a.copy}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 border border-neutral-400 px-6 py-3 text-sm text-neutral-500 inline-block">
        Request an institution plan
      </div>
    </section>
  );
};

export default Institutions;
