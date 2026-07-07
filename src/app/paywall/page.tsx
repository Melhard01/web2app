import { Suspense } from "react";
import { PricingPlans, type ProductIdMap } from "@/components/paywall/PricingPlans";
import { BrandHeader } from "@/components/ui/BrandHeader";
import { polarProductIdFor, TIERS, type BillingInterval } from "@/lib/config";
import { PaywallCanceledBanner } from "./PaywallCanceledBanner";

function buildProductIdMap(): ProductIdMap {
  const intervals: BillingInterval[] = ["month", "year"];
  const map: ProductIdMap = {};
  for (const tier of TIERS) {
    for (const interval of intervals) {
      map[`${tier.id}:${interval}`] = polarProductIdFor(tier.id, interval);
    }
  }
  return map;
}

export default function PaywallPage() {
  const productIds = buildProductIdMap();

  return (
    <div className="flex min-h-screen flex-col">
      <BrandHeader step={1} />
      <Suspense fallback={null}>
        <PaywallCanceledBanner />
      </Suspense>
      <main className="mx-auto w-full max-w-[1240px] px-8 pb-20 pt-12 sm:px-12 sm:pt-16 lg:px-20">
        <div className="mb-6 flex justify-center">
          <span className="inline-block rounded-full border border-gold/40 px-5 py-2 font-mono text-[12px] uppercase tracking-eyebrow text-gold">
            Step 2 · Choose your plan
          </span>
        </div>
        <h1 className="m-0 mb-6 font-display text-[clamp(30px,5vw,46px)] font-semibold leading-[1.08] tracking-[-0.01em] text-paper">
          Your matched Peers and Network waiting for you
        </h1>
        <p className="m-0 mb-12 max-w-[34em] text-[17px] leading-[1.6] text-ash">
          A private peer network that helps you stay ahead of what is coming — a daily
          thinking ritual paired with a cohort of matched peers no tool can give you.
          Every tier ships the full experience; pick the cadence that fits you.
        </p>

        <PricingPlans productIds={productIds} />
      </main>
    </div>
  );
}
