import { useEffect, useRef, useState, type ReactNode } from "react";

const OFFSETS: Record<string, string> = {
  right: "translate-x-20 rotate-6",
  left: "-translate-x-20 -rotate-6",
  bottom: "translate-y-20 rotate-3",
};

const Reveal = ({
  children,
  className = "",
  from = "bottom",
}: {
  children: ReactNode;
  className?: string;
  from?: "right" | "left" | "bottom";
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? "translate-x-0 translate-y-0 rotate-0 opacity-100" : `opacity-0 ${OFFSETS[from]}`
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default Reveal;
