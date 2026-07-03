import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/server";
import { provisionAccount } from "@/lib/provision";
import type { BillingInterval } from "@/lib/config";

/**
 * Provision the account + signed entitlement token after a successful payment.
 *
 *  - Stripe mode: pass { sessionId }. We retrieve the Checkout Session and only
 *    provision when payment_status === "paid". Email + offer come from the
 *    session metadata, so the entitlement can't be bound to a forged address.
 *  - Mock mode: pass { email, orderRef, offerId, interval } from /api/checkout.
 */
export async function POST(req: Request) {
  let sessionId: string | undefined;
  let email: string | undefined;
  let orderRef: string | undefined;
  let offerId: string | undefined;
  let interval: BillingInterval = "month";
  let addon = false;

  try {
    const body = await req.json();
    sessionId = body?.sessionId ? String(body.sessionId) : undefined;
    email = body?.email ? String(body.email) : undefined;
    orderRef = body?.orderRef ? String(body.orderRef) : undefined;
    offerId = body?.offerId ? String(body.offerId) : undefined;
    interval = body?.interval === "year" ? "year" : "month";
    addon = Boolean(body?.addon);
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const stripe = getStripe();

  // ---- Stripe mode ---------------------------------------------------------
  if (stripe && sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status !== "paid") {
        return NextResponse.json({ error: "Payment not completed" }, { status: 402 });
      }
      const paidEmail =
        session.customer_details?.email ?? (session.metadata?.email as string | undefined);
      if (!paidEmail) {
        return NextResponse.json({ error: "No email on session" }, { status: 422 });
      }
      const sOfferId = (session.metadata?.offerId as string) ?? "standard";
      const sInterval: BillingInterval =
        session.metadata?.interval === "year" ? "year" : "month";
      const sAddon = session.metadata?.addon === "true";
      const result = await provisionAccount(paidEmail, session.id, sOfferId, sInterval, sAddon);
      return NextResponse.json(result);
    } catch (err) {
      console.error("[provision] stripe error", err);
      return NextResponse.json({ error: "Could not verify payment" }, { status: 502 });
    }
  }

  // ---- Mock mode -----------------------------------------------------------
  if (!email || !orderRef || !offerId) {
    return NextResponse.json(
      { error: "email, orderRef and offerId are required in mock mode" },
      { status: 400 },
    );
  }
  const result = await provisionAccount(email, orderRef, offerId, interval, addon);
  return NextResponse.json(result);
}
