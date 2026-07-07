import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import { clsx } from "@/lib/clsx";
import { CheckIcon } from "@/components/ui/icons";

/** EpiMinded logo wordmark. */
export function Wordmark() {
  return (
    <Link href="/" className="inline-flex shrink-0 items-center">
      <Image
        src="/epiminded-logo.png"
        alt="EpiMinded"
        width={500}
        height={500}
        className="h-32 w-auto sm:h-48"
        priority
      />
    </Link>
  );
}

const NAV = [
  ["For Founders", "/"],
  ["For Community Builders", "/"],
  ["For Organisations", "/"],
] as const;

export const ONBOARDING_STEPS = ["Profile", "Plan", "Open app"] as const;

/**
 * Top brand bar. `full` shows the marketing nav (landing). `step` (0-based)
 * shows the onboarding progress dots instead — the funnel reads as one guided
 * flow: Profile → Plan → Open app.
 */
export function BrandHeader({
  full = false,
  step,
}: {
  full?: boolean;
  step?: number;
}) {
  return (
    <header
      className={clsx(
        "mx-auto flex w-full max-w-[1180px] items-center px-6 py-6",
        typeof step === "number" ? "relative justify-start" : "justify-between",
      )}
    >
      <Wordmark />
      {full && (
        <nav className="hidden items-center gap-8 text-[15px] text-paper md:flex">
          {NAV.map(([label, href], i) => (
            <Link key={i} href={href} className="transition hover:text-gold">
              {label}
            </Link>
          ))}
        </nav>
      )}
      {typeof step === "number" && (
        <nav
          aria-label="Onboarding progress"
          className="absolute left-1/2 top-[calc(50%+36px)] flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 sm:gap-2.5"
        >
          {ONBOARDING_STEPS.map((label, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <Fragment key={label}>
                {i > 0 && (
                  <span
                    aria-hidden
                    className={clsx(
                      "h-px w-4 transition-colors sm:w-8",
                      i <= step ? "bg-gold" : "bg-line",
                    )}
                  />
                )}
                <span
                  className="flex items-center gap-2"
                  aria-current={active ? "step" : undefined}
                >
                  <span
                    className={clsx(
                      "grid h-6 w-6 flex-none place-items-center rounded-full border font-mono text-[11px] transition-colors",
                      done && "border-gold bg-gold text-[#15110A]",
                      active && "border-gold text-gold",
                      !done && !active && "border-line text-muted",
                    )}
                  >
                    {done ? <CheckIcon className="h-3.5 w-3.5" /> : i + 1}
                  </span>
                  <span
                    className={clsx(
                      "font-mono text-[12px] uppercase tracking-label transition-colors",
                      active
                        ? "text-gold"
                        : done
                          ? "text-body hidden sm:inline"
                          : "text-muted hidden sm:inline",
                    )}
                  >
                    {label}
                  </span>
                </span>
              </Fragment>
            );
          })}
        </nav>
      )}
    </header>
  );
}
