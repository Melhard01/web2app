import Stripe from "stripe";

/**
 * Lazily-constructed Stripe client. Returns null when no secret key is set, in
 * which case the funnel runs in mock mode (no real charges). Keeping this lazy
 * avoids throwing at import time during local/mock runs.
 */
let cached: Stripe | null = null;

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!cached) {
    // Pin via dashboard; the SDK default keeps types in sync with the version.
    cached = new Stripe(key);
  }
  return cached;
}
