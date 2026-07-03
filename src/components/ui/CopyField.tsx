"use client";

import { useState } from "react";
import { CopyIcon, CheckIcon } from "./icons";

/** Read-only link field with a copy button (handoff rails). */
export function CopyField({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — ignore */
    }
  };

  return (
    <div className="flex w-full min-w-0 items-center gap-2 rounded-[11px] border border-line bg-card p-1.5 pl-3">
      <input
        readOnly
        aria-label={label ?? "Link"}
        value={value}
        onFocus={(e) => e.currentTarget.select()}
        className="w-full min-w-0 flex-1 truncate bg-transparent font-mono text-[12px] text-muted outline-none"
      />
      <button
        onClick={copy}
        className="inline-flex flex-none items-center gap-1.5 rounded-lg bg-[#100E0B] px-3 py-2 text-sm text-body transition hover:text-gold"
      >
        {copied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
