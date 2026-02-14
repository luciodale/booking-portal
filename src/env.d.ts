/// <reference types="astro/client" />
/// <reference types="@clerk/astro/env" />

interface Env {
  DB?: D1Database;
  R2_IMAGES_BUCKET?: R2Bucket;
  CLERK_SECRET_KEY?: string;
  CLERK_JWT_KEY?: string;
  TEST_CLERK_SECRET_KEY?: string;
  TEST_CLERK_JWT_KEY?: string;
  PROD_CLERK_SECRET_KEY?: string;
  PROD_CLERK_JWT_KEY?: string;
  TEST_CLERK_WEBHOOK_SECRET?: string;
  PROD_CLERK_WEBHOOK_SECRET?: string;
  TEST_STRIPE_SECRET_KEY?: string;
  TEST_STRIPE_WEBHOOK_SECRET?: string;
  PROD_STRIPE_SECRET_KEY?: string;
  PROD_STRIPE_WEBHOOK_SECRET?: string;
}

type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {}
}
