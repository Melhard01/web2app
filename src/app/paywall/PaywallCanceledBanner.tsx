"use client";

import { useSearchParams } from "next/navigation";

export function PaywallCanceledBanner() {
  const canceled = useSearchParams().get("canceled");

  if (!canceled) return null;

  return (
    <p className="mx-auto mb-6 max-w-[680px] px-[22px] text-center">
      <span className="inline-block rounded-[11px] border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-gold-hi">
        Checkout canceled — your plan is still here when you&apos;re ready.
      </span>
    </p>
  );
}
