"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ReportView } from "@/components/report/ReportView";
import { BrandHeader } from "@/components/ui/BrandHeader";
import { useFunnel } from "@/lib/funnel/store";
import { buildReport } from "@/lib/quiz/scoring";
import { QUIZ } from "@/lib/quiz/config";

export default function ReportPage() {
  const router = useRouter();
  const { answers, setProfile } = useFunnel();

  // Require the scored questions to have been answered.
  const scoredAnswered = QUIZ.questions
    .filter((q) => q.scoring)
    .every((q) => Boolean(answers[q.id]));

  const report = useMemo(() => buildReport(QUIZ, answers), [answers]);

  useEffect(() => {
    if (!scoredAnswered) {
      router.replace("/quiz");
    } else {
      setProfile(report.profileKey);
    }
  }, [scoredAnswered, report.profileKey, setProfile, router]);

  if (!scoredAnswered) return null;

  return (
    <div className="flex min-h-screen flex-col premium-scene">
      <div className="premium-ambient -z-10" aria-hidden />
      <span className="premium-beam -z-10 left-[-8%] top-[12%] h-[280px] w-[420px]" aria-hidden />
      <span className="premium-beam -z-10 right-[-6%] top-[8%] h-[240px] w-[360px]" aria-hidden />
      <BrandHeader step={0} stepperClassName="!pt-2 sm:!pt-3" />
      <main className="relative z-10 mx-auto w-full max-w-[min(100%,80rem)] px-[clamp(1rem,3vw,2.5rem)] pb-[clamp(3rem,6vw,5rem)] pt-12 sm:pt-14 xl:max-w-[min(100%,88rem)] xl:px-[clamp(1.75rem,3.5vw,3rem)] xl:pb-20 xl:pt-16 uw:max-w-[120rem] uw:px-16">
        <ReportView
          profileKey={report.profileKey}
          profile={report.profile}
          scores={report.scores}
          maxScore={report.maxScore}
        />
      </main>
    </div>
  );
}
