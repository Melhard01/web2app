import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/server";
import { provisionAccount } from "@/lib/provision";

/**
 * Stripe webhook — the *authoritative* provisioning trigger in production.
 * The /success redirect provisions for instant UX, but a redirect can be lost
 * (user closes the tab). This webhook guarantees the account + entitlement get
 * created on `checkout.session.completed`. Provisioning is idempotent by email,
 * so the redirect path and the webhook can both run safely.
 *
 * Configure STRIPE_WEBHOOK_SECRET and point a Stripe webhook at /api/webhook.
 */
export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ skipped: "webhook not configured" }, { status: 200 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const raw = await req.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (err) {
    console.error("[webhook] signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as {
      id: string;
      customer_details?: { email?: string };
      metadata?: Record<string, string>;
    };
    const email = session.customer_details?.email ?? session.metadata?.email;
    if (email) {
      const offerId = session.metadata?.offerId ?? "standard";
      const interval = session.metadata?.interval === "year" ? "year" : "month";
      const addon = session.metadata?.addon === "true";
      await provisionAccount(email, session.id, offerId, interval, addon);
    }
  }

  return NextResponse.json({ received: true });
}
