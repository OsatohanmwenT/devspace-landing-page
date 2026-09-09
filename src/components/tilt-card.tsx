import { useRef, useState, type ReactNode } from "react";

const TiltCard = ({ children, className = "" }: { children: ReactNode; className?: string }) => {
  const [transform, setTransform] = useState("");
  const ref = useRef<HTMLDivElement | null>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();

    const relativeX = (e.clientX - left) / width;
    const relativeY = (e.clientY - top) / height;

    const tiltX = (relativeY - 0.5) * 12;
    const tiltY = (relativeX - 0.5) * -12;

    setTransform(
      `perspective(700px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`
    );
  };

  const handleMouseLeave = () => setTransform("");

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform, transition: transform ? "none" : "transform 0.4s ease" }}
      className={className}
    >
      {children}
    </div>
  );
};

export default TiltCard;
