import { getDb } from "@/db";
import { fetchAllCities } from "@/features/public/browse/queries";
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ locals }) => {
  const db = getDb(locals.runtime.env.DB);
  const cities = await fetchAllCities(db);

  return new Response(JSON.stringify(cities), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=300",
    },
  });
};
