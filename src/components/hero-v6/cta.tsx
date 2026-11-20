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

  /* Drag any sticker anywhere inside the block. Pointer events cover mouse, touch and pen.
     It is smoothed three ways so it feels held, not glued: the sticker eases toward the pointer
     instead of snapping to it, leans into the direction it is moving, and keeps gliding with
     the throw when let go (friction, and a soft bounce off the block's edges).
     Moved with a CSS transform (the float animation owns translate); clamped inside the block. */
  useEffect(() => {
    const block = ref.current;
    if (!block) return;
    type Drag = {
      el: SVGElement; id: number; down: boolean;
      sx: number; sy: number; bx: number; by: number;
      x: number; y: number; tx: number; ty: number; vx: number; vy: number; lean: number;
      minX: number; maxX: number; minY: number; maxY: number;
    };
    let drag: Drag | null = null;
    let raf = 0;
    let last = 0;
    let top = 3;
    const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

    const paint = (d: Drag) => {
      d.el.style.setProperty("--dx", d.x.toFixed(2) + "px");
      d.el.style.setProperty("--dy", d.y.toFixed(2) + "px");
      d.el.style.setProperty("--lean", d.lean.toFixed(2) + "deg");
    };
    const finish = () => {
      if (!drag) return;
      drag.el.classList.remove("is-dragging");
      drag.lean = 0;
      paint(drag);
      drag = null;
    };

    const step = (now: number) => {
      raf = 0;
      const d = drag;
      if (!d) return;
      const f = Math.min(2.5, (now - last) / 16.67); // frames elapsed, so it feels the same at any refresh rate
      last = now;
      const px = d.x;
      const py = d.y;
      if (d.down) {
        const k = 1 - Math.pow(0.7, f); // ease toward the pointer
        d.x += (d.tx - d.x) * k;
        d.y += (d.ty - d.y) * k;
        d.vx += ((d.x - px) / f - d.vx) * 0.35; // smoothed velocity, kept for the throw
        d.vy += ((d.y - py) / f - d.vy) * 0.35;
      } else {
        d.vx = clamp(d.vx, -34, 34); // a flick glides, it does not teleport
        d.vy = clamp(d.vy, -34, 34);
        d.x += d.vx * f;
        d.y += d.vy * f;
        const fr = Math.pow(0.91, f);
        d.vx *= fr;
        d.vy *= fr;
        if (d.x < d.minX || d.x > d.maxX) { d.x = clamp(d.x, d.minX, d.maxX); d.vx *= -0.45; }
        if (d.y < d.minY || d.y > d.maxY) { d.y = clamp(d.y, d.minY, d.maxY); d.vy *= -0.45; }
      }
      d.lean += (clamp(d.vx * 1.1, -14, 14) - d.lean) * 0.18;
      paint(d);
      const moving = Math.abs(d.vx) > 0.04 || Math.abs(d.vy) > 0.04 || Math.abs(d.lean) > 0.15;
      if (d.down || moving) raf = requestAnimationFrame(step);
      else finish();
    };
    const kick = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(step);
    };

    const down = (e: PointerEvent) => {
      const el = (e.target as Element).closest<SVGElement>(".v6-px");
      if (!el || !block.contains(el) || (e.pointerType === "mouse" && e.button !== 0)) return;
      cancelAnimationFrame(raf);
      raf = 0;
      finish();
      const r = el.getBoundingClientRect();
      const b = block.getBoundingClientRect();
      const bx = parseFloat(el.style.getPropertyValue("--dx")) || 0;
      const by = parseFloat(el.style.getPropertyValue("--dy")) || 0;
      drag = {
        el, id: e.pointerId, down: true, sx: e.clientX, sy: e.clientY, bx, by,
        x: bx, y: by, tx: bx, ty: by, vx: 0, vy: 0, lean: 0,
        minX: bx + (b.left - r.left), maxX: bx + (b.right - r.right),
        minY: by + (b.top - r.top), maxY: by + (b.bottom - r.bottom),
      };
      el.setPointerCapture(e.pointerId);
      el.classList.add("is-dragging");
      el.style.zIndex = String(++top);
      e.preventDefault();
      kick();
    };
    const move = (e: PointerEvent) => {
      if (!drag || !drag.down || e.pointerId !== drag.id) return;
      drag.tx = clamp(drag.bx + e.clientX - drag.sx, drag.minX, drag.maxX);
      drag.ty = clamp(drag.by + e.clientY - drag.sy, drag.minY, drag.maxY);
      kick();
    };
    const up = (e: PointerEvent) => {
      if (!drag || !drag.down || e.pointerId !== drag.id) return;
      drag.down = false;
      drag.el.classList.remove("is-dragging"); // drops back to its resting look while it glides
      kick();
    };
    block.addEventListener("pointerdown", down);
    block.addEventListener("pointermove", move);
    block.addEventListener("pointerup", up);
    block.addEventListener("pointercancel", up);
    return () => {
      cancelAnimationFrame(raf);
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
