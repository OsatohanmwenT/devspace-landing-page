const QUOTES = [
  {
    quote:
      "Quote placeholder — pending a real testimonial from a partner or mentor who has worked with Devspace.",
    name: "Example name",
    role: "Role, Organisation",
  },
  {
    quote:
      "Quote placeholder — pending a real testimonial from a partner or mentor who has worked with Devspace.",
    name: "Example name",
    role: "Role, Organisation",
  },
  {
    quote:
      "Quote placeholder — pending a real testimonial from a partner or mentor who has worked with Devspace.",
    name: "Example name",
    role: "Role, Organisation",
  },
];

const Testimonials = () => {
  return (
    <section className="border-b border-neutral-300 px-8 py-24">
      <span className="text-xs uppercase tracking-wide text-neutral-400">[Testimonial]</span>

      <h2 className="mt-4 max-w-xl text-4xl font-semibold leading-tight text-neutral-700">
        Co-signed by the people who've seen it happen.
      </h2>

      <p className="mt-3 text-xs text-neutral-400">
        Example quotes below — placeholders until real partner testimonials are confirmed.
      </p>

      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        {QUOTES.map((t, i) => (
          <div key={i} className="flex flex-col gap-6 border border-neutral-300 p-6">
            <span className="text-3xl text-neutral-300">“</span>

            <p className="text-sm leading-relaxed text-neutral-600">{t.quote}</p>

            <div className="mt-auto flex items-center gap-3">
              <div className="h-10 w-10 shrink-0 rounded-full border border-neutral-300" />
              <div>
                <p className="text-sm font-semibold text-neutral-700">{t.name}</p>
                <p className="text-xs text-neutral-400">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
