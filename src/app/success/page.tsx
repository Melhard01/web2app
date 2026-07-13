"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BrandHeader } from "@/components/ui/BrandHeader";
import { MultiRailHandoff } from "@/components/handoff/MultiRailHandoff";
import { useFunnel } from "@/lib/funnel/store";
import type { ProvisionResult } from "@/lib/provision";

function SuccessInner() {
  const searchParams = useSearchParams();
  const checkoutId =
    searchParams.get("checkout_id") || searchParams.get("checkoutId");
  const { email, selected, markPaid } = useFunnel();
  const [result, setResult] = useState<ProvisionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!checkoutId || !email || !selected) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch("/api/provision", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email,
        orderRef: checkoutId,
        offerId: selected.offerId,
        interval: selected.interval,
        addon: selected.addon,
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(
            typeof data?.error === "string" ? data.error : "Provisioning failed.",
          );
        }
        if (!cancelled) {
          setResult(data as ProvisionResult);
          markPaid(checkoutId);
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          const message =
            e instanceof Error ? e.message : "Could not activate your access yet.";
          setError(message);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [checkoutId, email, selected, markPaid]);

  if (result) {
    return <MultiRailHandoff result={result} />;
  }

  return (
    <div className="animate-rise text-center">
      <p className="kicker mb-[18px]">You&apos;re in</p>
      <h1 className="m-0 font-display text-[clamp(28px,5vw,40px)] font-semibold leading-[1.1] text-paper">
        Payment successful
      </h1>
      <p className="mx-auto mt-4 max-w-[28em] text-[17px] leading-[1.6] text-ash">
        Thank you for subscribing to EpiMinded. We are activating your access and
        preparing your install options now.
      </p>
      {loading && (
        <p className="mt-4 font-mono text-[11px] uppercase tracking-label text-muted">
          Activating your membership...
        </p>
      )}
      {checkoutId && (
        <p className="mt-6 font-mono text-[11px] uppercase tracking-label text-muted">
          Order ref · {checkoutId}
        </p>
      )}
      {!email && (
        <p className="mt-4 text-sm text-muted">
          Missing checkout email context. Please return to plans and retry checkout.
        </p>
      )}
      {!selected && (
        <p className="mt-2 text-sm text-muted">
          Missing plan context. Please return to plans and select a subscription again.
        </p>
      )}
      {error && (
        <p className="mt-4 text-sm text-[#f0bbbb]">
          Activation failed: {error}
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
      <main className="mx-auto w-full max-w-5xl px-6 pb-16 pt-8 sm:px-8">
        <Suspense fallback={null}>
          <SuccessInner />
        </Suspense>
      </main>
    </div>
  );
}
