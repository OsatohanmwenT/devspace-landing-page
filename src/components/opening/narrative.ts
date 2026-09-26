// Narrative text fill (spec §17–18): muted layer + masked active layer per line,
// sequential fill, soft edge = font size, 25% less progress spent crossing word gaps.
import type { Mode } from './config';
import { clamp } from './config';

const LINES: Record<Mode, [string[], string[]]> = {
  desktop: [["You’re not short", 'on things to learn.'], ['So many different ideas', 'of what comes next.']],
  tablet: [["You’re not short", 'on things to learn.'], ['So many different ideas', 'of what comes next.']],
  mobile: [["You’re not short on", 'things to learn.'], ['So many different', 'ideas of what', 'comes next.']],
};

type Line = { ac: HTMLElement; w: number; map: (u: number) => number };

export class Narrative {
  root: HTMLDivElement;
  mode: Mode;
  groups: HTMLElement[] = [];
  lines: Line[][] = [];
  edge = 56;

  constructor(root: HTMLDivElement, mode: Mode) {
    this.root = root;
    this.mode = mode;
    this.build();
  }

  build() {
    const [a, b] = LINES[this.mode];
    const grp = (ls: string[], i: number) =>
      `<p class="grp g${i}">${ls.map((t) => `<span class="ln"><span class="mu">${t}</span><span class="ac" aria-hidden="true">${t}</span></span>`).join(' ')}</p>`;
    this.root.innerHTML = grp(a, 0) + grp(b, 1);
    this.groups = Array.from(this.root.querySelectorAll('.grp')) as HTMLElement[];
    this.measure();
  }

  /** Measure word boxes so the fill can slow across word gaps without stepping. */
  measure() {
    this.edge = parseFloat(getComputedStyle(this.root.querySelector('p')!).fontSize) || 56;
    this.lines = this.groups.map((g) =>
      (Array.from(g.querySelectorAll('.ln')) as HTMLElement[]).map((ln) => {
        const mu = ln.querySelector('.mu') as HTMLElement;
        const ac = ln.querySelector('.ac') as HTMLElement;
        const w = mu.getBoundingClientRect().width;
        const x0 = ln.getBoundingClientRect().left;
        // gap intervals from a Range over the text
        const txt = mu.firstChild as Text;
        const gaps: [number, number][] = [];
        const r = document.createRange();
        for (let i = 0; i < txt.length; i++) {
          if (txt.data[i] === ' ') {
            r.setStart(txt, i);
            r.setEnd(txt, i + 1);
            const b = r.getBoundingClientRect();
            gaps.push([b.left - x0, b.right - x0]);
          }
        }
        // cost function: gaps cost 0.75 per px, glyphs 1 per px
        const total = w + this.edge;
        const gapCost = gaps.reduce((s, [g0, g1]) => s + (g1 - g0) * 0.25, 0);
        const C = total - gapCost;
        const map = (u: number) => {
          // walk cost → x
          let target = u * C;
          let x = 0;
          for (const [g0, g1] of gaps) {
            if (target <= g0 - x) return x + target;
            target -= g0 - x;
            const gw = (g1 - g0) * 0.75;
            if (target <= gw) return g0 + target / 0.75;
            target -= gw;
            x = g1;
          }
          return x + target;
        };
        ac.style.setProperty('--e', this.edge + 'px');
        return { ac, w, map };
      }),
    );
  }

  /** Fill one group's lines sequentially, each line's share ∝ its width. */
  private fill(gi: number, u: number) {
    const ls = this.lines[gi];
    const tot = ls.reduce((s, l) => s + l.w, 0);
    let acc = 0;
    for (const l of ls) {
      const a = acc / tot;
      const b = (acc + l.w) / tot;
      acc += l.w;
      const lu = clamp((u - a) / (b - a));
      const x = lu <= 0 ? 0 : l.map(lu);
      l.ac.style.setProperty('--x', x.toFixed(1) + 'px');
    }
  }

  /** Render at scene progress p (spec §17–18 ranges). */
  render(p: number) {
    const [g0, g1] = this.groups;
    this.fill(0, clamp((p - 0.02) / 0.42));
    this.fill(1, clamp((p - 0.5) / 0.42));
    // swap 0.44 → 0.50: line 1 up 24px and out, line 2 in (muted)
    const sw = clamp((p - 0.44) / 0.06);
    const e = sw * sw * (3 - 2 * sw);
    g0.style.opacity = String(1 - e);
    g0.style.transform = `translateY(${-24 * e}px)`;
    g1.style.opacity = String(e);
    const intro = clamp(p / 0.02);
    this.root.style.opacity = String(intro);
  }

  renderStatic() {
    this.groups.forEach((g) => { g.style.opacity = '1'; g.style.transform = 'none'; });
    this.root.style.opacity = '1';
  }
}
