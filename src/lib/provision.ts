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
}

export async function provisionAccount(
  emailRaw: string,
  orderRef: string,
  offerId: string,
  interval: BillingInterval,
  addon: boolean,
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

  return {
    accountId: account.accountId,
    email: account.email,
    plan: account.plan,
    tier: account.tier,
    interval: account.interval,
    addon: account.addon,
    token,
    handoff: buildHandoffLinks(token),
  };
}
