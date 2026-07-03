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
    <div className="flex min-h-screen flex-col">
      <BrandHeader step={0} />
      <main className="mx-auto w-full max-w-[640px] px-[22px] pb-16">
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
