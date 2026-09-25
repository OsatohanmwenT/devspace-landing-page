import { useEffect, useRef, useState } from "react";

const Hero = ({ ready = true }: { ready?: boolean }) => {
  const heroRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const updateScrollProgress = () => {
      if (!heroRef.current) return;

      const { height, top } = heroRef.current.getBoundingClientRect();
      setScrollProgress(Math.min(Math.max(-top / (height * 0.8), 0), 1));
    };

    const frame = requestAnimationFrame(updateScrollProgress);

    window.addEventListener("scroll", updateScrollProgress, { passive: true });
    window.addEventListener("resize", updateScrollProgress);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateScrollProgress);
      window.removeEventListener("resize", updateScrollProgress);
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const frame = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(frame);
  }, [ready]);

  return (
    <section ref={heroRef} className="relative isolate min-h-[840px] overflow-hidden bg-white px-6 pb-10 pt-32 md:min-h-[900px] md:px-10 md:pt-40">
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center text-center">
        <div
          className="flex flex-col items-center"
          style={{
            opacity: 1 - scrollProgress * 0.45,
            transform: `translate3d(0, ${scrollProgress * -64}px, 0) scale(${1 - scrollProgress * 0.08})`,
            transformOrigin: "center top",
          }}
        >
          <span className={`mb-4 block text-xs font-medium uppercase tracking-[0.22em] text-neutral-500 transition-all duration-500 ease-out ${isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
            Your next chapter starts here
          </span>

          <h1 className="w-full text-center font-google-sans-flex! text-[10.5vw] font-bold uppercase leading-[0.88] tracking-tight text-neutral-900 md:text-[clamp(5.25rem,8vw,6.5rem)]">
            <span className={`block transition-all duration-700 ease-out ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>Become</span>
            <span className={`block transition-all delay-150 duration-700 ease-out ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>Impossible to</span>
            <span className={`block transition-all delay-300 duration-700 ease-out ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>ignore</span>
          </h1>

          <p className={`mt-5 max-w-xl text-center text-base leading-relaxed text-neutral-600 transition-all delay-500 duration-500 ease-out md:text-lg ${isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
            Find the skills, direction, and real work to make your next move count.
          </p>

          <div className={`mt-6 flex flex-wrap justify-center gap-3 transition-all delay-700 duration-500 ease-out ${isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
            <button className="border border-neutral-900 bg-neutral-900 px-6 py-3 text-sm font-semibold text-white">
              Find my path
            </button>
            <button className="border border-neutral-400 bg-white px-6 py-3 text-sm font-semibold text-neutral-700">
              See how it works
            </button>
          </div>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-[46%] overflow-hidden border-t border-neutral-200"
        style={{
          transform: `translate3d(0, ${scrollProgress * -28}px, 0) scale(${1 + scrollProgress * 0.06})`,
          transformOrigin: "bottom center",
        }}
      >
        <div className={`absolute -left-10 bottom-0 h-[72%] w-[48%] rounded-tr-[100%] border border-neutral-300 bg-neutral-100 transition-all duration-700 ease-out ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`} />
        <div className={`absolute left-[22%] bottom-0 h-[56%] w-[54%] rounded-t-[100%] border border-neutral-300 bg-neutral-50 transition-all duration-700 ease-out ${isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"}`} />
        <div className={`absolute -right-12 bottom-0 h-[78%] w-[46%] rounded-tl-[100%] border border-neutral-300 bg-neutral-100 transition-all duration-700 ease-out ${isVisible ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0"}`} />
        <div className={`absolute left-[12%] top-[20%] h-10 w-24 rounded-full border border-neutral-300 bg-white transition-all duration-700 ease-out ${isVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`} />
        <div className={`absolute right-[13%] top-[28%] h-8 w-20 rounded-full border border-neutral-300 bg-white transition-all duration-700 ease-out ${isVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`} />
        <div
          className={`absolute bottom-10 left-[18%] h-20 w-12 rounded-t-full border border-neutral-400 bg-white transition-[opacity,transform] duration-700 ease-out ${isVisible ? "opacity-100" : "opacity-0"}`}
          style={{ transform: `translateY(${isVisible ? scrollProgress * -26 : 20}px)` }}
        />
        <div
          className={`absolute bottom-8 right-[23%] h-28 w-16 rounded-t-full border border-neutral-400 bg-white transition-[opacity,transform] duration-700 ease-out ${isVisible ? "opacity-100" : "opacity-0"}`}
          style={{ transform: `translateY(${isVisible ? scrollProgress * -46 : 28}px)` }}
        />
      </div>
    </section>
  );
};

export default Hero;
