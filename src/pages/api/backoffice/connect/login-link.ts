import { POSTCreateLoginLink } from "@/features/broker/connect/api/server-handler/POSTCreateLoginLink";
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ locals }) => {
  return POSTCreateLoginLink(locals);
};
