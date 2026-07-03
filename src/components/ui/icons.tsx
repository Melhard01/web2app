/**
 * Inline line/solid icons (stroke or fill = currentColor so they inherit the
 * gold/white theme). Kept dependency-free and small.
 */

type IconProps = { className?: string };

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/* ── Archetype icons (one per profile) ───────────────────────────────────── */

export function ScoutIcon({ className }: IconProps) {
  // Compass / navigation — moves early on signals.
  return (
    <svg viewBox="0 0 24 24" className={className} {...stroke}>
      <circle cx="12" cy="12" r="9" />
      <path d="M15.5 8.5l-2 5-5 2 2-5 5-2z" />
    </svg>
  );
}

export function AnalystIcon({ className }: IconProps) {
  // Bar chart — decides with evidence.
  return (
    <svg viewBox="0 0 24 24" className={className} {...stroke}>
      <path d="M4 20h16" />
      <rect x="6" y="11" width="3" height="6" rx="0.6" />
      <rect x="11" y="7" width="3" height="10" rx="0.6" />
      <rect x="16" y="13" width="3" height="4" rx="0.6" />
    </svg>
  );
}

export function OperatorIcon({ className }: IconProps) {
  // Cog — runs what works.
  return (
    <svg viewBox="0 0 24 24" className={className} {...stroke}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.2 5.2l2.1 2.1M16.7 16.7l2.1 2.1M18.8 5.2l-2.1 2.1M7.3 16.7l-2.1 2.1" />
    </svg>
  );
}

export function SeekerIcon({ className }: IconProps) {
  // Search — has the insight, needs the method.
  return (
    <svg viewBox="0 0 24 24" className={className} {...stroke}>
      <circle cx="10.5" cy="10.5" r="6" />
      <path d="M15 15l5 5" />
    </svg>
  );
}

export const PROFILE_ICONS: Record<
  string,
  (p: IconProps) => React.ReactNode
> = {
  scout: ScoutIcon,
  analyst: AnalystIcon,
  operator: OperatorIcon,
  seeker: SeekerIcon,
};

/* ── Section icons ───────────────────────────────────────────────────────── */

export function ExposedIcon({ className }: IconProps) {
  // Alert triangle — where you're exposed.
  return (
    <svg viewBox="0 0 24 24" className={className} {...stroke}>
      <path d="M12 4l9 16H3l9-16z" />
      <path d="M12 10v4" />
      <circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function CohortIcon({ className }: IconProps) {
  // People — what a matched cohort gives you.
  return (
    <svg viewBox="0 0 24 24" className={className} {...stroke}>
      <circle cx="9" cy="9" r="3" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
      <path d="M16 7.5a3 3 0 0 1 0 5.8M17.5 19a5.5 5.5 0 0 0-3-4.9" />
    </svg>
  );
}

/* ── Utility icons ───────────────────────────────────────────────────────── */

export function CopyIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...stroke}>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h8" />
    </svg>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...stroke}>
      <path d="M5 12.5l4.5 4.5L19 7" />
    </svg>
  );
}

/* ── Platform logos ──────────────────────────────────────────────────────── */

export function AndroidIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...stroke}>
      <path d="M6 5l2 2.6M18 5l-2 2.6" />
      <path d="M4.5 13a7.5 7.5 0 0 1 15 0z" />
      <path d="M4.5 13h15" />
      <circle cx="9.3" cy="10.4" r="0.7" fill="currentColor" stroke="none" />
      <circle cx="14.7" cy="10.4" r="0.7" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function AppleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M17.05 12.04c-.03-2.6 2.12-3.84 2.22-3.9-1.21-1.78-3.09-2.02-3.76-2.05-1.6-.16-3.12.94-3.93.94-.81 0-2.06-.92-3.39-.89-1.74.03-3.35 1.01-4.25 2.57-1.81 3.14-.46 7.79 1.3 10.34.86 1.25 1.88 2.65 3.22 2.6 1.29-.05 1.78-.83 3.34-.83 1.56 0 2 .83 3.37.81 1.39-.03 2.27-1.27 3.12-2.53.98-1.45 1.39-2.85 1.41-2.92-.03-.01-2.71-1.04-2.74-4.13z" />
      <path d="M14.69 4.97c.71-.86 1.19-2.06 1.06-3.25-1.02.04-2.26.68-2.99 1.54-.66.76-1.23 1.98-1.08 3.15 1.14.09 2.3-.58 3.01-1.44z" />
    </svg>
  );
}
