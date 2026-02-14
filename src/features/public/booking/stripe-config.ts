import { USE_TEST_MODE } from "@/config";

export function getStripeKeys(env: Env): {
  secretKey: string | undefined;
  webhookSecret: string | undefined;
} {
  if (USE_TEST_MODE) {
    return {
      secretKey: env.TEST_STRIPE_SECRET_KEY,
      webhookSecret: env.TEST_STRIPE_WEBHOOK_SECRET,
    };
  }
  return {
    secretKey: env.PROD_STRIPE_SECRET_KEY,
    webhookSecret: env.PROD_STRIPE_WEBHOOK_SECRET,
  };
}
