/**
 * Fibonacci / golden-ratio spiral icon.
 *
 * Built from the classic Fibonacci square tiling: a quarter-circle arc is
 * inscribed in each square (sizes 1,1,2,3,5,8,13…), and the arcs join into the
 * golden spiral. Optionally renders the faint subdividing squares so it reads
 * as "proportions / ratios" at larger sizes; at tab size the spiral carries it.
 *
 * Stroke is given in *visual* pixels and converted to viewBox units so it
 * matches the rest of the 1.2-weight Lucide set regardless of `size`.
 */
import React from 'react';
import Svg, { Path, Rect, G } from 'react-native-svg';

const VB = 100; // viewBox is 0..100 in both axes

interface Square { x: number; y: number; s: number; }

/**
 * Lay out Fibonacci squares spiralling counter-clockwise, then build one
 * continuous arc path threading through them (the golden spiral) plus the list
 * of squares for the faint subdivision guides.
 */
function buildGolden(): { spiral: string; squares: Square[] } {
  const fib = [1, 1, 2, 3, 5, 8, 13];
  // Place squares: each new square attaches to a rotating side of the cluster.
  const squares: Square[] = [];
  let x = 0, y = 0;          // running bounding box of placed squares
  let w = 0, h = 0;
  // direction cycle: 0=right, 1=up, 2=left, 3=down
  fib.forEach((s, i) => {
    let sq: Square;
    if (i === 0) {
      sq = { x: 0, y: 0, s };
    } else {
      const dir = (i - 1) % 4;
      switch (dir) {
        case 0: sq = { x: x + w,     y: y + h - s, s }; break; // right
        case 1: sq = { x: x + w - s, y: y - s,     s }; break; // up
        case 2: sq = { x: x - s,     y: y,         s }; break; // left
        default: sq = { x: x,        y: y + h,     s }; break; // down
      }
    }
    squares.push(sq);
    // grow bounding box
    const nx = Math.min(x, sq.x), ny = Math.min(y, sq.y);
    const nr = Math.max(x + w, sq.x + sq.s), nb = Math.max(y + h, sq.y + sq.s);
    x = nx; y = ny; w = nr - nx; h = nb - ny;
  });

  // Normalise the bounding box into the viewBox with a margin.
  const M = 8;
  const scale = (VB - M * 2) / Math.max(w, h);
  const offX = M + (VB - M * 2 - w * scale) / 2 - x * scale;
  const offY = M + (VB - M * 2 - h * scale) / 2 - y * scale;
  const tx = (vx: number) => offX + vx * scale;
  const ty = (vy: number) => offY + vy * scale;

  // Build the spiral: a quarter arc per square, pivoting on the square's
  // inner corner. Sweep direction alternates with the placement direction.
  let d = '';
  squares.forEach((sq, i) => {
    const dir = i === 0 ? 3 : (i - 1) % 4;
    const r = sq.s * scale;
    // start/end corners of the quarter arc per direction
    let start: [number, number], end: [number, number];
    switch (dir) {
      case 0: // right square — arc bottom-left → top-right
        start = [sq.x, sq.y + sq.s]; end = [sq.x + sq.s, sq.y]; break;
      case 1: // up square — top-left → bottom-right
        start = [sq.x, sq.y]; end = [sq.x + sq.s, sq.y + sq.s]; break;
      case 2: // left square — top-right → bottom-left
        start = [sq.x + sq.s, sq.y]; end = [sq.x, sq.y + sq.s]; break;
      default: // down square — bottom-right → top-left
        start = [sq.x + sq.s, sq.y + sq.s]; end = [sq.x, sq.y]; break;
    }
    const sx = tx(start[0]), sy = ty(start[1]);
    const ex = tx(end[0]),   ey = ty(end[1]);
    if (i === 0) d += `M ${sx.toFixed(2)} ${sy.toFixed(2)} `;
    d += `A ${r.toFixed(2)} ${r.toFixed(2)} 0 0 1 ${ex.toFixed(2)} ${ey.toFixed(2)} `;
  });

  return {
    spiral: d.trim(),
    squares: squares.map(sq => ({ x: tx(sq.x), y: ty(sq.y), s: sq.s * scale })),
  };
}

const GOLDEN = buildGolden();

interface Props {
  size?: number;
  color?: string;
  strokeWidth?: number;   // visual px
  showGrid?: boolean;     // faint subdivision squares
}

export const FibonacciIcon: React.FC<Props> = ({
  size = 24, color = '#2A2522', strokeWidth = 1.2, showGrid = false,
}) => {
  const sw = (strokeWidth * VB) / size; // convert visual px → viewBox units
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${VB} ${VB}`}>
      {showGrid && (
        <G opacity={0.28}>
          {GOLDEN.squares.map((sq, i) => (
            <Rect
              key={i}
              x={sq.x} y={sq.y} width={sq.s} height={sq.s}
              fill="none" stroke={color} strokeWidth={sw * 0.7}
            />
          ))}
        </G>
      )}
      <Path
        d={GOLDEN.spiral}
        fill="none"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
