import { POSTCreateConnectAccount } from "@/features/broker/connect/api/server-handler/POSTCreateConnectAccount";
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ locals, url }) => {
  const replace = url.searchParams.get("replace") === "true";
  return POSTCreateConnectAccount(locals, { replace });
};
