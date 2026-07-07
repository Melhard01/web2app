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
export const PLAN_NAME = "EpiMinded Membership";

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

/**
 * Three tiers — they differ ONLY by booster frequency (every tier ships the
 * full feature set, see SHARED_FEATURES). Prices kept from the prior deck;
 * confirm if they should change now that Community is removed.
 */
export const TIERS: PlanOffer[] = [
  {
    id: "lite",
    name: "Lite",
    frequency: "3 boosters / week",
    monthlyCents: 1999,
    annualCents: 19900,
    monthlyLabel: "$19.99",
    annualLabel: "$199",
    blurb: "A steady three-a-week cadence to get started.",
  },
  {
    id: "standard",
    name: "Standard",
    frequency: "5 boosters / week",
    monthlyCents: 2999,
    annualCents: 29900,
    monthlyLabel: "$29.99",
    annualLabel: "$299",
    recommended: true,
    blurb: "The habit-forming weekday rhythm — five a week.",
  },
  {
    id: "pro",
    name: "Pro",
    frequency: "Daily — 7 / week",
    monthlyCents: 3999,
    annualCents: 39900,
    monthlyLabel: "$39.99",
    annualLabel: "$399",
    blurb: "A daily ritual — the high-engagement tier.",
  },
];

export const ALL_OFFERS: PlanOffer[] = TIERS;

export function findOffer(id: string): PlanOffer | undefined {
  return ALL_OFFERS.find((o) => o.id === id);
}

/** Every tier includes the full feature set. */
export const SHARED_FEATURES = [
  "Community access",
  "Community Brain Boosters",
  "Personalized Upskilling Brain Boosters (Text · Audio · Podcast)",
  "360 thinking",
  "Nearby Peers Recommendation",
  "Daily Groups",
  "1-1 Peer discussions (Chat · Video calls)",
  "Quiz tests",
  "Weekly progress",
] as const;

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
