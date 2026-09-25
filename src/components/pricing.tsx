const TIERS = [
  {
    name: "Individual",
    price: "Price TBD",
    copy: "For builders learning on their own path.",
    features: ["All beginner-friendly paths", "Live editor & Devy", "Project submissions"],
  },
  {
    name: "Institution",
    price: "Custom pricing",
    copy: "For universities, bootcamps, and companies training a cohort.",
    features: ["Everything in Individual", "Cohort management", "Progress reporting"],
    highlighted: true,
  },
];

const Pricing = () => {
  return (
    <section id="pricing" className="border-b border-neutral-300 px-8 py-24">
      <span className="text-xs uppercase tracking-wide text-neutral-400">Pricing</span>

      <h2 className="mt-4 max-w-xl text-4xl font-semibold leading-tight text-neutral-700">
        Start building today.
      </h2>

      <p className="mt-3 text-xs text-neutral-400">
        Exact pricing — placeholder, pending confirmation. Structure shown to reflect a live
        product, not a waitlist.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 md:max-w-2xl">
        {TIERS.map((tier) => (
          <div
            key={tier.name}
            className={`flex flex-col gap-4 border p-6 ${
              tier.highlighted ? "border-2 border-neutral-500" : "border-neutral-300"
            }`}
          >
            <div>
              <h3 className="text-lg font-semibold text-neutral-700">{tier.name}</h3>
              <p className="mt-1 text-2xl font-semibold text-neutral-600">{tier.price}</p>
              <p className="mt-2 text-sm text-neutral-500">{tier.copy}</p>
            </div>
            <ul className="flex flex-col gap-1.5 border-t border-neutral-200 pt-4 text-sm text-neutral-500">
              {tier.features.map((f) => (
                <li key={f}>— {f}</li>
              ))}
            </ul>
            <div className="mt-auto border border-neutral-400 px-6 py-3 text-center text-sm text-neutral-500">
              {tier.highlighted ? "Request a plan" : "Get started"}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Pricing;
