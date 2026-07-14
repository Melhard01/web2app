import { nanoid } from "nanoid";
import { signEntitlement } from "@/lib/entitlement/token";
import { buildHandoffLinks, type HandoffLinks } from "@/lib/entitlement/handoff";
import { findOffer, PLAN_NAME, type BillingInterval } from "@/lib/config";

/**
 * Provisioning = "create account + signed entitlement" box in the flow.
 *
 * MOCK: accounts live in an in-memory Map keyed by email, so re-provisioning the
 * same email is idempotent within a server process. Swap `accounts` for a real
 * DB (and the token store for a revocable single-use record) to go live.
 */

interface Account {
  accountId: string;
  email: string;
  plan: string;
  tier: string;
  interval: BillingInterval;
  addon: boolean;
  createdAt: number;
}

const accounts = new Map<string, Account>();
const SUBSCRIPTION_PLAN_ID = "6a550f2df323ab2ee82e5210";
const DEFAULT_SUBSCRIPTION_API_BASE = "http://40.89.185.79:5029";

export interface ProvisionResult {
  accountId: string;
  email: string;
  plan: string;
  tier: string;
  interval: BillingInterval;
  addon: boolean;
  /** Signed entitlement token carried across all handoff rails. */
  token: string;
  handoff: HandoffLinks;
  subscriptionSync?: {
    status: "success" | "skipped" | "failed";
    message?: string;
  };
}

function getSubscriptionUrl(userId: string) {
  const base = process.env.SUBSCRIPTION_API_BASE_URL?.trim() || DEFAULT_SUBSCRIPTION_API_BASE;
  return `${base}/users/${encodeURIComponent(userId)}/subscription`;
}

function getPaymentStatusUrl(userId: string) {
  const base = process.env.SUBSCRIPTION_API_BASE_URL?.trim() || DEFAULT_SUBSCRIPTION_API_BASE;
  return `${base}/users/payment-status/${encodeURIComponent(userId)}`;
}

function toSubplanName(offerId: string, fallbackName: string) {
  switch (offerId.trim().toLowerCase()) {
    case "lite":
      return "LITE";
    case "standard":
      return "Standard";
    case "pro":
      return "PRO";
    default:
      return fallbackName;
  }
}

function toBillingCycle(interval: BillingInterval) {
  return interval === "year" ? "year" : "month";
}

export async function provisionAccount(
  emailRaw: string,
  orderRef: string,
  offerId: string,
  interval: BillingInterval,
  addon: boolean,
  userId?: string,
): Promise<ProvisionResult> {
  const email = emailRaw.trim().toLowerCase();
  const offer = findOffer(offerId);
  const tier = offer?.name ?? "Standard";

  let account = accounts.get(email);
  if (!account) {
    account = {
      accountId: `acct_${nanoid(16)}`,
      email,
      plan: PLAN_NAME,
      tier,
      interval,
      addon,
      createdAt: Date.now(),
    };
    accounts.set(email, account);
  } else {
    // Re-provisioning (e.g. webhook after redirect): update the active plan.
    account.tier = tier;
    account.interval = interval;
    account.addon = addon;
  }

  const token = await signEntitlement({
    accountId: account.accountId,
    email: account.email,
    plan: account.plan,
    tier: account.tier,
    interval: account.interval,
    addon: account.addon,
    source: "web",
    jti: `ent_${orderRef}_${nanoid(8)}`,
  });

  let subscriptionSync: ProvisionResult["subscriptionSync"] = {
    status: "skipped",
    message: "User ID not available for subscription sync.",
  };

  if (userId?.trim()) {
    const url = getSubscriptionUrl(userId.trim());
    const requestBody = {
      subscriptions: [
        {
          plan_id: SUBSCRIPTION_PLAN_ID,
          subplan_name: toSubplanName(offerId, tier),
          billing_cycle: toBillingCycle(interval),
        },
      ],
    };

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    try {
      const response = await fetch(url, {
        method: "PUT",
        headers,
        body: JSON.stringify(requestBody),
        cache: "no-store",
      });
      if (!response.ok) {
        const responseBody = await response.text();
        console.error("[Subscription Sync] Request failed", {
          status: response.status,
          userId: userId.trim(),
          responseBody,
        });
        subscriptionSync = {
          status: "failed",
          message: "Subscription sync failed, but checkout completed successfully.",
        };
      } else {
        const paymentStatusUrl = getPaymentStatusUrl(userId.trim());
        try {
          const paymentStatusResponse = await fetch(paymentStatusUrl, {
            method: "PUT",
            headers,
            body: JSON.stringify({ payment_status: true }),
            cache: "no-store",
          });
          if (!paymentStatusResponse.ok) {
            const paymentStatusBody = await paymentStatusResponse.text();
            console.error("[Payment Status Sync] Request failed", {
              status: paymentStatusResponse.status,
              userId: userId.trim(),
              responseBody: paymentStatusBody,
            });
          }
        } catch (error) {
          console.error("[Payment Status Sync] Request error", {
            userId: userId.trim(),
            error,
          });
        }
        subscriptionSync = { status: "success" };
      }
    } catch (error) {
      console.error("[Subscription Sync] Request error", {
        userId: userId.trim(),
        error,
      });
      subscriptionSync = {
        status: "failed",
        message: "Subscription sync failed, but checkout completed successfully.",
      };
    }
  }

  return {
    accountId: account.accountId,
    email: account.email,
    plan: account.plan,
    tier: account.tier,
    interval: account.interval,
    addon: account.addon,
    token,
    handoff: buildHandoffLinks(token),
    subscriptionSync,
  };
}
