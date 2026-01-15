/// <reference types="astro/client" />

interface Env {
  DB?: D1Database;
  R2_IMAGES_BUCKET?: R2Bucket;
}

type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {}
}
