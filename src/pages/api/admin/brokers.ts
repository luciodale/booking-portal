import { GETBrokers } from "@/features/admin/settings/api/server-handler/GETBrokers";
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ locals }) => {
  return GETBrokers(locals);
};
