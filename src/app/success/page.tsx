"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MultiRailHandoff } from "@/components/handoff/MultiRailHandoff";
import { BrandHeader } from "@/components/ui/BrandHeader";
import type { ProvisionResult } from "@/lib/provision";

/**
 * Success / handoff page. Reaches here two ways:
 *   - Mock: CheckoutForm already provisioned and stashed the result in
 *     sessionStorage; we read it.
 *   - Stripe: arrives with ?session_id=…; we POST it to /api/provision, which
 *     verifies the payment server-side before minting the entitlement token.
 */
const HANDOFF_KEY = "epiminded.handoff.v1";

function SuccessInner() {
  const sessionId = useSearchParams().get("session_id");
  const [result, setResult] = useState<ProvisionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Mock path: already provisioned and cached client-side.
    const cached = sessionStorage.getItem(HANDOFF_KEY);
    if (cached) {
      try {
        setResult(JSON.parse(cached));
        return;
      } catch {
        /* fall through to server provision */
      }
    }

    // Stripe path: verify the session server-side, then provision.
    if (sessionId) {
      fetch("/api/provision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) throw new Error(data?.error ?? "Provisioning failed");
          sessionStorage.setItem(HANDOFF_KEY, JSON.stringify(data));
          setResult(data);
        })
        .catch((e) => setError((e as Error).message));
    } else {
      setError("We couldn’t find your order. Please check your email for the link.");
    }
  }, [sessionId]);

  if (error) {
    return (
      <div className="text-center">
        <h1 className="font-display text-2xl font-semibold text-white">
          Something went wrong
        </h1>
        <p className="mt-3 text-ash">{error}</p>
        <a
          href="mailto:support@epiminded.app"
          className="mt-4 inline-block text-accent-hi underline underline-offset-2"
        >
          Contact support
        </a>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center gap-4 text-center font-mono text-[13px] uppercase tracking-label text-muted">
        <div className="h-[42px] w-[42px] animate-spin rounded-full border-2 border-line border-t-gold" />
        Setting up your account…
      </div>
    );
  }

  return <MultiRailHandoff result={result} />;
}

export default function SuccessPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <BrandHeader step={2} />
      <main className="mx-auto w-full max-w-md px-6 pb-16">
        <Suspense fallback={null}>
          <SuccessInner />
        </Suspense>
      </main>
    </div>
  );
}
