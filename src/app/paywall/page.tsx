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
      <main className="mx-auto w-full max-w-[680px] px-[22px] pb-16">
        <p className="kicker mb-[18px]">Step 2 · Choose your plan</p>
        <h1 className="m-0 mb-[18px] font-display text-[clamp(30px,5vw,46px)] font-semibold leading-[1.08] tracking-[-0.01em] text-paper">
          Your matched Peers and Network waiting for you
        </h1>
        <p className="m-0 mb-9 max-w-[34em] text-[17px] leading-[1.6] text-ash">
          A private peer network that helps you stay ahead of what is coming — a daily
          thinking ritual paired with a cohort of matched peers no tool can give you.
          Every tier ships the full experience; pick the cadence that fits you.
        </p>

        <PricingPlans productIds={productIds} />
      </main>
    </div>
  );
}
