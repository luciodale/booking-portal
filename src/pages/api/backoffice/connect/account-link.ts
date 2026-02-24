import { POSTCreateAccountLink } from "@/features/broker/connect/api/server-handler/POSTCreateAccountLink";
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ locals, url }) => {
  return POSTCreateAccountLink(locals, { origin: url.origin });
};
