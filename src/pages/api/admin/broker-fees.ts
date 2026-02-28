import { GETBrokerFees } from "@/features/admin/settings/api/server-handler/GETBrokerFees";
import { PUTBrokerFee } from "@/features/admin/settings/api/server-handler/PUTBrokerFee";
import { DELETEBrokerFee } from "@/features/admin/settings/api/server-handler/DELETEBrokerFee";
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ locals }) => {
  return GETBrokerFees(locals);
};

export const PUT: APIRoute = async ({ request, locals }) => {
  return PUTBrokerFee(request, locals);
};

export const DELETE: APIRoute = async ({ request, locals }) => {
  return DELETEBrokerFee(request, locals);
};
