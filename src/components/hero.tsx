const PawSketch = () => (
  <svg viewBox="0 0 200 200" fill="none" className="h-32 w-32" aria-hidden="true">
    <path
      d="M60 150c-8-20-6-42 10-58 14-14 34-18 50-8 18 11 24 32 18 52-5 16-18 28-38 30-18 2-33-1-40-16Z"
      stroke="#a3a3a3"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <ellipse cx="66" cy="72" rx="12" ry="15" transform="rotate(-18 66 72)" stroke="#a3a3a3" strokeWidth="2" />
    <ellipse cx="96" cy="56" rx="12" ry="16" stroke="#a3a3a3" strokeWidth="2" />
    <ellipse cx="126" cy="66" rx="11" ry="15" transform="rotate(14 126 66)" stroke="#a3a3a3" strokeWidth="2" />
    <ellipse cx="146" cy="92" rx="10" ry="13" transform="rotate(32 146 92)" stroke="#a3a3a3" strokeWidth="2" />
  </svg>
);

const Hero = () => {
  return (
    <section className="border-b border-neutral-300 py-16">
      <div className="flex max-w-3xl flex-col items-start gap-4 px-8">
        <span className="border border-neutral-300 px-2 py-1 text-xs uppercase tracking-wide text-neutral-400">
          For Africa's next generation of builders
        </span>

        <div className="border border-neutral-400 px-2 py-1 text-4xl font-semibold leading-tight text-neutral-700">
          Become impossible to ignore.
        </div>

        <p className="mt-2 border border-neutral-300 px-2 py-1 text-base text-neutral-500">
          Tell us where you want to go. Devy recommends the way forward. Learn the skills and
          build real work that proves what you can do.
        </p>

        <div className="mt-4 flex gap-3">
          <div className="border border-neutral-400 px-6 py-3 text-sm text-neutral-500">
            Find my path
          </div>
          <div className="border border-neutral-300 px-6 py-3 text-sm text-neutral-400">
            See how it works
          </div>
        </div>
      </div>

      <div className="mt-10 flex h-[420px] w-full flex-col items-center justify-center gap-3 border border-dashed border-neutral-400 text-sm text-neutral-400">
        <PawSketch />
        Image
      </div>
    </section>
  );
};

export default Hero;
