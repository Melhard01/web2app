"use client";

import { useState } from "react";
import { clsx } from "@/lib/clsx";
import { useFunnel } from "@/lib/funnel/store";
import {
  SHARED_FEATURES,
  TIERS,
  type BillingInterval,
  type PlanOffer,
} from "@/lib/config";

export type ProductIdMap = Record<string, string | undefined>;

function productKey(offerId: string, interval: BillingInterval): string {
  return `${offerId}:${interval}`;
}

/**
 * Pricing: three frequency tiers (Lite / Standard / Pro) that share the full
 * feature set — only the booster cadence and price differ. Subscribe CTAs link
 * directly to Polar checkout via /checkout?products=...
 */
export function PricingPlans({ productIds }: { productIds: ProductIdMap }) {
  const { selectOffer } = useFunnel();
  const [interval, setInterval] = useState<BillingInterval>("month");

  const choose = (offer: PlanOffer) => {
    selectOffer({ offerId: offer.id, interval, addon: false });
  };

  return (
    <div className="animate-rise">
      {/* billing toggle */}
      <div className="mb-9 inline-flex rounded-full border border-line bg-card p-1">
        <ToggleBtn active={interval === "month"} onClick={() => setInterval("month")}>
          Monthly
        </ToggleBtn>
        <ToggleBtn active={interval === "year"} onClick={() => setInterval("year")}>
          Annual <span className="text-gold">· save ~17%</span>
        </ToggleBtn>
      </div>

      {/* tier cards */}
      <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-3 md:gap-8">
        {TIERS.map((tier) => (
          <PlanCard
            key={tier.id}
            offer={tier}
            interval={interval}
            productId={productIds[productKey(tier.id, interval)]}
            onChoose={choose}
          />
        ))}
      </div>

      {/* shared feature set */}
      <div className="mt-10">
        <p className="lab mb-4">Every tier includes</p>
        <ul className="grid gap-2.5 sm:grid-cols-2">
          {SHARED_FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-3 text-[14.5px] text-body">
              <span className="mt-[7px] h-1.5 w-1.5 flex-none rounded-full bg-gold" />
              {f}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ToggleBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "rounded-full px-4 py-2 font-sans text-sm transition",
        active ? "bg-gold-cta text-[#15110A]" : "text-muted hover:text-body",
      )}
    >
      {children}
    </button>
  );
}

function subscribeButtonClass(recommended: boolean, disabled = false) {
  return clsx(
    "mt-16 mt-auto box-border flex h-14 w-full shrink-0 touch-manipulation items-center justify-center rounded-full border-2 px-6 text-center font-sans text-[16px] font-semibold leading-none transition",
    disabled
      ? "cursor-not-allowed border-line bg-card text-muted opacity-60"
      : recommended
        ? "border-transparent bg-gold-cta text-[#15110A] hover:bg-gold-hi active:scale-[0.98]"
        : "border-line bg-card text-body hover:border-gold active:scale-[0.98]",
  );
}

function PlanCard({
  offer,
  interval,
  productId,
  onChoose,
}: {
  offer: PlanOffer;
  interval: BillingInterval;
  productId: string | undefined;
  onChoose: (offer: PlanOffer) => void;
}) {
  const isAnnual = interval === "year";
  const price = isAnnual ? offer.annualLabel : offer.monthlyLabel;
  const unit = isAnnual ? "/ year" : "/ user / month";
  const checkoutHref = productId ? `/checkout?products=${productId}` : undefined;

  return (
    <div
      className={clsx(
        "flex min-h-[520px] flex-col rounded-[28px] border bg-card2 p-10 sm:min-h-[540px] sm:p-12",
        offer.recommended ? "border-gold" : "border-line",
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-line pb-6">
        <span className="font-mono text-[14px] uppercase tracking-label text-gold">
          {offer.name}
        </span>
        {offer.recommended && (
          <span className="rounded-full border border-gold/50 px-2.5 py-1 font-mono text-[10px] uppercase tracking-label text-gold-hi">
            Recommended
          </span>
        )}
      </div>

      <p className="border-b border-line py-6 font-mono text-[15px] text-muted">{offer.frequency}</p>

      <div className="border-b border-line py-6">
        <div className="font-display text-[clamp(34px,4.2vw,42px)] text-white">{price}</div>
      </div>
      <p className="border-b border-line py-6 font-mono text-[15px] text-muted">{unit}</p>

      <p className="mt-7 flex-1 text-[17px] leading-[1.55] text-ash">{offer.blurb}</p>

      {checkoutHref ? (
        <a
          href={checkoutHref}
          onClick={() => onChoose(offer)}
          className={subscribeButtonClass(Boolean(offer.recommended))}
        >
          Subscribe
        </a>
      ) : (
        <button type="button" disabled className={subscribeButtonClass(false, true)}>
          Subscribe
        </button>
      )}
      {!productId && (
        <p className="mt-2 text-center font-mono text-[10px] text-muted">
          Set POLAR_PRODUCT_{offer.id.toUpperCase()}_{interval.toUpperCase()}
        </p>
      )}
    </div>
  );
}
