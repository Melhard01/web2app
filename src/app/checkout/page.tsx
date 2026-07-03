"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { BrandHeader } from "@/components/ui/BrandHeader";
import { useFunnel } from "@/lib/funnel/store";
import { ADDON, PLAN_NAME, findOffer } from "@/lib/config";
import { formatCents } from "@/lib/money";

export default function CheckoutPage() {
  const router = useRouter();
  const { selected } = useFunnel();
  const offer = selected ? findOffer(selected.offerId) : undefined;

  // No plan chosen (e.g. deep-linked here) → back to the paywall.
  useEffect(() => {
    if (!offer) router.replace("/paywall");
  }, [offer, router]);

  if (!offer || !selected) return null;

  const isAnnual = selected.interval === "year";
  const period = isAnnual ? "/ year" : "/ month";
  const baseCents = isAnnual ? offer.annualCents : offer.monthlyCents;
  const addonCents = selected.addon ? (isAnnual ? ADDON.annualCents : ADDON.monthlyCents) : 0;
  const totalCents = baseCents + addonCents;

  return (
    <div className="flex min-h-screen flex-col">
      <BrandHeader step={1} />
      <main className="mx-auto w-full max-w-[440px] px-[22px] pb-16">
        <p className="kicker mb-[18px]">Almost there</p>

        {/* order summary */}
        <div className="mb-7 rounded-[16px] border border-line bg-card2 p-[22px]">
          <SummaryRow
            title={PLAN_NAME}
            sub={`${offer.name} · ${offer.frequency}`}
            price={formatCents(baseCents)}
            period={period}
          />
          {selected.addon && (
            <SummaryRow
              title={ADDON.name}
              sub="Add-on · voice print + social sharing"
              price={formatCents(addonCents)}
              period={period}
              muted
            />
          )}
          <div className="mt-3 flex items-baseline justify-between border-t border-line pt-3">
            <span className="font-mono text-[12px] uppercase tracking-label text-muted">
              Total
            </span>
            <span className="font-display text-[22px] text-white">
              {formatCents(totalCents)}{" "}
              <span className="font-mono text-[12px] text-muted">{period}</span>
            </span>
          </div>
        </div>

        <div className="rounded-[16px] border border-line bg-card2 p-[22px]">
          <CheckoutForm
            offer={offer}
            interval={selected.interval}
            addon={selected.addon}
            totalLabel={formatCents(totalCents)}
          />
        </div>
      </main>
    </div>
  );
}

function SummaryRow({
  title,
  sub,
  price,
  period,
  muted,
}: {
  title: string;
  sub: string;
  price: string;
  period: string;
  muted?: boolean;
}) {
  return (
    <div className={`flex items-baseline justify-between ${muted ? "mt-3" : ""}`}>
      <div>
        <p className="m-0 font-display text-[18px] text-white">{title}</p>
        <p className="m-0 font-mono text-[12px] text-muted">{sub}</p>
      </div>
      <div className="text-right">
        <p className="m-0 font-display text-[18px] text-white">{price}</p>
        <p className="m-0 font-mono text-[12px] text-muted">{period}</p>
      </div>
    </div>
  );
}
