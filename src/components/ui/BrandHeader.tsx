import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import { clsx } from "@/lib/clsx";
import { CheckIcon } from "@/components/ui/icons";

/** EpiMinded logo for the top navbar. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className="inline-flex shrink-0 items-center"
      aria-label="EpiMinded"
    >
      <Image
        src="/epiminded-logo.png"
        alt="EpiMinded"
        width={500}
        height={500}
        className={clsx("my-[-3rem] h-32 w-auto sm:h-40", className)}
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

/** Onboarding progress — rendered below the navbar, not inside it. */
export function OnboardingStepper({ step }: { step: number }) {
  return (
    <nav
      aria-label="Onboarding progress"
      className="mx-auto flex w-full max-w-[1180px] items-center justify-center gap-1.5 px-6 pb-5 pt-20 sm:gap-2.5"
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
  );
}

/**
 * Top navbar with logo. Optional `step` renders the onboarding stepper
 * below the bar — not inside the navbar.
 */
export function BrandHeader({
  full = false,
  step,
}: {
  full?: boolean;
  step?: number;
}) {
  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-line/50 bg-[rgba(0,0,0,0.88)] backdrop-blur-md">
        <div
          className={clsx(
            "mx-auto flex w-full max-w-[1180px] items-center px-6 py-0",
            full ? "justify-between" : "justify-start",
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
        </div>
      </header>
      {typeof step === "number" && <OnboardingStepper step={step} />}
    </>
  );
}
