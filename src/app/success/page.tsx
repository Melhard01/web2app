"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { BrandHeader } from "@/components/ui/BrandHeader";

function SuccessInner() {
  const checkoutId = useSearchParams().get("checkout_id");

  return (
    <div className="animate-rise text-center">
      <p className="kicker mb-[18px]">You&apos;re in</p>
      <h1 className="m-0 font-display text-[clamp(28px,5vw,40px)] font-semibold leading-[1.1] text-paper">
        Payment successful
      </h1>
      <p className="mx-auto mt-4 max-w-[28em] text-[17px] leading-[1.6] text-ash">
        Thank you for subscribing to EpiMinded. Your access is being activated —
        you&apos;ll receive an email with next steps shortly.
      </p>
      {checkoutId && (
        <p className="mt-6 font-mono text-[11px] uppercase tracking-label text-muted">
          Order ref · {checkoutId}
        </p>
      )}
      {!checkoutId && (
        <p className="mt-6 text-sm text-muted">
          If you don&apos;t hear from us within a few minutes, contact{" "}
          <a
            href="mailto:support@epiminded.app"
            className="text-accent-hi underline underline-offset-2"
          >
            support@epiminded.app
          </a>
          .
        </p>
      )}
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <BrandHeader step={2} />
      <main className="mx-auto w-full max-w-md px-6 pb-16 pt-8">
        <Suspense fallback={null}>
          <SuccessInner />
        </Suspense>
      </main>
    </div>
  );
}
