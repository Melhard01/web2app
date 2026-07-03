"use client";

import { clsx } from "@/lib/clsx";
import type { QuizOption } from "@/lib/quiz/types";

const LETTERS = ["A", "B", "C", "D", "E"];

/**
 * Single-select question body — lettered options matching the brand preview.
 * Options arrive pre-shuffled from the engine; `selected` reflects the current
 * answer and clicks bubble up.
 */
export function QuestionCard({
  text,
  options,
  selected,
  onSelect,
}: {
  text: string;
  options: QuizOption[];
  selected: string | undefined;
  onSelect: (key: string) => void;
}) {
  return (
    <div className="animate-rise">
      <p className="m-0 mb-6 font-sans text-[clamp(21px,3.4vw,27px)] font-semibold leading-[1.28] tracking-[-0.01em] text-white">
        {text}
      </p>
      <div className="flex flex-col gap-[11px]">
        {options.map((o, i) => (
          <button
            key={o.key}
            type="button"
            onClick={() => onSelect(o.key)}
            aria-pressed={selected === o.key}
            className={clsx("opt", selected === o.key && "sel")}
          >
            <span className="ltr">{LETTERS[i]}</span>
            <span>{o.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
