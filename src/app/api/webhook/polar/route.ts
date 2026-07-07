import { Webhooks } from "@polar-sh/nextjs";

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
  onOrderPaid: async (order) => {
    console.log("Polar order paid:", order);
    // TODO: update user plan in database
  },
  onSubscriptionActive: async (subscription) => {
    console.log("Polar subscription active:", subscription);
    // TODO: mark subscription active in database
  },
  onSubscriptionCanceled: async (subscription) => {
    console.log("Polar subscription canceled:", subscription);
    // TODO: downgrade user in database
  },
});
