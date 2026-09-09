const COLUMNS = [
  {
    title: "Company",
    links: ["About", "Careers", "Press kit", "Imprint", "Terms of use", "Privacy policy"],
  },
  {
    title: "Resources",
    links: ["Blog", "Glossary", "Tutorials", "Learner stories", "FAQ", "Support"],
  },
  {
    title: "Paths",
    links: [
      "Frontend Developer",
      "Backend Developer",
      "Full-Stack Developer",
      "Data Analyst",
      "Data Scientist",
      "AI Engineer",
      "UI/UX Designer",
      "Product Designer",
      "Content Creator",
    ],
  },
  {
    title: "Product",
    links: ["Log in", "Register", "Pricing", "Meet Devy", "Mobile app"],
  },
];

const SOCIALS = ["Instagram", "X", "LinkedIn", "TikTok"];

const Footer = () => {
  return (
    <footer className="px-8 py-16">
      <div className="flex flex-col gap-12 lg:flex-row lg:justify-between">
        <div className="max-w-xs">
          <div className="flex h-8 w-32 items-center justify-center border border-neutral-400 text-xs text-neutral-500">
            Logo
          </div>
          <p className="mt-4 text-sm text-neutral-500">For ambitious African builders.</p>

          <div className="mt-6 flex flex-col gap-2">
            <div className="flex h-10 w-36 items-center justify-center border border-neutral-300 text-xs text-neutral-400">
              App Store badge
            </div>
            <div className="flex h-10 w-36 items-center justify-center border border-neutral-300 text-xs text-neutral-400">
              Google Play badge
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-xs uppercase tracking-wide text-neutral-400">{col.title}</p>
              <div className="mt-3 flex flex-col gap-2">
                {col.links.map((link) => (
                  <span key={link} className="text-sm text-neutral-600">
                    {link}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-16 flex flex-col items-start justify-between gap-6 border-t border-neutral-300 pt-6 text-xs text-neutral-400 md:flex-row md:items-center">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
          <span>© 2026 Devspace. All rights reserved.</span>
          <div className="flex gap-4">
            <span>Privacy</span>
            <span>Terms</span>
          </div>
        </div>

        <div className="flex gap-4">
          {SOCIALS.map((s) => (
            <div
              key={s}
              className="flex h-8 w-8 items-center justify-center border border-neutral-300 text-[10px] text-neutral-400"
            >
              {s[0]}
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
