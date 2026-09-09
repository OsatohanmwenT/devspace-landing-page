const LOGO_COUNT = 9;

const Marquee = () => {
  return (
    <section className="border-b border-neutral-300 px-8 py-10">
      <p className="mb-6 text-center text-xs uppercase tracking-wide text-neutral-400">
        Backed, recognised and supported by
      </p>
      <div className="mx-auto flex items-center justify-between gap-4">
        {Array.from({ length: LOGO_COUNT }).map((_, i) => (
          <div
            key={i}
            className="flex h-10 w-28 items-center justify-center border border-neutral-300 text-xs text-neutral-400"
          >
            Logo
          </div>
        ))}
      </div>
    </section>
  );
};

export default Marquee;
