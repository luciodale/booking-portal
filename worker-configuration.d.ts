/// <reference types="@cloudflare/workers-types" />

type RateLimiter = {
  limit(input: { key: string }): Promise<{ success: boolean }>;
};

interface Env {
  DB: D1Database;
  R2_IMAGES_BUCKET: R2Bucket;
  RL_PUBLIC?: RateLimiter;
  RL_SMOOBU?: RateLimiter;
  RL_CHECKOUT?: RateLimiter;
  RL_UPLOAD?: RateLimiter;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  CLERK_SECRET_KEY?: string;
  CLERK_JWT_KEY?: string;
  CLERK_WEBHOOK_SECRET?: string;
  PUBLIC_CLERK_PUBLISHABLE_KEY?: string;
  PUBLIC_R2_BASE_URL?: string;
}
