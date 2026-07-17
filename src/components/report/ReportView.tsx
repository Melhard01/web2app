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

/**
 * The profile result = onboarding payoff, as a set of modern cards with icons:
 * a hero card (profile + mantra + read), a radar of how you scored across all
 * four profiles, then two insight cards (exposure and what a matched cohort
 * gives). CTA leads into plan selection.
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
    <div className="mx-auto flex w-full max-w-[360px] flex-col gap-8 animate-rise sm:max-w-[420px] sm:gap-10 lg:max-w-none">
      <div className="premium-card flex min-h-[380px] flex-col bg-[linear-gradient(160deg,rgba(255,255,255,0.14)_0%,rgba(255,255,255,0.06)_45%,rgba(255,255,255,0.03)_100%)] backdrop-blur-2xl ring-1 ring-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-20px_40px_rgba(0,0,0,0.42),0_0_0_1px_rgba(212,175,55,0.14),0_14px_36px_rgba(0,0,0,0.5)]">
        <p className="lab px-6 pb-1 pt-5">Your dominant profile</p>
        <div className="premium-card-header flex items-center gap-4 px-6 py-5">
          <span className="premium-icon-wrap h-14 w-14 flex-none">
            <Icon className="h-7 w-7" />
          </span>
          <div>
            <div className="font-display text-[clamp(28px,5vw,40px)] font-semibold leading-none text-gold">
              {profile.name}
            </div>
            <p className="mt-1.5 font-mono text-[11px] uppercase tracking-label text-gold-hi">
              {profile.mantra}
            </p>
          </div>
        </div>
        <p className="items-start px-6 py-5 text-[clamp(16px,2.4vw,19px)] leading-[1.5] text-white">
          {profile.result}
        </p>
        <div className="mx-6 border-t border-gold/10" />
        <ProfileRadar scores={scores} maxScore={maxScore} activeKey={profileKey} embedded />
      </div>

      {/* insight cards */}
      <div className="flex flex-col gap-4">
        <InsightCard
          icon={<ExposedIcon className="h-5 w-5" />}
          label="Where you are exposed"
          body={profile.exposed}
        />
        <InsightCard
          icon={<CohortIcon className="h-5 w-5" />}
          label="What a matched cohort gives you"
          body={profile.cohort}
          className="-mt-1"
        />
      </div>

      {/* CTA */}
      <div className="-mt-2 flex justify-end">
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
  className,
}: {
  icon: React.ReactNode;
  label: string;
  body: string;
  className?: string;
}) {
  return (
    <div className={clsx("premium-card flex gap-4 p-5", className)}>
      <span className="premium-icon-wrap h-10 w-10 flex-none">
        {icon}
      </span>
      <div>
        <p className="lab mb-1.5">{label}</p>
        <p className="m-0 text-[15px] leading-[1.55] text-body">{body}</p>
      </div>
    </div>
  );
}
