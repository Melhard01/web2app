import {
  SHARED_FEATURES,
  TIERS,
  type PlanOffer,
  mapWebPlansPayload,
  type WebPlansApiResponse,
} from "@/lib/config";

const DEFAULT_PLANS_API_BASE = "http://40.89.185.79:5029";

export type ResolvedWebPlans = {
  tiers: PlanOffer[];
  features: string[];
  source: "api" | "fallback";
};

function getPlansWebUrl() {
  const explicit = process.env.PLANS_WEB_URL?.trim();
  if (explicit) return explicit;
  const base = process.env.SUBSCRIPTION_API_BASE_URL?.trim() || DEFAULT_PLANS_API_BASE;
  return `${base}/plans/web`;
}

/**
 * Fetch web plans from the subscription API. Falls back to static config on
 * any failure so the paywall never goes blank.
 */
export async function resolveWebPlans(): Promise<ResolvedWebPlans> {
  try {
    const response = await fetch(getPlansWebUrl(), {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("[Plans] Upstream request failed", { status: response.status });
      return { tiers: TIERS, features: [...SHARED_FEATURES], source: "fallback" };
    }

    const payload = (await response.json()) as WebPlansApiResponse;
    const mapped = mapWebPlansPayload(payload);
    if (!mapped) {
      console.error("[Plans] Upstream payload could not be mapped");
      return { tiers: TIERS, features: [...SHARED_FEATURES], source: "fallback" };
    }

    return { tiers: mapped.tiers, features: [...SHARED_FEATURES], source: "api" };
  } catch (error) {
    console.error("[Plans] Upstream request error", error);
    return { tiers: TIERS, features: [...SHARED_FEATURES], source: "fallback" };
  }
}
