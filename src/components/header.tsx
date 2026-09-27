import { useEffect, useRef } from "react";
import "./header.css";

// Below this much scroll the header stays on the hero; past it, it tucks away on scroll down.
const HIDE_AFTER_VH = 60;

const Header = () => {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let lastY = window.scrollY;
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      el.classList.toggle("is-scrolled", y > 24);
      // ignore tiny jitters; hide while heading down the page, show again on any scroll up
      if (Math.abs(y - lastY) > 4) {
        el.classList.toggle("is-hidden", y > lastY && y > (window.innerHeight * HIDE_AFTER_VH) / 100);
        lastY = y;
      }
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
    };
  }, []);

  return (
    <header ref={ref} className="site-header">
      <a href="#hero" aria-label="Devspace home"><img src="/logo-dark.svg" width="129" height="19" alt="Devspace" /></a>
      <nav aria-label="Main navigation">
        <a href="#paths">Paths</a>
        <a href="#lessons">Lessons</a>
        <a href="#progress">Progress</a>
      </nav>
      <a className="header-cta" href="#how-it-works">Explore Devspace <span aria-hidden="true">↗</span></a>
    </header>
  );
};

export default Header;
