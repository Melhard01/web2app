"use client";

import { clsx } from "@/lib/clsx";
import type { QuizOption } from "@/lib/quiz/types";
import type { CSSProperties } from "react";

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
  hideTitle = false,
  animateKey = "",
}: {
  text: string;
  options: QuizOption[];
  selected: string | undefined;
  onSelect: (key: string) => void;
  hideTitle?: boolean;
  animateKey?: string;
}) {
  return (
    <div className="eq-options-wrap">
      {!hideTitle ? (
        <p className="m-0 mb-6 font-sans text-[clamp(21px,3.4vw,27px)] font-semibold leading-[1.28] tracking-[-0.01em] text-white">
          {text}
        </p>
      ) : null}
      <div className="eq-options-list flex flex-col gap-3.5">
        {options.map((o, i) => (
          <button
            key={o.key}
            type="button"
            onClick={() => onSelect(o.key)}
            aria-pressed={selected === o.key}
            className={clsx("opt", selected === o.key && "sel")}
            style={{ "--eq-delay": `${90 + i * 65}ms` } as CSSProperties}
            data-animate-key={animateKey}
          >
            <span className="ltr">{LETTERS[i]}</span>
            <span>{o.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
