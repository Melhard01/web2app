"use client";

import { useState } from "react";
import { clsx } from "@/lib/clsx";
import { useFunnel } from "@/lib/funnel/store";
import {
  ADDON,
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
  const [addon, setAddon] = useState(false);

  const choose = (offer: PlanOffer) => {
    selectOffer({ offerId: offer.id, interval, addon });
  };

  return (
    <div className="animate-rise">
      {/* billing toggle */}
      <div className="mb-7 inline-flex rounded-full border border-line bg-card p-1">
        <ToggleBtn active={interval === "month"} onClick={() => setInterval("month")}>
          Monthly
        </ToggleBtn>
        <ToggleBtn active={interval === "year"} onClick={() => setInterval("year")}>
          Annual <span className="text-gold">· save ~17%</span>
        </ToggleBtn>
      </div>

      {/* tier cards */}
      <div className="grid gap-3 sm:grid-cols-3">
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
      <div className="mt-5 rounded-[14px] border border-line bg-card2 p-[22px]">
        <p className="lab mb-3">Every tier includes</p>
        <ul className="grid gap-2.5 sm:grid-cols-2">
          {SHARED_FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-3 text-[14.5px] text-body">
              <span className="mt-[7px] h-1.5 w-1.5 flex-none rounded-full bg-gold" />
              {f}
            </li>
          ))}
        </ul>
      </div>

      {/* optional add-on */}
      <button
        type="button"
        onClick={() => setAddon((v) => !v)}
        aria-pressed={addon}
        className={clsx(
          "mt-3 flex w-full items-start gap-3.5 rounded-[14px] border p-[22px] text-left transition",
          addon ? "border-gold bg-[rgba(201,162,75,0.08)]" : "border-line bg-card2 hover:border-[#4a4030]",
        )}
      >
        <span
          className={clsx(
            "mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-md border text-xs",
            addon ? "border-gold bg-gold text-[#15110A]" : "border-line text-transparent",
          )}
        >
          ✓
        </span>
        <span className="flex-1">
          <span className="flex items-baseline justify-between gap-2">
            <b className="text-[15.5px] font-semibold text-white">Add-on · {ADDON.name}</b>
            <span className="whitespace-nowrap font-mono text-[13px] text-gold-hi">
              + {interval === "year" ? `${ADDON.annualLabel} / yr` : `${ADDON.monthlyLabel} / mo`}
            </span>
          </span>
          <span className="mt-1 block text-[14px] text-ash">{ADDON.desc}</span>
        </span>
      </button>
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
        "flex flex-col rounded-[16px] border bg-card2 p-[22px]",
        offer.recommended ? "border-gold" : "border-line",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-label text-gold">
          {offer.name}
        </span>
        {offer.recommended && (
          <span className="rounded-full border border-gold/50 px-2 py-0.5 font-mono text-[10px] uppercase tracking-label text-gold-hi">
            Recommended
          </span>
        )}
      </div>

      <p className="mt-1 font-mono text-[12px] text-muted">{offer.frequency}</p>

      <div className="mt-3 font-display text-[26px] text-white">{price}</div>
      <p className="font-mono text-[12px] text-muted">{unit}</p>

      <p className="mt-3 text-[14px] leading-[1.5] text-ash">{offer.blurb}</p>

      {checkoutHref ? (
        <a
          href={checkoutHref}
          onClick={() => onChoose(offer)}
          className={clsx(
            "mt-auto w-full rounded-full py-3 text-center font-sans text-[15px] font-semibold transition",
            offer.recommended
              ? "bg-gold-cta text-[#15110A] hover:bg-gold-hi"
              : "border border-line bg-card text-body hover:border-gold",
          )}
        >
          Subscribe
        </a>
      ) : (
        <button
          type="button"
          disabled
          className="mt-auto w-full cursor-not-allowed rounded-full border border-line bg-card py-3 font-sans text-[15px] font-semibold text-muted opacity-60"
        >
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
