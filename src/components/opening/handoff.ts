/**
 * What the opening hands on to the sections after it.
 *
 * The pull-back (T2) ends on the greyed tangle, framed to fit the screen. The opening publishes
 * that exact frame here, so the next sections can redraw the same line in the same place and
 * carry it on (see StraightPath's thread). It also says when it has ended, i.e. when that
 * frame is on screen and the stage is about to scroll away.
 */

export type TangleFrame = {
  /** Path data, in scene units. */
  d: string;
  /** Scene → viewport transform at the end of T2 (viewport px, stage pinned at the top). */
  x: number;
  y: number;
  s: number;
  /** Stroke width on screen, px. */
  strokePx: number;
};

/** Opacity of the line at the end of T2 (the scene's own trail and the thread both use it). */
export const TANGLE_END_OPACITY = 0.35;

type Listener = () => void;
const listeners = new Set<Listener>();
let frame: TangleFrame | null = null;
let ended = false;

const notify = () => listeners.forEach((fn) => fn());

export const handoff = {
  get frame() {
    return frame;
  },
  get ended() {
    return ended;
  },
  publishFrame(f: TangleFrame | null) {
    frame = f;
    notify();
  },
  publishEnded(e: boolean) {
    if (e === ended) return;
    ended = e;
    notify();
  },
  subscribe(fn: Listener) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
};
