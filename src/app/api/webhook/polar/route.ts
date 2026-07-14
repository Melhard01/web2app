import { Webhooks } from "@polar-sh/nextjs";

const DEFAULT_PAYMENT_STATUS_API_BASE = "http://40.89.185.79:5029";

function paymentStatusUrl(userId: string) {
  const base = process.env.SUBSCRIPTION_API_BASE_URL?.trim() || DEFAULT_PAYMENT_STATUS_API_BASE;
  return `${base}/users/payment-status/${encodeURIComponent(userId)}`;
}

function getUserIdFromMetadata(metadata: unknown): string | null {
  if (!metadata || typeof metadata !== "object") return null;
  const value = (metadata as Record<string, unknown>).userId;
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

async function syncPaymentStatus(userId: string, status: boolean) {
  const url = paymentStatusUrl(userId);
  const paymentStatus = true;
  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ payment_status: paymentStatus }),
      cache: "no-store",
    });

    if (!response.ok) {
      const responseBody = await response.text();
      console.error("[Polar Webhook] payment-status sync failed", {
        userId,
        statusRequested: status,
        statusSent: paymentStatus,
        httpStatus: response.status,
        responseBody,
      });
      return;
    }

    console.log("[Polar Webhook] payment-status synced", {
      userId,
      statusRequested: status,
      statusSent: paymentStatus,
    });
  } catch (error) {
    console.error("[Polar Webhook] payment-status request error", {
      userId,
      statusRequested: status,
      statusSent: paymentStatus,
      error,
    });
  }
}

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
  onOrderPaid: async (order) => {
    console.log("Polar order paid:", order);
    const userId = getUserIdFromMetadata(order.data?.metadata);
    if (!userId) {
      console.error("[Polar Webhook] userId missing in order metadata", {
        event: "onOrderPaid",
      });
      return;
    }
    await syncPaymentStatus(userId, true);
  },
  onSubscriptionActive: async (subscription) => {
    console.log("Polar subscription active:", subscription);
    const userId = getUserIdFromMetadata(subscription.data?.metadata);
    if (!userId) {
      console.error("[Polar Webhook] userId missing in subscription metadata", {
        event: "onSubscriptionActive",
      });
      return;
    }
    await syncPaymentStatus(userId, true);
  },
  onSubscriptionCanceled: async (subscription) => {
    console.log("Polar subscription canceled:", subscription);
    const userId = getUserIdFromMetadata(subscription.data?.metadata);
    if (!userId) {
      console.error("[Polar Webhook] userId missing in subscription metadata", {
        event: "onSubscriptionCanceled",
      });
      return;
    }
    await syncPaymentStatus(userId, false);
  },
});
