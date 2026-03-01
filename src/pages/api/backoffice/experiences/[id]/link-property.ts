import type { APIRoute } from "astro";

export const prerender = false;

const notFound: APIRoute = () =>
  new Response(JSON.stringify({ error: "Not found" }), { status: 404 });

export const POST = notFound;
