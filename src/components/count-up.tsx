import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

const CountUp = ({ value, className = "" }: { value: string; className?: string }) => {
  const match = value.match(/^(\d+)(.*)$/);
  const target = match ? Number(match[1]) : null;
  const suffix = match ? match[2] : "";

  const [display, setDisplay] = useState(target === null ? value : "0" + suffix);
  const ref = useRef<HTMLSpanElement | null>(null);
  const played = useRef(false);

  useEffect(() => {
    if (target === null || !ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !played.current) {
          played.current = true;
          const counter = { n: 0 };
          gsap.to(counter, {
            n: target,
            duration: 1.4,
            ease: "power2.out",
            onUpdate: () => setDisplay(Math.round(counter.n) + suffix),
          });
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, suffix]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
};

export default CountUp;
