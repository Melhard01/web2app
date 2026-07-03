import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { getStripe } from "@/lib/stripe/server";
import { findOffer, stripePriceIdFor, SITE_URL, type BillingInterval } from "@/lib/config";

/**
 * Starts payment for the selected offer. Two modes:
 *  - Stripe configured → create a Checkout Session, return its hosted URL.
 *  - Mock (no key)     → return an orderRef; the client provisions directly,
 *                        simulating an instant successful payment.
 */
export async function POST(req: Request) {
  let email = "";
  let offerId = "";
  let interval: BillingInterval = "month";
  let addon = false;
  try {
    const body = await req.json();
    email = String(body?.email ?? "").trim();
    offerId = String(body?.offerId ?? "");
    interval = body?.interval === "year" ? "year" : "month";
    addon = Boolean(body?.addon);
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!isEmail(email)) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }
  const offer = findOffer(offerId);
  if (!offer) {
    return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
  }

  const stripe = getStripe();

  // ---- Mock mode -----------------------------------------------------------
  if (!stripe) {
    return NextResponse.json({
      mock: true,
      orderRef: `mock_${nanoid(16)}`,
      email,
      offerId,
      interval,
      addon,
    });
  }

  // ---- Stripe mode ---------------------------------------------------------
  const priceId = stripePriceIdFor(offerId, interval);
  if (!priceId) {
    return NextResponse.json(
      { error: `No Stripe price configured for ${offerId}/${interval}` },
      { status: 500 },
    );
  }

  try {
    const lineItems: { price: string; quantity: number }[] = [
      { price: priceId, quantity: 1 },
    ];
    const addonPriceId = addon ? process.env.STRIPE_PRICE_ADDON || undefined : undefined;
    if (addon && addonPriceId) lineItems.push({ price: addonPriceId, quantity: 1 });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: email,
      line_items: lineItems,
      metadata: { email, offerId, interval, addon: String(addon) },
      success_url: `${SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/paywall?canceled=1`,
      allow_promotion_codes: true,
    });
    return NextResponse.json({ mock: false, url: session.url });
  } catch (err) {
    console.error("[checkout] stripe error", err);
    return NextResponse.json({ error: "Could not start checkout" }, { status: 502 });
  }
}

function isEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}
