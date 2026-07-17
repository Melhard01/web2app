"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { BrandHeader } from "@/components/ui/BrandHeader";
import { useFunnel } from "@/lib/funnel/store";
import { QUIZ } from "@/lib/quiz/config";

const LOADER_LINES = [
  "Reading your answers",
  "Mapping your profile",
  "Matching your cohort",
];

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const EASING = "cubic-bezier(.65,0,.35,1)";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function QuizEngine() {
  const router = useRouter();
  const { answers, setAnswer } = useFunnel();
  const total = QUIZ.questions.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const [phase, setPhase] = useState<"intro" | "quiz" | "loading">("intro");
  const [locked, setLocked] = useState(false);
  const [optionPhase, setOptionPhase] = useState<"in" | "out">("in");
  const [enterCycle, setEnterCycle] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [noMotion, setNoMotion] = useState(true);
  const [layout, setLayout] = useState({
    viewportHeight: 240,
    trackOffset: 0,
    markerTop: 0,
    markerHeight: 40,
    windowStart: 0,
  });

  const rowRefs = useRef<Array<HTMLDivElement | null>>([]);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const completionTimerRef = useRef<number | null>(null);
  const advanceTimerRef = useRef<number | null>(null);
  const unlockTimerRef = useRef<number | null>(null);

  const currentQuestion = QUIZ.questions[activeIndex];

  const answeredCount = useMemo(
    () =>
      QUIZ.questions.reduce<number>(
        (count, q) => (typeof answers[q.id] === "string" ? count + 1 : count),
        0,
      ),
    [answers],
  );

  const recalcLayout = useCallback(
    (withNoMotion: boolean) => {
      if (withNoMotion || reduceMotion) setNoMotion(true);

      const rows = rowRefs.current;
      if (!rows.length || rows.some((row) => !row)) return;

      const tops = rows.map((row) => row!.offsetTop);
      const heights = rows.map((row) => row!.offsetHeight);

      const windowStart = clamp(activeIndex - 1, 0, total - 3);
      const first = windowStart;
      const third = Math.min(windowStart + 2, total - 1);

      const viewportTop = tops[first];
      const viewportBottom = tops[third] + heights[third];
      const viewportHeight = viewportBottom - viewportTop;

      setLayout({
        viewportHeight,
        trackOffset: -viewportTop,
        markerTop: tops[activeIndex] - viewportTop,
        markerHeight: heights[activeIndex],
        windowStart,
      });

      if (withNoMotion || reduceMotion) {
        window.requestAnimationFrame(() => setNoMotion(false));
      }
    },
    [activeIndex, reduceMotion, total],
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduceMotion(media.matches);
    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    recalcLayout(true);

    const onResize = () => recalcLayout(true);
    window.addEventListener("resize", onResize);

    if (document.fonts?.ready) {
      document.fonts.ready.then(() => recalcLayout(true)).catch(() => undefined);
    }

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [recalcLayout]);

  useEffect(() => {
    recalcLayout(false);
  }, [activeIndex, recalcLayout]);

  useEffect(() => {
    if (reduceMotion) {
      optionRefs.current[0]?.focus({ preventScroll: true });
      return;
    }
    const timer = window.setTimeout(() => {
      optionRefs.current[0]?.focus({ preventScroll: true });
    }, 240);
    return () => window.clearTimeout(timer);
  }, [activeIndex, enterCycle, reduceMotion]);

  useEffect(() => {
    return () => {
      if (completionTimerRef.current) window.clearTimeout(completionTimerRef.current);
      if (advanceTimerRef.current) window.clearTimeout(advanceTimerRef.current);
      if (unlockTimerRef.current) window.clearTimeout(unlockTimerRef.current);
    };
  }, []);

  const goToQuestion = (index: number) => {
    if (locked || index === activeIndex) return;
    setOptionPhase("out");
    setLocked(true);
    const outDuration = reduceMotion ? 0 : 200;
    const unlockDuration = reduceMotion ? 0 : 430;

    advanceTimerRef.current = window.setTimeout(() => {
      setActiveIndex(index);
      setEnterCycle((v) => v + 1);
      setOptionPhase("in");
    }, outDuration);

    unlockTimerRef.current = window.setTimeout(() => {
      setLocked(false);
    }, unlockDuration);
  };

  const selectOption = (optionIndex: number) => {
    if (locked) return;

    const option = currentQuestion.options[optionIndex];
    if (!option) return;
    setAnswer(currentQuestion.id, option.key);

    const isFinal = activeIndex === total - 1;
    const outDuration = reduceMotion ? 0 : 200;
    const advanceDuration = reduceMotion ? 0 : 430;

    if (isFinal) {
      setLocked(true);
      setOptionPhase("out");
      completionTimerRef.current = window.setTimeout(() => {
        setLocked(false);
        setPhase("loading");
      }, advanceDuration);
      return;
    }

    setLocked(true);
    setOptionPhase("out");

    advanceTimerRef.current = window.setTimeout(() => {
      setActiveIndex((i) => i + 1);
      setOptionPhase("in");
      setEnterCycle((v) => v + 1);
    }, outDuration);

    unlockTimerRef.current = window.setTimeout(() => {
      setLocked(false);
    }, advanceDuration);
  };

  if (phase === "intro") return <Intro onBegin={() => setPhase("quiz")} />;
  if (phase === "loading") return <Loader onDone={() => router.push("/report")} />;

  const windowEnd = layout.windowStart + 2;

  return (
    <div className="epineon-shell">
      <BrandHeader step={0} />
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500;1,600&family=Manrope:wght@300;400;500;600;700&display=swap");
      `}</style>

      <main className="epineon-wrap">
        <header className="epineon-topbar">
          <nav className="spine" aria-label="Assessment progress">
            {QUIZ.questions.map((q, i) => {
              const isCompleted = typeof answers[q.id] === "string" && i !== activeIndex;
              const isCurrent = i === activeIndex;
              const canJump = isCompleted && !locked;
              return (
                <button
                  key={`spine-${i}`}
                  type="button"
                  className={`spine-seg${isCompleted ? " completed" : ""}${isCurrent ? " current" : ""}`}
                  disabled={!canJump}
                  aria-label={`Go to question ${i + 1}`}
                  onClick={() => goToQuestion(i)}
                />
              );
            })}
          </nav>
        </header>

        <section className="quiz-grid">
          <div className="left-col">
            <div
              className={`question-viewport${noMotion || reduceMotion ? " instant" : ""}`}
              style={{ height: `${layout.viewportHeight}px` }}
            >
              <div
                className={`marker${noMotion || reduceMotion ? " instant" : ""}`}
                style={{
                  transform: `translateY(${layout.markerTop}px)`,
                  height: `${layout.markerHeight}px`,
                  opacity: 1,
                }}
              />
              <div
                className={`question-track${noMotion || reduceMotion ? " instant" : ""}`}
                style={{ transform: `translateY(${layout.trackOffset}px)` }}
              >
                {QUIZ.questions.map((q, i) => {
                  const isActive = i === activeIndex;
                  const isAnswered = typeof answers[q.id] === "string" && !isActive;
                  const isUpcoming = !isActive && !isAnswered;
                  const isVisible = i >= layout.windowStart && i <= windowEnd;
                  const canRevisit = isVisible && isAnswered && !locked;

                  return (
                    <div
                      key={`question-${i}`}
                      ref={(el) => {
                        rowRefs.current[i] = el;
                      }}
                      className={`question-row${isActive ? " active" : ""}${isAnswered ? " answered" : ""}${isUpcoming ? " upcoming" : ""}`}
                    >
                      <button
                        type="button"
                        className={`row-tap${canRevisit ? " clickable" : ""}`}
                        onClick={() => canRevisit && goToQuestion(i)}
                        disabled={!canRevisit}
                        tabIndex={canRevisit ? 0 : -1}
                        aria-current={isActive ? "true" : undefined}
                        aria-label={`Question ${i + 1}: ${q.text}`}
                      >
                        <span className="q-num">{i + 1}</span>
                        <span className="q-text">{q.text}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="right-col">
            <div className={`choose-label${optionPhase === "in" && !reduceMotion ? " enter" : ""}`}>
              CHOOSE ONE
            </div>
            <div
              key={`${activeIndex}-${enterCycle}`}
              className={`options-wrap${optionPhase === "out" ? " exit" : ""}${optionPhase === "in" && !reduceMotion ? " enter" : ""}`}
            >
              {currentQuestion.options.map((option, optionIndex) => {
                const isSelected = answers[currentQuestion.id] === option.key;
                return (
                  <button
                    key={`option-${activeIndex}-${optionIndex}`}
                    type="button"
                    ref={(el) => {
                      optionRefs.current[optionIndex] = el;
                    }}
                    className={`option-card${isSelected ? " selected" : ""}`}
                    onClick={() => selectOption(optionIndex)}
                    disabled={locked}
                    aria-label={`Option ${LETTERS[optionIndex]}: ${option.label}`}
                  >
                    <span className="option-badge">{LETTERS[optionIndex]}</span>
                    <span className="option-text">{option.label}</span>
                  </button>
                );
              })}
            </div>
            <p className="assistive-progress">
              {answeredCount}/{total} answered
            </p>
          </div>
        </section>
      </main>

      <style jsx>{`
        .epineon-shell {
          min-height: 100vh;
          background: radial-gradient(
              1100px 700px at 12% -10%,
              rgba(231, 198, 107, 0.07),
              transparent 60%
            ),
            radial-gradient(900px 900px at 110% 120%, rgba(212, 175, 55, 0.05), transparent 55%),
            #0a0908;
          color: #ece6d8;
          -webkit-font-smoothing: antialiased;
          font-family: "Manrope", system-ui, -apple-system, sans-serif;
        }

        .epineon-wrap {
          width: min(1180px, 100%);
          margin: 0 auto;
          padding: clamp(24px, 4vw, 52px) clamp(18px, 3vw, 44px) clamp(36px, 6vw, 72px);
        }

        .epineon-topbar {
          display: flex;
          justify-content: center;
          align-items: flex-start;
          gap: 24px;
          padding-bottom: 18px;
          margin-bottom: clamp(22px, 3vh, 34px);
        }

        .brand-name {
          font-size: 13px;
          line-height: 1;
          letter-spacing: 0.34em;
          color: #e7c66b;
          font-weight: 600;
        }

        .brand-sub {
          margin-top: 7px;
          font-size: 10px;
          line-height: 1;
          letter-spacing: 0.28em;
          color: #948b78;
          text-transform: uppercase;
          font-weight: 500;
        }

        .spine {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: flex-end;
          margin-top: 24px;
        }

        .spine-seg {
          width: 32px;
          height: 3px;
          border: none;
          border-radius: 2px;
          background: rgba(231, 198, 107, 0.16);
          cursor: default;
          transition:
            background 0.45s ${EASING},
            width 0.45s ${EASING},
            box-shadow 0.45s ${EASING},
            opacity 0.45s ${EASING};
          opacity: 0.68;
        }

        .spine-seg.completed {
          background: rgba(231, 198, 107, 0.52);
          opacity: 1;
          cursor: pointer;
        }

        .spine-seg.current {
          width: 46px;
          background: #e7c66b;
          box-shadow: 0 0 14px rgba(231, 198, 107, 0.55);
          opacity: 1;
        }

        .spine-seg:focus-visible {
          outline: 2px solid #e7c66b;
          outline-offset: 3px;
        }

        .quiz-grid {
          display: grid;
          grid-template-columns: minmax(0, 0.98fr) minmax(0, 1.02fr);
          gap: clamp(24px, 4vw, 56px);
          align-items: center;
          min-height: min(72vh, 680px);
        }

        .left-col {
          margin-top: clamp(8px, 2vh, 22px);
        }

        .right-col {
          border-left: 1px solid rgba(231, 198, 107, 0.18);
          padding-left: clamp(20px, 3vw, 42px);
        }

        .question-viewport {
          position: relative;
          overflow: hidden;
          transition: height 0.6s ${EASING};
          padding-left: 28px;
        }

        .question-viewport.instant {
          transition: none;
        }

        .question-track {
          position: relative;
          transition: transform 0.6s ${EASING};
        }

        .question-track.instant {
          transition: none;
        }

        .marker {
          position: absolute;
          left: 0;
          top: 0;
          width: 2px;
          border-radius: 999px;
          background: #e7c66b;
          box-shadow: 0 0 12px rgba(231, 198, 107, 0.55);
          transition:
            transform 0.6s ${EASING},
            height 0.6s ${EASING},
            opacity 0.4s ${EASING};
        }

        .marker.instant {
          transition: none;
        }

        .question-row {
          padding: clamp(8px, 1.4vh, 14px) 0;
          transition: opacity 0.55s ${EASING};
        }

        .question-row.active {
          opacity: 1;
        }

        .question-row.answered {
          opacity: 0.5;
        }

        .question-row.answered:hover {
          opacity: 0.82;
        }

        .question-row.upcoming {
          opacity: 0.28;
        }

        .row-tap {
          width: 100%;
          text-align: left;
          border: none;
          background: transparent;
          padding: 0;
          display: grid;
          grid-template-columns: auto minmax(0, 1fr);
          align-items: start;
          column-gap: 14px;
          color: inherit;
          cursor: default;
        }

        .row-tap.clickable {
          cursor: pointer;
        }

        .row-tap:focus-visible {
          outline: 2px solid rgba(231, 198, 107, 0.7);
          outline-offset: 4px;
        }

        .q-num {
          font-family: "Manrope", system-ui, sans-serif;
          color: #c4b89a;
          width: 28px;
          height: 28px;
          border-radius: 999px;
          border: 1px solid rgba(231, 198, 107, 0.22);
          background: rgba(255, 255, 255, 0.02);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          line-height: 1;
          font-weight: 500;
          letter-spacing: 0;
          font-variant-numeric: tabular-nums;
        }

        .q-text {
          font-family: "Cormorant Garamond", serif;
          color: #ece6d8;
          font-size: clamp(17px, 1.8vw, 22px);
          line-height: 1.24;
          font-weight: 500;
          letter-spacing: -0.01em;
          display: block;
        }

        .choose-label {
          font-size: 10.5px;
          letter-spacing: 0.3em;
          color: #948b78;
          text-transform: uppercase;
          font-weight: 600;
          margin-bottom: 12px;
          opacity: 1;
        }

        .choose-label.enter {
          animation: optionIn 0.5s ${EASING} backwards;
        }

        .options-wrap {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .options-wrap.exit {
          opacity: 0;
          transform: translateY(8px);
          transition:
            opacity 0.2s ${EASING},
            transform 0.2s ${EASING};
        }

        .options-wrap.enter .option-card {
          animation: optionIn 0.52s ${EASING} backwards;
        }

        .options-wrap.enter .option-card:nth-child(1) {
          animation-delay: 0.06s;
        }

        .options-wrap.enter .option-card:nth-child(2) {
          animation-delay: 0.13s;
        }

        .options-wrap.enter .option-card:nth-child(3) {
          animation-delay: 0.2s;
        }

        .options-wrap.enter .option-card:nth-child(4) {
          animation-delay: 0.27s;
        }

        .options-wrap.enter .option-card:nth-child(5) {
          animation-delay: 0.34s;
        }

        .option-card {
          display: flex;
          align-items: center;
          gap: 18px;
          width: 100%;
          text-align: left;
          border-radius: 16px;
          border: 1px solid rgba(231, 198, 107, 0.16);
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.015));
          -webkit-backdrop-filter: blur(14px) saturate(140%);
          backdrop-filter: blur(14px) saturate(140%);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.1),
            0 10px 30px -18px rgba(0, 0, 0, 0.75);
          padding: 17px 20px;
          color: #ece6d8;
          cursor: pointer;
          transition:
            transform 0.4s ${EASING},
            border-color 0.4s ${EASING},
            box-shadow 0.4s ${EASING},
            background 0.4s ${EASING};
        }

        .option-card:disabled {
          cursor: default;
        }

        .option-card:hover {
          transform: translateX(5px);
          border-color: rgba(231, 198, 107, 0.6);
          background: linear-gradient(135deg, rgba(231, 198, 107, 0.15), rgba(255, 255, 255, 0.03));
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.14),
            0 20px 42px -24px rgba(212, 175, 55, 0.55);
        }

        .option-card.selected {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.015));
          border-color: rgba(231, 198, 107, 0.16);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.1),
            0 10px 30px -18px rgba(0, 0, 0, 0.75);
        }

        .option-card.selected:hover {
          transform: translateX(5px);
          border-color: rgba(231, 198, 107, 0.6);
          background: linear-gradient(135deg, rgba(231, 198, 107, 0.15), rgba(255, 255, 255, 0.03));
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.14),
            0 20px 42px -24px rgba(212, 175, 55, 0.55);
        }

        .option-card:focus-visible {
          outline: 2px solid #e7c66b;
          outline-offset: 3px;
        }

        .option-badge {
          width: 40px;
          height: 40px;
          border-radius: 999px;
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(231, 198, 107, 0.38);
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.09), rgba(255, 255, 255, 0.02));
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.18);
          font-family: "Cormorant Garamond", serif;
          color: #e7c66b;
          font-size: 19px;
          line-height: 1;
          font-weight: 500;
          transition:
            background 0.4s ${EASING},
            color 0.4s ${EASING},
            border-color 0.4s ${EASING};
        }

        .option-card:hover .option-badge {
          background: #e7c66b;
          border-color: #e7c66b;
          color: #12100a;
        }

        .option-card.selected .option-badge {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.09), rgba(255, 255, 255, 0.02));
          border-color: rgba(231, 198, 107, 0.38);
          color: #e7c66b;
        }

        .option-card.selected:hover .option-badge {
          background: #e7c66b;
          border-color: #e7c66b;
          color: #12100a;
        }

        .option-text {
          font-family: "Manrope", system-ui, sans-serif;
          font-size: clamp(14.5px, 1.3vw, 16px);
          line-height: 1.45;
          font-weight: 400;
          letter-spacing: 0.005em;
          color: #ece6d8;
        }

        .assistive-progress {
          margin-top: 18px;
          color: #948b78;
          font-size: 12px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        @keyframes optionIn {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 780px) {
          .quiz-grid {
            grid-template-columns: 1fr;
            gap: 24px;
            min-height: auto;
          }

          .left-col {
            margin-top: 0;
          }

          .right-col {
            border-left: none;
            border-top: 1px solid rgba(231, 198, 107, 0.18);
            padding-left: 0;
            padding-top: 22px;
          }

          .spine {
            width: min(260px, 100%);
            justify-content: flex-start;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .epineon-shell *,
          .epineon-shell *::before,
          .epineon-shell *::after {
            animation: none !important;
            transition: none !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </div>
  );
}

function Intro({ onBegin }: { onBegin: () => void }) {
  return (
    <div className="flex min-h-screen flex-col">
      <BrandHeader step={0} />
      <main className="mx-auto flex w-full max-w-[640px] flex-1 flex-col justify-center px-[22px] pb-16">
        <div className="animate-rise text-center">
          <div className="mb-[18px] flex justify-center">
            <span className="inline-block rounded-full border border-gold/40 px-5 py-2 font-mono text-[12px] uppercase tracking-eyebrow text-gold">
              Step 1 · Find your profile
            </span>
          </div>
          <h1 className="m-0 mb-[22px] font-display text-[clamp(32px,5.5vw,48px)] font-semibold leading-[1.08] tracking-[-0.01em] text-paper">
            Let&apos;s find your{" "}
            <em className="italic text-gold">strategic profile</em>
          </h1>
          <p className="mx-auto m-0 mb-[30px] max-w-[34em] text-[17px] leading-[1.6] text-ash">
            Seven quick questions on how you read change, make the call, and stay
            ahead. We&apos;ll map the profile that defines how you operate, the blind
            spot holding you back, and the cohort that would sharpen you.
          </p>
          <Button onClick={onBegin}>Begin →</Button>
          <p className="mt-[26px] font-mono text-[12px] tracking-[0.04em] text-muted">
            about 2 minutes · your answers shape your plan
          </p>
        </div>
      </main>
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
