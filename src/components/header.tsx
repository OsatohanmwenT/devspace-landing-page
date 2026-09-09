const NAV_LINKS = ["Lessons", "Progress", "Pricing"];

const PATH_LINKS = [
  {
    title: "Explore all paths",
    description: "Browse every path we offer.",
    color: "bg-devy-navy",
    text: "text-white",
    sub: "text-white/70",
  },
  {
    title: "Focus on one skill",
    description: "Go deep on a single topic.",
    color: "bg-lime",
    text: "text-ink",
    sub: "text-ink/70",
  },
];

const SignpostIllustration = () => (
  <svg viewBox="0 0 160 110" fill="none" className="h-full w-auto" aria-hidden="true">
    <rect x="76" y="14" width="6" height="82" rx="3" fill="#ffffff" fillOpacity="0.85" />
    <g><rect x="30" y="24" width="56" height="20" rx="4" fill="#d9fa3e" /><path d="M86 24 L98 34 L86 44 Z" fill="#d9fa3e" /></g>
    <g><rect x="76" y="50" width="48" height="20" rx="4" fill="#ffffff" /><path d="M76 50 L64 60 L76 70 Z" fill="#ffffff" /></g>
    <g><rect x="34" y="76" width="42" height="20" rx="4" fill="#ff6f59" /><path d="M76 76 L86 86 L76 96 Z" fill="#ff6f59" /></g>
    <circle cx="79" cy="102" r="7" fill="#ffffff" fillOpacity="0.25" />
  </svg>
);

const Header = () => {
  return (
    <header className="sticky mx-auto top-0 z-50 flex h-16 items-center justify-between bg-[#f8f8f7] px-10">
      <div className="flex items-center gap-12">
        <a href="/" className="shrink-0">
          <img src="/logo-dark.svg" alt="Devspace" className="h-5.5 w-auto" />
        </a>

        <nav className="hidden items-center gap-7 md:flex">
          <div className="group relative">
            <button
              type="button"
              className="flex items-center gap-1 text-[14px] font-medium text-neutral-600 transition-colors group-hover:text-blue-deep"
            >
              Paths
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-180"
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

            <div className="invisible absolute left-0 top-full pt-2 opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100">
              <div className="flex w-136 gap-3 rounded-xl rounded-tl-none border border-black/5 bg-[#f8f8f7] p-3 shadow-lg shadow-black/10">
                <a
                  href="#"
                  className="group/card relative flex w-56 shrink-0 flex-col justify-between overflow-hidden rounded-lg bg-blue p-4 transition-transform hover:-translate-y-0.5"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">Recommended for you</p>
                    <p className="mt-1 text-xs text-white/70">
                      Devy picks a path based on your goals, interests and time.
                    </p>
                  </div>
                  <div className="-mx-4 -mb-4 mt-3 flex h-24 items-end justify-center bg-white/5">
                    <SignpostIllustration />
                  </div>
                </a>

                <div className="grid flex-1 grid-cols-2 gap-3">
                  {PATH_LINKS.map((path) => (
                    <a
                      key={path.title}
                      href="#"
                      className={`group/card relative flex min-h-24 flex-col justify-between overflow-hidden rounded-lg p-4 transition-transform hover:-translate-y-0.5 ${path.color}`}
                    >
                      <div>
                        <p className={`text-sm font-semibold ${path.text}`}>{path.title}</p>
                        <p className={`mt-1 text-xs ${path.sub}`}>{path.description}</p>
                      </div>
                      <svg viewBox="0 0 24 24" fill="none" className={`h-4 w-4 self-end opacity-70 transition-transform group-hover/card:translate-x-0.5 ${path.text}`}>
                        <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </a>
                  ))}

                  <a
                    href="#"
                    className="group/card col-span-2 flex flex-col justify-between rounded-lg bg-coral/10 p-4 transition-transform hover:-translate-y-0.5"
                  >
                    <div>
                      <p className="text-sm font-semibold text-ink">Create a custom path</p>
                      <p className="mt-1 text-xs text-ink/60">Build your own from scratch.</p>
                    </div>
                    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 self-end text-coral opacity-90 transition-transform group-hover/card:translate-x-0.5">
                      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {NAV_LINKS.map((link) => (
            <a
              key={link}
              href="#"
              className="text-[14px] font-medium text-neutral-600 transition-colors hover:text-blue-deep"
            >
              {link}
            </a>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <a
          href="#"
          className="hidden text-sm font-medium text-black/70 transition-colors hover:text-black md:block"
        >
          Log in
        </a>
        <a
          href="#"
          className="rounded-xl bg-blue-deep px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-black/20 transition-colors hover:bg-blue"
        >
          Start learning
        </a>
        <button
          type="button"
          aria-label="Open menu"
          className="flex h-9.5 w-9.5 items-center justify-center rounded-xl bg-black/5 text-black/70 shadow-sm shadow-black/10 transition-colors hover:bg-black/10 hover:text-black md:hidden"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
            <path
              d="M4 6h16M4 12h16M4 18h16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;
