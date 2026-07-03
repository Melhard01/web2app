import { QUIZ } from "@/lib/quiz/config";

/**
 * Strategic-profile radar — the "personality result" chart. Plots the raw
 * per-archetype score (how many answers leaned each way) on four axes, with the
 * dominant profile highlighted. Pure SVG, dependency-free, brand navy/gold.
 *
 * Axes follow the config's profile order (Scout · Analyst · Operator · Seeker),
 * laid out clockwise from the top.
 */

const GOLD = "#C9A24B";
const GOLD_HI = "#E4C66B";
const LINE = "#2A261F";
const MUTED = "#8B887F";

const CX = 150;
const CY = 126;
const R = 74;
const RINGS = 3;

function point(r: number, angleDeg: number): [number, number] {
  const a = (angleDeg * Math.PI) / 180;
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
}

function polygon(points: [number, number][]): string {
  return points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
}

export function ProfileRadar({
  scores,
  maxScore,
  activeKey,
}: {
  scores: Record<string, number>;
  maxScore: number;
  activeKey: string;
}) {
  const keys = Object.keys(QUIZ.profiles);
  const n = keys.length;
  const safeMax = Math.max(maxScore, 1);

  // One axis per profile, clockwise from the top.
  const axes = keys.map((key, i) => {
    const angle = -90 + (360 / n) * i;
    const value = scores[key] ?? 0;
    const fraction = value / safeMax;
    return {
      key,
      angle,
      value,
      name: QUIZ.profiles[key].name.replace(/^The\s+/, ""),
      active: key === activeKey,
      vertex: point(R * fraction, angle),
    };
  });

  const dataPolygon = polygon(axes.map((a) => a.vertex));

  return (
    <div className="rounded-[16px] border border-line bg-card2 px-5 pb-4 pt-5">
      <p className="lab mb-1">How you scored across the four profiles</p>

      <svg
        viewBox="0 0 300 264"
        role="img"
        aria-label={`Radar chart of your strategic profile scores. Dominant: ${
          QUIZ.profiles[activeKey]?.name ?? activeKey
        }.`}
        className="mx-auto block w-full max-w-[340px]"
      >
        {/* concentric grid rings */}
        {Array.from({ length: RINGS }, (_, level) => {
          const r = (R * (level + 1)) / RINGS;
          return (
            <polygon
              key={level}
              points={polygon(axes.map((a) => point(r, a.angle)))}
              fill="none"
              stroke={LINE}
              strokeWidth={1}
            />
          );
        })}

        {/* spokes */}
        {axes.map((a) => {
          const [x, y] = point(R, a.angle);
          return (
            <line
              key={a.key}
              x1={CX}
              y1={CY}
              x2={x}
              y2={y}
              stroke={LINE}
              strokeWidth={1}
            />
          );
        })}

        {/* data shape */}
        <polygon
          points={dataPolygon}
          fill="rgba(201,162,75,0.16)"
          stroke={GOLD}
          strokeWidth={1.8}
          strokeLinejoin="round"
        />

        {/* vertices */}
        {axes.map((a) => (
          <circle
            key={a.key}
            cx={a.vertex[0]}
            cy={a.vertex[1]}
            r={a.active ? 4.5 : 2.6}
            fill={a.active ? GOLD_HI : GOLD}
          />
        ))}

        {/* axis labels — name with the score stacked beneath, kept narrow so
            the horizontal (left/right) labels never overflow the viewBox. */}
        {axes.map((a) => {
          const [lx, ly] = point(R + 18, a.angle);
          const anchor =
            lx > CX + 1 ? "start" : lx < CX - 1 ? "end" : "middle";
          return (
            <text
              key={a.key}
              x={lx}
              y={ly}
              textAnchor={anchor}
              dominantBaseline="middle"
              style={{ fontFamily: "var(--font-mono), monospace" }}
            >
              <tspan
                x={lx}
                dy="-0.3em"
                fontSize="12.5"
                fontWeight={a.active ? 700 : 500}
                fill={a.active ? GOLD_HI : MUTED}
              >
                {a.name}
              </tspan>
              <tspan
                x={lx}
                dy="1.35em"
                fontSize="10.5"
                fontWeight={500}
                fill={a.active ? GOLD : MUTED}
              >
                {a.value}/{safeMax}
              </tspan>
            </text>
          );
        })}
      </svg>
    </div>
  );
}
