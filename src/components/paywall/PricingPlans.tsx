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
 * feature set — only the booster cadence and price differ. Subscribe CTAs route
 * through a details step before forwarding to Polar checkout.
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
    "mt-8 mt-auto box-border flex h-11 w-full shrink-0 touch-manipulation items-center justify-center rounded-full border-2 px-5 text-center font-sans text-[14px] font-semibold leading-none transition sm:mt-12 sm:h-12 sm:px-6 sm:text-[15px] lg:mt-16 lg:h-14 lg:text-[16px]",
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
  const checkoutHref = productId ? `/pre-checkout?products=${productId}` : undefined;

  return (
    <div
      className={clsx(
        "flex min-h-[440px] flex-col rounded-[28px] border bg-[linear-gradient(160deg,rgba(255,255,255,0.14)_0%,rgba(255,255,255,0.06)_45%,rgba(255,255,255,0.03)_100%)] p-6 backdrop-blur-2xl ring-1 ring-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_0_1px_rgba(228,198,107,0.28),0_20px_44px_rgba(0,0,0,0.58)] sm:min-h-[500px] sm:p-8 lg:min-h-[540px] lg:p-10",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-20px_40px_rgba(0,0,0,0.42),0_0_0_1px_rgba(212,175,55,0.12),0_12px_34px_rgba(0,0,0,0.5)]",
        offer.recommended ? "border-gold" : "border-gold/70",
      )}
    >
      <div className="flex flex-col items-start gap-2 border-b border-line pb-4 sm:pb-5 lg:flex-row lg:items-center lg:justify-between lg:gap-3 lg:pb-6">
        <span className="font-mono text-[12px] uppercase tracking-label text-gold sm:text-[13px] lg:text-[14px]">
          {offer.name}
        </span>
        {offer.recommended && (
          <span className="inline-flex max-w-full items-center rounded-full border border-gold/50 px-1.5 py-1 font-mono text-[8px] uppercase leading-none tracking-[0.12em] text-gold-hi sm:px-2 sm:text-[9px]">
            Recommended
          </span>
        )}
      </div>

      <p className="border-b border-line py-4 font-mono text-[13px] text-muted sm:py-5 sm:text-[14px] lg:py-6 lg:text-[15px]">
        {offer.frequency}
      </p>

      <div className="border-b border-line py-4 sm:py-5 lg:py-6">
        <div className="font-display text-[clamp(30px,6.5vw,42px)] text-white">{price}</div>
      </div>
      <p className="border-b border-line py-4 font-mono text-[13px] text-muted sm:py-5 sm:text-[14px] lg:py-6 lg:text-[15px]">
        {unit}
      </p>

      <p className="mt-5 flex-1 text-[15px] leading-[1.55] text-ash sm:mt-6 sm:text-[16px] lg:mt-7 lg:text-[17px]">
        {offer.blurb}
      </p>

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
