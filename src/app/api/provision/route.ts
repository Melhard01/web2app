import { NextResponse } from "next/server";
import { provisionAccount } from "@/lib/provision";
import type { BillingInterval } from "@/lib/config";

/**
 * Provision the account + signed entitlement token after a successful payment.
 * Called from Polar webhooks (or dev tooling) with email + offer metadata.
 */
export async function POST(req: Request) {
  let email: string | undefined;
  let orderRef: string | undefined;
  let offerId: string | undefined;
  let interval: BillingInterval = "month";
  let addon = false;

  try {
    const body = await req.json();
    email = body?.email ? String(body.email) : undefined;
    orderRef = body?.orderRef ? String(body.orderRef) : undefined;
    offerId = body?.offerId ? String(body.offerId) : undefined;
    interval = body?.interval === "year" ? "year" : "month";
    addon = Boolean(body?.addon);
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!email || !orderRef || !offerId) {
    return NextResponse.json(
      { error: "email, orderRef and offerId are required" },
      { status: 400 },
    );
  }

  const result = await provisionAccount(email, orderRef, offerId, interval, addon);
  return NextResponse.json(result);
}
