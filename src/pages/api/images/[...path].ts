/**
 * Serve R2 images - proxies images from R2 bucket
 * Route: /api/images/properties/assetId/filename.webp
 */

import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ params, locals }) => {
  const path = params.path;

  if (!path) {
    return new Response("Not found", { status: 404 });
  }

  const bucket = locals.runtime.env.R2_IMAGES_BUCKET;
  const object = await bucket.get(path);

  if (!object) {
    return new Response("Image not found", { status: 404 });
  }

  const headers = new Headers();
  headers.set("Content-Type", object.httpMetadata?.contentType || "image/webp");
  headers.set("Cache-Control", "public, max-age=31536000");

  return new Response(object.body, { headers });
};
