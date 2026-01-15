/// <reference types="@cloudflare/workers-types" />

interface Env {
  DB: D1Database;
  R2_IMAGES_BUCKET: R2Bucket;
}
