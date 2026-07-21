"use client";

import { clsx } from "@/lib/clsx";
import { ButtonLink, Arrow } from "@/components/ui/Button";
import { ProfileRadar } from "./ProfileRadar";
import {
  PROFILE_ICONS,
  ScoutIcon,
  ExposedIcon,
  CohortIcon,
} from "@/components/ui/icons";
import type { Profile } from "@/lib/quiz/types";

const CARD_SHELL =
  "premium-card bg-[linear-gradient(160deg,rgba(255,255,255,0.14)_0%,rgba(255,255,255,0.06)_45%,rgba(255,255,255,0.03)_100%)] backdrop-blur-2xl ring-1 ring-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-20px_40px_rgba(0,0,0,0.42),0_0_0_1px_rgba(212,175,55,0.14),0_14px_36px_rgba(0,0,0,0.5)]";

/**
 * Report payoff — desktop proportions are the source of truth:
 * large profile card left, two insight cards stacked right, CTA bottom-right.
 * Same layout from md+ (≥768px); single column only below that.
 * xl (≥1280px) scales the section up for immersive wide displays.
 */
export function ReportView({
  profileKey,
  profile,
  scores,
  maxScore,
}: {
  profileKey: string;
  profile: Profile;
  scores: Record<string, number>;
  maxScore: number;
}) {
  const Icon = PROFILE_ICONS[profileKey] ?? ScoutIcon;

  return (
    <div
      className={clsx(
        "mx-auto flex w-full flex-col animate-rise",
        "max-w-[min(100%,72rem)] gap-[clamp(1.25rem,2.5vw,2.5rem)]",
        "xl:max-w-[min(100%,72rem)] xl:gap-8",
        "uw:max-w-[110rem] uw:gap-10",
      )}
    >
      <div
        className={clsx(
          "report-cards-grid grid w-full min-w-0 items-stretch",
          "grid-cols-1 gap-[clamp(0.9rem,1.6vw,1.5rem)]",
          "md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]",
          "xl:grid-cols-2 xl:min-h-[min(58vh,34rem)] xl:gap-5",
          "uw:grid-cols-[680px_minmax(0,1fr)] uw:min-h-[min(62vh,42rem)] uw:gap-8",
        )}
      >
        {/* Card 1 — Dominant profile */}
        <div
          className={clsx(
            CARD_SHELL,
            "report-profile-card flex min-w-0 flex-col",
            "min-h-[clamp(22rem,58vw,34rem)] md:min-h-0 md:h-full",
            "uw:w-[680px] uw:max-w-[680px]",
          )}
        >
          <p
            className={clsx(
              "lab px-[clamp(1rem,2.2vw,1.5rem)] pb-1 pt-[clamp(0.9rem,1.8vw,1.25rem)]",
              "xl:px-8 xl:pt-7 xl:text-[0.8rem]",
            )}
          >
            Your dominant profile
          </p>
          <div
            className={clsx(
              "premium-card-header flex items-center gap-[clamp(0.75rem,1.5vw,1rem)]",
              "px-[clamp(1rem,2.2vw,1.5rem)] py-[clamp(0.9rem,1.8vw,1.25rem)]",
              "xl:gap-5 xl:px-8 xl:py-7",
            )}
          >
            <span
              className={clsx(
                "premium-icon-wrap flex-none",
                "h-[clamp(2.75rem,4.5vw,3.5rem)] w-[clamp(2.75rem,4.5vw,3.5rem)]",
                "xl:h-16 xl:w-16",
              )}
            >
              <Icon
                className={clsx(
                  "h-[clamp(1.35rem,2.2vw,1.75rem)] w-[clamp(1.35rem,2.2vw,1.75rem)]",
                  "xl:h-8 xl:w-8",
                )}
              />
            </span>
            <div className="min-w-0">
              <div
                className={clsx(
                  "font-display font-semibold leading-none text-gold",
                  "text-[clamp(1.6rem,3.2vw,2.5rem)]",
                  "xl:text-[clamp(1.9rem,2vw,2.45rem)]",
                )}
              >
                {profile.name}
              </div>
              <p
                className={clsx(
                  "mt-1.5 font-mono uppercase tracking-label text-gold-hi",
                  "text-[clamp(0.625rem,1.1vw,0.7rem)]",
                  "xl:mt-2 xl:text-[0.7rem]",
                )}
              >
                {profile.mantra}
              </p>
            </div>
          </div>
          <p
            className={clsx(
              "px-[clamp(1rem,2.2vw,1.5rem)] py-[clamp(0.9rem,1.8vw,1.25rem)] leading-[1.5] text-white",
              "text-[clamp(0.95rem,1.5vw,1.2rem)]",
              "xl:px-6 xl:py-5 xl:text-[1.1rem] xl:leading-[1.55]",
            )}
          >
            {profile.result}
          </p>
          <div className="mx-[clamp(1rem,2.2vw,1.5rem)] border-t border-gold/10 xl:mx-8" />
          <div className="flex min-h-0 flex-1 flex-col">
            <ProfileRadar
              scores={scores}
              maxScore={maxScore}
              activeKey={profileKey}
              embedded
            />
          </div>
        </div>

        {/* Cards 2 + 3 — insights */}
        <div
          className={clsx(
            "flex min-w-0 flex-col gap-[clamp(0.9rem,1.6vw,1.5rem)] md:h-full",
            "xl:gap-8",
          )}
        >
          <InsightCard
            icon={
              <ExposedIcon className="h-[clamp(1.1rem,1.6vw,1.25rem)] w-[clamp(1.1rem,1.6vw,1.25rem)] xl:h-6 xl:w-6" />
            }
            label="Where you are exposed"
            body={profile.exposed}
          />
          <InsightCard
            icon={
              <CohortIcon className="h-[clamp(1.1rem,1.6vw,1.25rem)] w-[clamp(1.1rem,1.6vw,1.25rem)] xl:h-6 xl:w-6" />
            }
            label="What a matched cohort gives you"
            body={profile.cohort}
          />
        </div>
      </div>

      <div className="flex justify-end xl:mt-1">
        <ButtonLink href="/paywall">
          Choose your plan <Arrow />
        </ButtonLink>
      </div>
    </div>
  );
}

function InsightCard({
  icon,
  label,
  body,
}: {
  icon: React.ReactNode;
  label: string;
  body: string;
}) {
  return (
    <div
      className={clsx(
        CARD_SHELL,
        "flex flex-1 flex-col items-center justify-center text-center",
        "min-h-[clamp(9rem,22vw,12.5rem)]",
        "gap-[clamp(0.75rem,1.4vw,1rem)] px-[clamp(1rem,2vw,1.5rem)] py-[clamp(1.1rem,2.2vw,1.5rem)]",
        "xl:min-h-[12.5rem] xl:gap-4 xl:px-6 xl:py-6",
      )}
    >
      <div className="flex w-full max-w-[32em] flex-col items-center xl:max-w-[34em]">
        <div
          className={clsx(
            "mb-[clamp(0.5rem,1vw,0.7rem)] flex items-center justify-center",
            "gap-[clamp(0.55rem,1.2vw,0.75rem)]",
            "xl:mb-3 xl:gap-3",
          )}
        >
          <span
            className={clsx(
              "premium-icon-wrap flex-none",
              "h-[clamp(2.25rem,3.5vw,2.5rem)] w-[clamp(2.25rem,3.5vw,2.5rem)]",
              "xl:h-11 xl:w-11",
            )}
          >
            {icon}
          </span>
          <p
            className={clsx(
              "m-0 text-left font-display font-semibold leading-tight tracking-[-0.01em] text-gold",
              "text-[clamp(1.05rem,2vw,1.6rem)]",
              "xl:text-[clamp(1.25rem,1.5vw,1.65rem)]",
            )}
          >
            {label}
          </p>
        </div>
        <p
          className={clsx(
            "m-0 leading-[1.55] text-body",
            "text-[clamp(0.875rem,1.25vw,0.95rem)]",
            "xl:text-[1.02rem] xl:leading-[1.6]",
          )}
        >
          {body}
        </p>
      </div>
    </div>
  );
}
