"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { clsx } from "@/lib/clsx";
import { CheckIcon } from "@/components/ui/icons";
import { useFunnel } from "@/lib/funnel/store";
import {
  SHARED_FEATURES,
  TIERS,
  type BillingInterval,
  type OfferId,
  type PlanOffer,
} from "@/lib/config";
import {
  resolvePlanPrice,
  type PricingPlatform,
} from "@/lib/pricing";

export type ProductIdMap = Record<string, string | undefined>;

type FrameMetrics = {
  /** Fixed frame size — always taken from the Standard (recommended) column. */
  width: number;
  height: number;
  /** Absolute left offset of each plan column inside the table wrapper. */
  leftById: Partial<Record<OfferId, number>>;
  top: number;
};

function productKey(offerId: string, interval: BillingInterval): string {
  return `${offerId}:${interval}`;
}

/**
 * Pricing comparison table — matches the brand pricing design.
 * A fixed-size gold frame (Standard dimensions) slides between columns on hover.
 */
export function PricingPlans({
  productIds,
  tiers = TIERS,
  features = SHARED_FEATURES,
  platform = "web",
}: {
  productIds: ProductIdMap;
  tiers?: PlanOffer[];
  features?: string[];
  platform?: PricingPlatform;
}) {
  const { selectOffer } = useFunnel();
  const [interval, setInterval] = useState<BillingInterval>("month");
  const [hoveredId, setHoveredId] = useState<OfferId | null>(null);

  const tableWrapRef = useRef<HTMLDivElement | null>(null);
  const tableRef = useRef<HTMLTableElement | null>(null);
  const [frame, setFrame] = useState<FrameMetrics | null>(null);

  const defaultHighlightId = useMemo(
    () => tiers.find((tier) => tier.recommended)?.id ?? tiers[0]?.id ?? null,
    [tiers],
  );
  const activeId = hoveredId ?? defaultHighlightId;

  const choose = (offer: PlanOffer) => {
    selectOffer({ offerId: offer.id, interval, addon: false });
  };

  const unit = interval === "year" ? "/ year" : "/user-mo";
  const activate = (id: OfferId) => setHoveredId(id);
  const clearHover = () => setHoveredId(null);

  const measureFrame = useCallback(() => {
    const wrap = tableWrapRef.current;
    const table = tableRef.current;
    if (!wrap || !table || tiers.length === 0) return;

    const wrapRect = wrap.getBoundingClientRect();
    const referenceId = defaultHighlightId ?? tiers[0].id;
    const leftById: Partial<Record<OfferId, number>> = {};
    let width = 0;
    let height = 0;
    let top = 0;

    tiers.forEach((tier, index) => {
      // Column index in the table: 0 = feature labels, 1..n = plans
      const colIndex = index + 2;
      const header = table.querySelector(
        `thead th:nth-child(${colIndex})`,
      ) as HTMLElement | null;
      const cells = table.querySelectorAll(
        `tr > :nth-child(${colIndex})`,
      ) as NodeListOf<HTMLElement>;
      if (!header || cells.length === 0) return;

      const first = cells[0];
      const last = cells[cells.length - 1];
      const firstRect = first.getBoundingClientRect();
      const lastRect = last.getBoundingClientRect();

      leftById[tier.id] = firstRect.left - wrapRect.left;

      if (tier.id === referenceId) {
        width = firstRect.width;
        height = lastRect.bottom - firstRect.top;
        top = firstRect.top - wrapRect.top;
      }
    });

    if (width > 0 && height > 0) {
      setFrame({ width, height, leftById, top });
    }
  }, [defaultHighlightId, tiers]);

  useEffect(() => {
    // Let layout settle (fonts / table-fixed) before the first measure.
    const raf = window.requestAnimationFrame(() => measureFrame());

    const wrap = tableWrapRef.current;
    if (!wrap) {
      return () => window.cancelAnimationFrame(raf);
    }

    const observer = new ResizeObserver(() => measureFrame());
    observer.observe(wrap);
    if (tableRef.current) observer.observe(tableRef.current);

    window.addEventListener("resize", measureFrame);
    return () => {
      window.cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("resize", measureFrame);
    };
  }, [measureFrame, interval, features.length, tiers]);

  const frameLeft =
    activeId && frame?.leftById[activeId] != null ? frame.leftById[activeId]! : 0;

  return (
    <div className="animate-rise">
      <div className="mb-10 flex justify-center">
        <div className="inline-flex rounded-full border border-white/15 bg-transparent p-1">
          <ToggleBtn active={interval === "month"} onClick={() => setInterval("month")}>
            Monthly
          </ToggleBtn>
          <ToggleBtn active={interval === "year"} onClick={() => setInterval("year")}>
            Annual{" "}
            <span className={interval === "year" ? "text-[#15110A]/70" : "text-gold"}>
              · save ~17%
            </span>
          </ToggleBtn>
        </div>
      </div>

      {/* Desktop comparison table — lg+ only (768px tablets use stacked cards). */}
      <div className="hidden lg:block" onMouseLeave={clearHover}>
        {/*
          Keep horizontal scroll for narrow desktops, but don't clip the gold
          frame's rounded bottom — padding gives the border room to paint.
        */}
        <div className="overflow-x-auto pb-3">
          <div ref={tableWrapRef} className="relative min-w-[720px] px-1 pb-5 pt-2">
            {frame && activeId && frame.leftById[activeId] != null && (
              <div
                aria-hidden
                className="pointer-events-none absolute z-10 rounded-[18px] border border-gold/80 transition-transform duration-300 ease-out"
                style={{
                  width: frame.width,
                  height: frame.height,
                  top: frame.top,
                  left: 0,
                  transform: `translateX(${frameLeft}px)`,
                  willChange: "transform",
                  background:
                    "radial-gradient(120% 80% at 50% 20%, rgba(228,198,107,0.12) 0%, rgba(201,162,75,0.05) 42%, rgba(201,162,75,0.02) 70%, transparent 100%)",
                  boxShadow:
                    "0 0 0 1px rgba(212,175,55,0.22), inset 0 0 28px rgba(212,175,55,0.18), inset 0 0 56px rgba(201,162,75,0.1), inset 0 1px 0 rgba(255,236,180,0.2)",
                }}
              />
            )}

            <table
              ref={tableRef}
              className="relative z-0 w-full table-fixed border-collapse text-left"
            >
          <colgroup>
            <col className="w-[28%]" />
            {tiers.map((tier) => (
              <col key={tier.id} />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th className="pb-6 pr-4" aria-hidden />
              {tiers.map((tier) => (
                <th
                  key={tier.id}
                  onMouseEnter={() => activate(tier.id)}
                  className="relative px-4 pb-6 pt-5 text-center align-bottom"
                >
                  <div className="font-mono text-[12px] uppercase tracking-label text-paper">
                    {tier.name}
                    {tier.recommended ? (
                      <span className="text-muted"> - RECOMMENDED</span>
                    ) : null}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="pr-4" />
              {tiers.map((tier) => {
                const mobileCents =
                  interval === "year" ? tier.annualCents : tier.monthlyCents;
                const price = resolvePlanPrice(mobileCents, platform);
                return (
                  <td
                    key={tier.id}
                    onMouseEnter={() => activate(tier.id)}
                    className="px-4 pb-1 text-center"
                  >
                    <div className="font-display text-[clamp(28px,3.5vw,40px)] font-semibold leading-none text-paper">
                      {price.displayLabel}
                    </div>
                  </td>
                );
              })}
            </tr>
            <tr>
              <td className="pr-4" />
              {tiers.map((tier) => (
                <td
                  key={tier.id}
                  onMouseEnter={() => activate(tier.id)}
                  className="px-4 pb-5 text-center font-mono text-[12px] text-muted"
                >
                  {unit}
                </td>
              ))}
            </tr>

            <tr className="bg-white/[0.04]">
              <td className="rounded-l-lg py-4 pl-4 pr-4 font-mono text-[12px] uppercase tracking-label text-gold">
                Booster cadence
              </td>
              {tiers.map((tier) => (
                <td
                  key={tier.id}
                  onMouseEnter={() => activate(tier.id)}
                  className="px-4 py-4 text-center text-[14px] text-body"
                >
                  {tier.frequency}
                </td>
              ))}
            </tr>

            {features.map((feature) => (
              <tr key={feature} className="border-t border-white/10">
                <td className="py-3.5 pr-4 text-[14px] leading-snug text-paper">{feature}</td>
                {tiers.map((tier) => (
                  <td
                    key={tier.id}
                    onMouseEnter={() => activate(tier.id)}
                    className="px-4 py-3.5 text-center"
                  >
                    <span className="inline-flex text-gold">
                      <CheckIcon className="mx-auto h-4 w-4" />
                    </span>
                  </td>
                ))}
              </tr>
            ))}

            <tr>
              <td className="pr-4 pt-8" />
              {tiers.map((tier) => {
                const id = productIds[productKey(tier.id, interval)];
                const href = id ? `/pre-checkout/community?products=${id}` : undefined;
                const active = tier.id === activeId;
                return (
                  <td
                    key={tier.id}
                    onMouseEnter={() => activate(tier.id)}
                    className="px-4 pt-8 pb-6 text-center align-top"
                  >
                    {href ? (
                      <a
                        href={href}
                        onClick={() => choose(tier)}
                        className={subscribeButtonClass(active)}
                      >
                        Subscribe
                      </a>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className={subscribeButtonClass(false, true)}
                      >
                        Subscribe
                      </button>
                    )}
                    {!id && (
                      <p className="mt-2 font-mono text-[10px] text-muted">
                        Set POLAR_PRODUCT_{tier.id.toUpperCase()}_{interval.toUpperCase()}
                      </p>
                    )}
                  </td>
                );
              })}
            </tr>
          </tbody>
          </table>
          </div>
        </div>
      </div>

      {/* Stacked cards for mobile + tablet (≤1023px), including 768. */}
      <div className="mx-auto flex w-full max-w-[420px] flex-col gap-5 md:max-w-[520px] lg:hidden">
        {tiers.map((tier) => {
          const mobileCents =
            interval === "year" ? tier.annualCents : tier.monthlyCents;
          const price = resolvePlanPrice(mobileCents, platform);
          const id = productIds[productKey(tier.id, interval)];
          const href = id ? `/pre-checkout/community?products=${id}` : undefined;
          const active = tier.id === activeId;

          return (
            <div
              key={tier.id}
              onMouseEnter={() => activate(tier.id)}
              onMouseLeave={clearHover}
              className={clsx(
                "rounded-[22px] border p-5 transition-[border-color,background] duration-200",
                active
                  ? "border-gold bg-[linear-gradient(160deg,rgba(201,162,75,0.14)_0%,rgba(201,162,75,0.04)_100%)]"
                  : "border-white/15 bg-white/[0.03]",
              )}
            >
              <div className="font-mono text-[12px] uppercase tracking-label text-paper">
                {tier.name}
                {tier.recommended ? (
                  <span className="text-muted"> - RECOMMENDED</span>
                ) : null}
              </div>
              <div className="mt-3 font-display text-[36px] font-semibold leading-none text-paper">
                {price.displayLabel}
              </div>
              <p className="mt-1 font-mono text-[12px] text-muted">{unit}</p>
              <p className="mt-4 font-mono text-[12px] uppercase tracking-label text-gold">
                {tier.frequency}
              </p>
              <ul className="mt-4 space-y-2.5 border-t border-white/10 pt-4">
                {features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-[13.5px] text-body">
                    <CheckIcon className="mt-0.5 h-3.5 w-3.5 flex-none text-gold" />
                    {feature}
                  </li>
                ))}
              </ul>
              {href ? (
                <a
                  href={href}
                  onClick={() => choose(tier)}
                  className={clsx(subscribeButtonClass(active), "mt-6")}
                >
                  Subscribe
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className={clsx(subscribeButtonClass(false, true), "mt-6")}
                >
                  Subscribe
                </button>
              )}
            </div>
          );
        })}
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
      type="button"
      onClick={onClick}
      className={clsx(
        "rounded-full px-5 py-2.5 font-sans text-sm transition",
        active ? "bg-gold-cta text-[#15110A]" : "text-paper hover:text-gold",
      )}
    >
      {children}
    </button>
  );
}

function subscribeButtonClass(emphasized: boolean, disabled = false) {
  return clsx(
    "inline-flex h-11 w-full max-w-[200px] items-center justify-center rounded-full border px-6 font-sans text-[14px] font-semibold transition",
    disabled
      ? "cursor-not-allowed border-line text-muted opacity-60"
      : emphasized
        ? "border-transparent bg-gold-cta text-[#15110A] hover:bg-gold-hi"
        : "border-paper/70 bg-transparent text-paper hover:border-gold hover:text-gold",
  );
}
