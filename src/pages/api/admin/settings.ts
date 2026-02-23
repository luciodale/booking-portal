import { GETSettings } from "@/features/admin/settings/api/server-handler/GETSettings";
import { PUTSettings } from "@/features/admin/settings/api/server-handler/PUTSettings";
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ locals }) => {
  return GETSettings(locals);
};

export const PUT: APIRoute = async ({ request, locals }) => {
  return PUTSettings(request, locals);
};
