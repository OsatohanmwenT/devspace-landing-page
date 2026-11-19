import type React from "react";

/* Pixel-art stickers (after the Mistral research page): small 16-pixel sprites with a white
   sticker edge, scattered and tilted. Each sprite is a grid of palette letters, so it stays
   editable by hand: change a letter, change a pixel. The white edge is built from the sprite
   itself (every empty pixel touching a filled one), so it follows the pixel grid exactly. */

const PALETTE: Record<string, string> = {
  k: "#10004a", // ink
  b: "#253bdf", // brand blue
  B: "#5c7dff", // light blue
  p: "#d6e4fb", // pale blue
  w: "#ffffff",
  l: "#d9fa3e", // lime
  v: "#b9b3f0", // lavender
  n: "#1f3473", // Devy navy
  o: "#ff7b00", // orange
  r: "#ff3b30", // red
  y: "#ffd23f", // yellow
  s: "#aab3d6", // grey-blue
};
const EDGE = "#f7f6f3"; // the sticker's paper edge

const SPRITES = {
  /* the Devy book: what you will actually open */
  book: [
    "..kkkkkkkkkkkk..",
    ".kbbbbbbbbbbbbk.",
    ".kbBbbbbbbbbpbk.",
    ".kbBbbnbbbnbbbk.",
    ".kbBbnnnnnnnbbk.",
    ".kbBbnkknkknbbk.",
    ".kbBbnwknwknbbk.",
    ".kbBbnnnnnnnbbk.",
    ".kbBbnnvvvnnbbk.",
    ".kbBbbvvvvvbbbk.",
    ".kbBbbbbbbbbbbk.",
    ".kpppppppppppkk.",
    ".kwwrwwwwwwwwkk.",
    ".kbbrbbbbbbbbbk.",
    "..kkrkkkkkkkkk..",
    "....r...........",
  ],
  /* "a little direction" */
  compass: [
    ".....kkkkkk.....",
    "...kkwwwwwwkk...",
    "..kwwppppppwwk..",
    ".kwppppppppoowk.",
    ".kwpppppppooopk.",
    "kwpppppppooopppk",
    "kwppppppwooppppk",
    "kwpppppkwwpppppk",
    "kwppppkkwppppppk",
    "kwpppkkkpppppppk",
    ".kwpkkkppppppwk.",
    ".kwpkkpppppppwk.",
    "..kwwppppppwwk..",
    "...kkwwwwwwkk...",
    ".....kkkkkk.....",
  ],
  /* "how far you can go" */
  summit: [
    "........k.......",
    "........kll.....",
    "........kllll...",
    "........kll.....",
    "........k.......",
    ".......kwk......",
    "......kwwwk.....",
    ".....kwwvwwk....",
    "....kvwvvvwvk...",
    "...kvvvvvvvvvk..",
    "..kvvvvvvvvvvvk.",
    ".kvvvvvvvvvvvvvk",
    "kkkkkkkkkkkkkkkk",
  ],
  /* build real things */
  laptop: [
    "..kkkkkkkkkkkk..",
    "..knnnnnnnnnnk..",
    "..knllnnnnnnnk..",
    "..knnnwwwwnnnk..",
    "..knllnnnnnnnk..",
    "..knnnwwwnnnnk..",
    "..knllllnnnnnk..",
    "..knnnnnnnnnnk..",
    "..kkkkkkkkkkkk..",
    ".kssssssssssssk.",
    "kssksksksksksssk",
    "kssssskkkksssssk",
    "kkkkkkkkkkkkkkkk",
  ],
  /* get moving */
  rocket: [
    ".......kk.......",
    "......krrk......",
    ".....krrrrk.....",
    ".....kwwwwk.....",
    ".....kwbbwk.....",
    ".....kwbbwk.....",
    ".....kwwwwk.....",
    "....kkwwwwkk....",
    "...krkwwwwkrk...",
    "...krkwwwwkrk...",
    "...kkkkkkkkkk...",
    ".....koyyok.....",
    "......kyyk......",
    ".......oo.......",
  ],
  /* proof at the end */
  trophy: [
    "...kkkkkkkkkk...",
    ".kkkyyyyyyyykkk.",
    "kyykywyyyyyykyyk",
    "kykkywyyyyyykkyk",
    "kyykyyyyyyyykyyk",
    ".kkkyyyyyyyykkk.",
    "....kyyyyyyk....",
    ".....kyyyyk.....",
    "......kyyk......",
    "......kyyk......",
    ".....kkyykk.....",
    "....kyyyyyyk....",
    "....kkkkkkkk....",
  ],
  /* the moment it clicks */
  bulb: [
    ".....kkkkkk.....",
    "....kyyyyyyk....",
    "...kyywyyyyyk...",
    "...kywyyyyyyk...",
    "...kyyyyyyyyk...",
    "...kyyyyyyyyk...",
    "....kyykkyyk....",
    "....kyykkyyk....",
    ".....kyyyyk.....",
    ".....kkkkkk.....",
    ".....kssssk.....",
    ".....kkkkkk.....",
    "......kssk......",
    ".......kk.......",
  ],
} as const;

export type SpriteName = keyof typeof SPRITES;

type Run = { x: number; y: number; w: number; fill: string };

/** Turn a sprite into horizontal runs of one colour, padded by a 1-pixel paper edge all round. */
const build = (rows: readonly string[]) => {
  const w = Math.max(...rows.map((r) => r.length));
  const h = rows.length;
  const at = (x: number, y: number) => (y < 0 || y >= h || x < 0 ? "." : rows[y][x] ?? ".");
  const runs: Run[] = [];
  const push = (y: number, cells: (string | null)[]) => {
    let start = 0;
    for (let x = 1; x <= cells.length; x++) {
      if (x === cells.length || cells[x] !== cells[start]) {
        const fill = cells[start];
        if (fill) runs.push({ x: start, y, w: x - start, fill });
        start = x;
      }
    }
  };
  for (let y = -1; y <= h; y++) {
    const cells: (string | null)[] = [];
    for (let x = -1; x <= w; x++) {
      const c = at(x, y);
      if (c !== ".") {
        cells.push(PALETTE[c] ?? PALETTE.k);
        continue;
      }
      // empty: part of the paper edge if any of its eight neighbours is filled
      let edge = false;
      for (let dy = -1; dy <= 1 && !edge; dy++) for (let dx = -1; dx <= 1; dx++) if (at(x + dx, y + dy) !== ".") edge = true;
      cells.push(edge ? EDGE : null);
    }
    push(y + 1, cells);
  }
  return { runs, w: w + 2, h: h + 2 };
};

const BUILT = Object.fromEntries(Object.entries(SPRITES).map(([name, rows]) => [name, build(rows)])) as Record<SpriteName, ReturnType<typeof build>>;

export const PixelSticker = ({ name, className, style }: { name: SpriteName; className?: string; style?: React.CSSProperties }) => {
  const { runs, w, h } = BUILT[name];
  return (
    <svg className={className} style={style} viewBox={`0 0 ${w} ${h}`} shapeRendering="crispEdges" aria-hidden="true">
      {runs.map((r) => (
        <rect key={`${r.x}-${r.y}`} x={r.x} y={r.y} width={r.w} height={1} fill={r.fill} />
      ))}
    </svg>
  );
};
