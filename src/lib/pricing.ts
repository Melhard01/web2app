/**
 * Platform-aware pricing helpers.
 *
 * Mobile (App Store / Google Play) prices are the base.
 * Web prices are derived from mobile with a single discount percentage.
 */

export type PricingPlatform = "web" | "mobile";

/**
 * Web discount applied to every plan.
 * Override with NEXT_PUBLIC_WEB_DISCOUNT_PERCENT in env (e.g. "30").
 */
export const WEB_DISCOUNT_PERCENT = (() => {
  const raw = process.env.NEXT_PUBLIC_WEB_DISCOUNT_PERCENT?.trim();
  if (!raw) return 30;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) return 30;
  return parsed;
})();

/** Format a dollar amount as USD display text. */
export function formatUsd(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

/** Format integer cents as USD display text. */
export function formatUsdFromCents(cents: number): string {
  return formatUsd(cents / 100);
}

/**
 * webPrice = mobilePrice * (1 - WEB_DISCOUNT_PERCENT / 100)
 * Works in cents for stable money math.
 */
export function webPriceCents(
  mobileCents: number,
  discountPercent: number = WEB_DISCOUNT_PERCENT,
): number {
  const clamped = Math.min(100, Math.max(0, discountPercent));
  return Math.round(mobileCents * (1 - clamped / 100));
}

export type ResolvedPlanPrice = {
  /** Price shown as primary (platform-specific). */
  displayCents: number;
  displayLabel: string;
  /** Original mobile / store base price. */
  mobileCents: number;
  mobileLabel: string;
  /** Whether UI should show strikethrough + badge. */
  showDiscount: boolean;
  discountPercent: number;
  /** e.g. "30% OFF" — null when not discounted. */
  discountBadge: string | null;
};

/**
 * Resolve the price a card should show for the current platform.
 * Mobile: base only. Web: discounted primary + original for strikethrough.
 */
export function resolvePlanPrice(
  mobileCents: number,
  platform: PricingPlatform,
  discountPercent: number = WEB_DISCOUNT_PERCENT,
): ResolvedPlanPrice {
  const mobileLabel = formatUsdFromCents(mobileCents);

  if (platform !== "web" || discountPercent <= 0) {
    return {
      displayCents: mobileCents,
      displayLabel: mobileLabel,
      mobileCents,
      mobileLabel,
      showDiscount: false,
      discountPercent,
      discountBadge: null,
    };
  }

  const displayCents = webPriceCents(mobileCents, discountPercent);
  return {
    displayCents,
    displayLabel: formatUsdFromCents(displayCents),
    mobileCents,
    mobileLabel,
    showDiscount: displayCents < mobileCents,
    discountPercent,
    discountBadge: `${discountPercent}% OFF`,
  };
}
