import { useEffect, useRef, type CSSProperties } from "react";
import { PixelSticker, type SpriteName } from "./pixel-stickers";
import "./cta.css";

/* Closing call to action: the hero's blue again, to bookend the page.
   Plays once as it comes into view: label, headline, button, then Devy rises, then the stickers
   pop in one by one around the edges. The eye ends on the button with Devy underneath it;
   the stickers stay out of the centre column.
   Lives inside .hero-v6 so it shares the same colour and type tokens. */

/* Seven pixel stickers scattered in the gutters, as on the Mistral research page.
   x is the distance from that side's edge, y from the top (both % of the block), k scales the
   sticker, tilt is in degrees. `phone` marks the four that stay on small screens. */
const STICKERS: { name: SpriteName; side: "l" | "r"; x: number; y: number; k: number; tilt: number; phone?: boolean }[] = [
  { name: "book", side: "l", x: 8, y: 13, k: 1.1, tilt: -10, phone: true },
  { name: "compass", side: "l", x: 20, y: 44, k: 0.95, tilt: 9, phone: true },
  { name: "laptop", side: "l", x: 6, y: 66, k: 1, tilt: -6 },
  { name: "trophy", side: "l", x: 25, y: 80, k: 0.8, tilt: 7 },
  { name: "rocket", side: "r", x: 9, y: 11, k: 1.05, tilt: 13, phone: true },
  { name: "summit", side: "r", x: 20, y: 42, k: 1, tilt: -7, phone: true },
  { name: "bulb", side: "r", x: 7, y: 68, k: 0.9, tilt: 10 },
];

const Cta = () => {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.classList.add("is-in");
        io.disconnect();
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* Drag any sticker anywhere inside the block. Pointer events cover mouse, touch and pen;
     the sticker is moved with a CSS transform (the float animation owns translate), clamped so
     it can never leave the block, and it stays where it is dropped. */
  useEffect(() => {
    const block = ref.current;
    if (!block) return;
    let active: { el: SVGElement; id: number; sx: number; sy: number; bx: number; by: number; minX: number; maxX: number; minY: number; maxY: number } | null = null;
    let top = 3;

    const down = (e: PointerEvent) => {
      const el = (e.target as Element).closest<SVGElement>(".v6-px");
      if (!el || !block.contains(el) || (e.pointerType === "mouse" && e.button !== 0)) return;
      const r = el.getBoundingClientRect();
      const b = block.getBoundingClientRect();
      const bx = parseFloat(el.style.getPropertyValue("--dx")) || 0;
      const by = parseFloat(el.style.getPropertyValue("--dy")) || 0;
      active = {
        el, id: e.pointerId, sx: e.clientX, sy: e.clientY, bx, by,
        minX: bx + (b.left - r.left), maxX: bx + (b.right - r.right),
        minY: by + (b.top - r.top), maxY: by + (b.bottom - r.bottom),
      };
      el.setPointerCapture(e.pointerId);
      el.classList.add("is-dragging");
      el.style.zIndex = String(++top);
      e.preventDefault();
    };
    const move = (e: PointerEvent) => {
      if (!active || e.pointerId !== active.id) return;
      const dx = Math.min(active.maxX, Math.max(active.minX, active.bx + e.clientX - active.sx));
      const dy = Math.min(active.maxY, Math.max(active.minY, active.by + e.clientY - active.sy));
      active.el.style.setProperty("--dx", dx.toFixed(1) + "px");
      active.el.style.setProperty("--dy", dy.toFixed(1) + "px");
    };
    const up = (e: PointerEvent) => {
      if (!active || e.pointerId !== active.id) return;
      active.el.classList.remove("is-dragging");
      active = null;
    };
    block.addEventListener("pointerdown", down);
    block.addEventListener("pointermove", move);
    block.addEventListener("pointerup", up);
    block.addEventListener("pointercancel", up);
    return () => {
      block.removeEventListener("pointerdown", down);
      block.removeEventListener("pointermove", move);
      block.removeEventListener("pointerup", up);
      block.removeEventListener("pointercancel", up);
    };
  }, []);

  return (
    <section ref={ref} className="v6-cta-block" aria-labelledby="v6-cta-title">
      <p className="v6-eyebrow">Your next chapter</p>
      <h2 id="v6-cta-title">
        <span>Start with a little direction.</span>
        <span>See how far you can go.</span>
      </h2>
      <a className="v6-btn v6-btn-paper" href="#paths">Find your path</a>
      {STICKERS.map((s, i) => (
        <PixelSticker
          key={s.name}
          name={s.name}
          className={`v6-px v6-px-${s.side} v6-px-${s.name}${s.phone ? " v6-px-phone" : ""}`}
          style={{ "--x": `${s.x}%`, "--y": `${s.y}%`, "--k": s.k, "--tilt": `${s.tilt}deg`, "--i": i } as CSSProperties}
        />
      ))}
      <img src="/hero-v6/devy-laptop.webp" alt="" />
    </section>
  );
};

export default Cta;
