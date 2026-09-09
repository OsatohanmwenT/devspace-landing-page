const NAV_LINKS = ["Paths", "Lessons", "Progress", "Pricing"];

const Header = () => {
  return (
    <header className="flex h-16 items-center justify-between border-b border-neutral-300 px-8">
      <div className="flex items-center gap-10">
        <div className="flex h-8 w-32 items-center justify-center border border-neutral-400 text-xs text-neutral-500">
          Logo
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <span key={link} className="text-sm text-neutral-500">
              {link}
            </span>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-neutral-400">Log in</span>
        <div className="border border-neutral-400 px-4 py-2 text-sm text-neutral-500">
          Button
        </div>
      </div>
    </header>
  );
};

export default Header;
