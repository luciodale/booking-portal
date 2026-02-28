import type { APIRoute } from "astro";
import { GETBrokers } from "@/features/admin/settings/api/server-handler/GETBrokers";

export const GET: APIRoute = async ({ locals }) => {
  return GETBrokers(locals);
};
