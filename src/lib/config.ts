/**
 * Central funnel configuration: brand + the web-facing pricing.
 *
 * Pricing = Track B (end-user retail) from the EpiMinded pricing deck. Track A
 * (enterprise / per-seat) is a sales-led motion and intentionally not exposed in
 * this self-serve web funnel. Prices are taken from the deck as-is (they include
 * the store-fee buffer); the web simply collects payment fee-free and the
 * entitlement carries into the app.
 */

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const APP = {
  name: "EpiMinded",
  tagline: "Stay ahead of what is coming.",
} as const;

export type BillingInterval = "month" | "year";

/** Single membership, one of three frequency tiers. */
const SUBSCRIPTION_PLANS_PAYLOAD = {
  name: "EpiMinded Subscription Plans",
  description: "Pricing tiers for the EpiMinded cohort platform",
  features: [
    "Access to Cohort Community",
    "Weekly Live Sessions",
    "Resource Library",
  ],
  discount: 0,
  is_active: true,
  project: "EpiMinded",
  subplan: [
    {
      name: "LITE",
      description: "Essential features for getting started",
      pricing: [
        {
          currency: "USD",
          amount: 19.99,
          billing_cycle: "month",
        },
        {
          currency: "USD",
          amount: 199.0,
          billing_cycle: "year",
        },
      ],
      popular: false,
    },
    {
      name: "Standard",
      description: "Perfect balance for full cohort participation",
      pricing: [
        {
          currency: "USD",
          amount: 29.99,
          billing_cycle: "month",
        },
        {
          currency: "USD",
          amount: 299.0,
          billing_cycle: "year",
        },
      ],
      popular: true,
    },
    {
      name: "PRO",
      description: "Advanced tools, networking, and priority access",
      pricing: [
        {
          currency: "USD",
          amount: 39.99,
          billing_cycle: "month",
        },
        {
          currency: "USD",
          amount: 399.0,
          billing_cycle: "year",
        },
      ],
      popular: false,
    },
  ],
  index: 0,
} as const;

export const PLAN_NAME = SUBSCRIPTION_PLANS_PAYLOAD.name;

export interface PlanOffer {
  /** Stable id used across funnel state + entitlement token. */
  id: "lite" | "standard" | "pro";
  /** Tier display name. */
  name: string;
  /** Booster cadence. */
  frequency: string;
  monthlyCents: number;
  annualCents: number;
  monthlyLabel: string;
  annualLabel: string;
  recommended?: boolean;
  blurb: string;
}

const OFFER_IDS: Array<"lite" | "standard" | "pro"> = ["lite", "standard", "pro"];
const FREQUENCY_BY_ID: Record<"lite" | "standard" | "pro", string> = {
  lite: "3 boosters / week",
  standard: "5 boosters / week",
  pro: "Daily - 7 / week",
};

function formatUsd(amount: number) {
  return `$${amount.toFixed(2)}`;
}

/**
 * Three tiers — values sourced from SUBSCRIPTION_PLANS_PAYLOAD.
 * Frequency copy remains UI-specific and maps by tier id.
 */
export const TIERS: PlanOffer[] = SUBSCRIPTION_PLANS_PAYLOAD.subplan.map((subplan, index) => {
  const id = OFFER_IDS[index];
  const monthly = subplan.pricing.find((p) => p.billing_cycle === "month");
  const annual = subplan.pricing.find((p) => p.billing_cycle === "year");

  if (!id || !monthly || !annual) {
    throw new Error("Invalid subscription plan payload configuration");
  }

  return {
    id,
    name: subplan.name,
    frequency: FREQUENCY_BY_ID[id],
    monthlyCents: Math.round(monthly.amount * 100),
    annualCents: Math.round(annual.amount * 100),
    monthlyLabel: formatUsd(monthly.amount),
    annualLabel: formatUsd(annual.amount),
    recommended: subplan.popular,
    blurb: subplan.description,
  };
});

export const ALL_OFFERS: PlanOffer[] = TIERS;

export function findOffer(id: string): PlanOffer | undefined {
  return ALL_OFFERS.find((o) => o.id === id);
}

/** Every tier includes the full feature set. */
export const SHARED_FEATURES = SUBSCRIPTION_PLANS_PAYLOAD.features;

/**
 * Optional paid add-on. NOTE: price below is a PLACEHOLDER — set the real
 * dedicated pricing here.
 */
export const ADDON = {
  id: "voiceprint",
  name: "Custom Brain Booster",
  desc: "Your voice print, plus one-tap sharing to Instagram, LinkedIn & Spotify.",
  monthlyCents: 799,
  annualCents: 7900,
  monthlyLabel: "$7.99",
  annualLabel: "$79",
} as const;

/** Is Polar checkout configured? */
export const POLAR_ENABLED = Boolean(process.env.POLAR_ACCESS_TOKEN);

/**
 * Per-offer Polar product id lookup. Set env vars like
 * POLAR_PRODUCT_STANDARD_MONTH / POLAR_PRODUCT_STANDARD_YEAR.
 */
export function polarProductIdFor(
  offerId: string,
  interval: BillingInterval,
): string | undefined {
  const key = `POLAR_PRODUCT_${offerId.toUpperCase()}_${interval.toUpperCase()}`;
  return process.env[key] || undefined;
}

export const DEEPLINK = {
  scheme: process.env.NEXT_PUBLIC_APP_DEEPLINK_SCHEME ?? "epiminded",
  universalLink:
    process.env.NEXT_PUBLIC_APP_UNIVERSAL_LINK ?? "https://open.epiminded.app",
} as const;

/** Store listings for the per-platform handoff sections. */
export const STORES = {
  android: {
    platform: "Android",
    subtitle: "Get it on Google Play",
    url: "https://play.google.com/store/apps/details?id=ai.epineon.new",
  },
  ios: {
    platform: "iOS",
    subtitle: "Download on the App Store",
    url: "https://apps.apple.com/us/app/epiminded-upskill-network/id6760017792",
  },
} as const;
