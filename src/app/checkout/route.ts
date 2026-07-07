import { Checkout } from "@polar-sh/nextjs";
import { SITE_URL } from "@/lib/config";

if (!process.env.POLAR_ACCESS_TOKEN) {
  throw new Error("Missing POLAR_ACCESS_TOKEN");
}

export const GET = Checkout({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  successUrl:
    process.env.SUCCESS_URL ||
    `${SITE_URL}/success?checkout_id={CHECKOUT_ID}`,
  returnUrl: `${SITE_URL}/paywall`,
  server: "production",
  theme: "light",
});
