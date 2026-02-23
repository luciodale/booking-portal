import { GETConnectStatus } from "@/features/broker/connect/api/server-handler/GETConnectStatus";
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ locals }) => {
  return GETConnectStatus(locals);
};
