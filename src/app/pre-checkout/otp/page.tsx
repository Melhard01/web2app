import { Suspense } from "react";
import { OTPPageClient } from "./OTPPageClient";

export default function OtpVerificationPage() {
  return (
    <Suspense fallback={null}>
      <OTPPageClient />
    </Suspense>
  );
}
