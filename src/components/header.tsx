const Header = () => (
  <header className="site-header">
    <a href="#hero" aria-label="Devspace home"><img src="/logo-dark.svg" width="129" height="19" alt="Devspace" /></a>
    <nav aria-label="Main navigation">
      <a href="#paths">Paths</a>
      <a href="#lessons">Lessons</a>
      <a href="#progress">Progress</a>
    </nav>
    <a className="header-cta" href="#how-it-works">Explore Devspace <span aria-hidden="true">↗</span></a>
  </header>
);

export default Header;
