import { POSTCreateAccountSession } from "@/features/broker/connect/api/server-handler/POSTCreateAccountSession";
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ locals }) => {
  return POSTCreateAccountSession(locals);
};
