import { Suspense } from "react";
import { PreCheckoutPageClient } from "./PreCheckoutPageClient";

export default function PreCheckoutPage() {
  return (
    <Suspense fallback={null}>
      <PreCheckoutPageClient />
    </Suspense>
  );
}
