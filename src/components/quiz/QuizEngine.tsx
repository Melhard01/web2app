"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { QuestionCard } from "./QuestionCard";
import { Button } from "@/components/ui/Button";
import { BrandHeader } from "@/components/ui/BrandHeader";
import Orb from "@/components/ui/Orb";
import { useFunnel } from "@/lib/funnel/store";
import { QUIZ } from "@/lib/quiz/config";
import type { QuizOption } from "@/lib/quiz/types";

const LOADER_LINES = [
  "Reading your answers",
  "Mapping your profile",
  "Matching your cohort",
];

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Drives the quiz: one question at a time with shuffled options, auto-advance
 * on select, a short "reading" loader, then routes to /report. All content
 * comes from QUIZ config.
 *
 * Options are shuffled CLIENT-SIDE only (after mount) so the server-rendered
 * HTML matches the first client render — avoids hydration mismatch.
 */
export function QuizEngine() {
  const router = useRouter();
  const { answers, setAnswer } = useFunnel();
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"intro" | "quiz" | "loading">("intro");
  const [mounted, setMounted] = useState(false);

  // Persist a shuffle order per question id for the session.
  const orderRef = useRef<Record<string, QuizOption[]>>({});

  useEffect(() => setMounted(true), []);

  const total = QUIZ.questions.length;
  const question = QUIZ.questions[index];

  const options = useMemo<QuizOption[]>(() => {
    if (!mounted) return question.options; // SSR + first client render: stable order
    if (!orderRef.current[question.id]) {
      orderRef.current[question.id] = shuffle(question.options);
    }
    return orderRef.current[question.id];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, question.id]);

  const select = useCallback(
    (key: string) => {
      setAnswer(question.id, key);
      window.setTimeout(() => {
        if (index < total - 1) {
          setIndex((i) => i + 1);
        } else {
          setPhase("loading");
        }
      }, 200);
    },
    [question.id, index, total, setAnswer],
  );

  const back = () => {
    if (index > 0) setIndex((i) => i - 1);
    else setPhase("intro");
  };

  if (phase === "intro") return <Intro onBegin={() => setPhase("quiz")} />;
  if (phase === "loading") return <Loader onDone={() => router.push("/report")} />;

  const stepNum = `0${index + 1}`.slice(-2);
  const totalNum = `0${total}`.slice(-2);
  const pct = Math.round((index / total) * 100);

  return (
    <div className="flex min-h-screen flex-col">
      <BrandHeader step={0} />
      <main className="mx-auto flex w-full max-w-[640px] flex-1 flex-col px-[22px] pb-16">
      <div className="flex flex-1 flex-col justify-center">
        {/* progress */}
        <div className="mb-[34px] flex items-center gap-3.5">
          <span className="whitespace-nowrap font-mono text-[12px] tracking-[0.12em] text-muted">
            {stepNum} / {totalNum}
          </span>
          <div className="h-[2px] flex-1 overflow-hidden rounded-sm bg-line">
            <div
              className="h-full bg-accent transition-[width] duration-[400ms]"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <QuestionCard
          text={question.text}
          options={options}
          selected={answers[question.id]}
          onSelect={select}
        />

        <div className="mt-[22px]">
          <button
            onClick={back}
            className="cursor-pointer border-none bg-transparent p-1 font-sans text-sm text-muted underline underline-offset-[3px] hover:text-body"
          >
            Back
          </button>
        </div>
      </div>
      </main>
    </div>
  );
}

function Intro({ onBegin }: { onBegin: () => void }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden>
        <Orb
          hoverIntensity={0.5}
          rotateOnHover
          hue={0}
          forceHoverState={false}
          backgroundColor="#131009"
        />
      </div>

      {/* Header + content above the orb; no overflow on this wrapper so sticky works. */}
      <div className="relative z-10 flex min-h-screen flex-col">
        <BrandHeader />
        <main className="mx-auto flex w-full max-w-[640px] flex-1 flex-col justify-center px-[22px] pb-16">
          <div className="animate-rise text-center">
            <h1 className="m-0 mb-[22px] font-display text-[clamp(32px,5.5vw,48px)] font-semibold leading-[1.08] tracking-[-0.01em] text-paper drop-shadow-[0_2px_18px_rgba(0,0,0,0.55)]">
              Let&apos;s find your{" "}
              <em className="italic text-gold">strategic profile</em>
            </h1>
            <p className="mx-auto m-0 mb-[30px] max-w-[34em] text-[17px] leading-[1.6] text-ash drop-shadow-[0_1px_12px_rgba(0,0,0,0.45)]">
              Seven quick questions on how you read change, make the call, and stay
              ahead. We&apos;ll map the profile that defines how you operate, the blind
              spot holding you back, and the cohort that would sharpen you.
            </p>
            <Button onClick={onBegin}>Begin →</Button>
            <p className="mt-[26px] font-mono text-[12px] tracking-[0.04em] text-white">
              A quick 2-minute quiz
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

function Loader({ onDone }: { onDone: () => void }) {
  const [line, setLine] = useState(0);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const step = reduce ? 120 : 650;
    const total = reduce ? 360 : 1750;

    const iv = window.setInterval(
      () => setLine((l) => Math.min(l + 1, LOADER_LINES.length - 1)),
      step,
    );
    const t = window.setTimeout(onDone, total);
    return () => {
      window.clearInterval(iv);
      window.clearTimeout(t);
    };
  }, [onDone]);

  return (
    <main className="mx-auto flex min-h-screen max-w-[640px] flex-col items-center justify-center px-[22px]">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="h-[42px] w-[42px] animate-spin rounded-full border-2 border-line border-t-gold" />
        <p className="font-mono text-[13px] uppercase tracking-[0.14em] text-muted">
          {LOADER_LINES[line]}
        </p>
      </div>
    </main>
  );
}
