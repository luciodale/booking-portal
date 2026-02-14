/// <reference types="astro/client" />
/// <reference types="@clerk/astro/env" />

interface Env {
  DB?: D1Database;
  R2_IMAGES_BUCKET?: R2Bucket;
  PUBLIC_CLERK_PUBLISHABLE_KEY?: string;
  CLERK_SECRET_KEY?: string;
  CLERK_JWT_KEY?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
}

type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {}
}
