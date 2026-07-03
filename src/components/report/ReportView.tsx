"use client";

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
    <div className="flex flex-col gap-4 animate-rise">
      <p className="eyebrow">Your dominant profile</p>

      {/* hero card */}
      <div className="overflow-hidden rounded-[20px] border border-gold/40 bg-card2">
        <div className="flex items-center gap-4 border-b border-line bg-[rgba(201,162,75,0.07)] px-6 py-5">
          <span className="grid h-14 w-14 flex-none place-items-center rounded-2xl border border-gold/40 bg-card text-gold">
            <Icon className="h-7 w-7" />
          </span>
          <div>
            <div className="font-display text-[clamp(28px,5vw,40px)] font-semibold leading-none text-gold">
              {profile.name}
            </div>
            <p className="mt-1.5 font-display text-[15px] italic text-gold-hi">
              {profile.mantra}
            </p>
          </div>
        </div>
        <p className="px-6 py-5 text-[clamp(16px,2.4vw,19px)] leading-[1.5] text-white">
          {profile.result}
        </p>
      </div>

      {/* score radar */}
      <ProfileRadar scores={scores} maxScore={maxScore} activeKey={profileKey} />

      {/* insight cards */}
      <InsightCard
        icon={<ExposedIcon className="h-5 w-5" />}
        label="Where you are exposed"
        body={profile.exposed}
      />
      <InsightCard
        icon={<CohortIcon className="h-5 w-5" />}
        label="What a matched cohort gives you"
        body={profile.cohort}
      />

      {/* CTA */}
      <div className="mt-3">
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
    <div className="flex gap-4 rounded-[16px] border border-line bg-card2 p-5">
      <span className="grid h-10 w-10 flex-none place-items-center rounded-xl border border-line bg-card text-gold">
        {icon}
      </span>
      <div>
        <p className="lab mb-1.5">{label}</p>
        <p className="m-0 text-[15px] leading-[1.55] text-body">{body}</p>
      </div>
    </div>
  );
}
