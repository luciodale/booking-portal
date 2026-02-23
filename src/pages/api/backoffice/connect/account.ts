import { POSTCreateConnectAccount } from "@/features/broker/connect/api/server-handler/POSTCreateConnectAccount";
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ locals }) => {
  return POSTCreateConnectAccount(locals);
};
