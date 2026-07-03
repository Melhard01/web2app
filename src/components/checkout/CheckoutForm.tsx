"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Arrow } from "@/components/ui/Button";
import { useFunnel } from "@/lib/funnel/store";
import type { PlanOffer, BillingInterval } from "@/lib/config";

/**
 * "Email, then pay". Collects + consents email (captured for cart recovery),
 * then starts payment for the selected offer:
 *   - Stripe mode → redirect to hosted Checkout.
 *   - Mock mode   → simulate success, provision immediately, go to /success.
 */
export function CheckoutForm({
  offer,
  interval,
  addon,
  totalLabel,
}: {
  offer: PlanOffer;
  interval: BillingInterval;
  addon: boolean;
  totalLabel: string;
}) {
  const router = useRouter();
  const { email: savedEmail, setEmail, markPaid } = useFunnel();
  const [email, setLocalEmail] = useState(savedEmail ?? "");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const periodLabel = interval === "year" ? "/ year" : "/ month";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email.");
      return;
    }
    setEmail(email);
    setLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, offerId: offer.id, interval, addon }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Checkout failed");

      if (data.mock) {
        const prov = await fetch("/api/provision", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            orderRef: data.orderRef,
            offerId: offer.id,
            interval,
            addon,
          }),
        });
        const provData = await prov.json();
        if (!prov.ok) throw new Error(provData?.error ?? "Provisioning failed");

        markPaid(data.orderRef);
        sessionStorage.setItem("epiminded.handoff.v1", JSON.stringify(provData));
        router.push("/success");
      } else {
        window.location.href = data.url;
      }
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-6">
      <div>
        <label htmlFor="email" className="lab mb-2 block">
          Email address
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setLocalEmail(e.target.value)}
          placeholder="you@company.com"
          className="w-full rounded-[11px] border border-line bg-[#0E1730] p-[14px] font-sans text-[15px] text-white outline-none placeholder:text-[#5C6680] focus:border-accent"
        />
        <p className="mt-2 font-mono text-[12px] text-muted">
          We bind your membership to this email and send your access link here.
        </p>
      </div>

      <label className="flex items-start gap-3 text-sm text-ash">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1 h-4 w-4 accent-accent"
        />
        <span>
          Email me my access link and occasional updates. Unsubscribe anytime.
        </span>
      </label>

      {error && (
        <p className="rounded-[11px] border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      )}

      <Button type="submit" disabled={loading || !consent} className="w-full">
        {loading ? "Processing…" : <>Pay {totalLabel} {periodLabel} <Arrow /></>}
      </Button>
    </form>
  );
}
