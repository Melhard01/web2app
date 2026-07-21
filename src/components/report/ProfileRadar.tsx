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
  embedded = false,
}: {
  scores: Record<string, number>;
  maxScore: number;
  activeKey: string;
  embedded?: boolean;
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
    <div
      className={
        embedded
          ? "flex min-h-0 flex-1 flex-col px-[clamp(1rem,2.2vw,1.5rem)] pb-[clamp(0.9rem,1.8vw,1.25rem)] pt-[clamp(0.75rem,1.4vw,1rem)] xl:px-8 xl:pb-7 xl:pt-5"
          : "premium-card flex min-h-[clamp(22rem,58vw,34rem)] flex-col bg-[linear-gradient(160deg,rgba(255,255,255,0.14)_0%,rgba(255,255,255,0.06)_45%,rgba(255,255,255,0.03)_100%)] px-6 pb-4 pt-5 backdrop-blur-2xl ring-1 ring-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-20px_40px_rgba(0,0,0,0.42),0_0_0_1px_rgba(212,175,55,0.14),0_14px_36px_rgba(0,0,0,0.5)]"
      }
    >
      <p className="lab mb-1">How you scored across the four profiles</p>

      <div className="flex flex-1 items-center justify-center">
        <svg
          viewBox="0 0 300 264"
          role="img"
          aria-label={`Radar chart of your strategic profile scores. Dominant: ${
            QUIZ.profiles[activeKey]?.name ?? activeKey
          }.`}
          className="mx-auto block h-full w-full max-h-[min(42vw,21rem)] max-w-[min(100%,26rem)] xl:max-h-[min(28vw,21rem)] xl:max-w-[min(100%,24rem)]"
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
          strokeWidth={1}
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
                fontSize="11"
                fontWeight={500}
                letterSpacing="2.1"
                fill={a.active ? GOLD_HI : MUTED}
              >
                {a.name.toUpperCase()}
              </tspan>
              <tspan
                x={lx}
                dy="1.35em"
                fontSize="11"
                fontWeight={500}
                letterSpacing="1.6"
                fill={a.active ? GOLD : MUTED}
              >
                {a.value}/{safeMax}
              </tspan>
            </text>
          );
        })}
        </svg>
      </div>
    </div>
  );
}
