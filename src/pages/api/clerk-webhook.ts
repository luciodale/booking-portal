import { getDb } from "@/db";
import { users } from "@/db/schema";
import { createEventLogger } from "@/modules/logging/eventLogger";
import { genUniqueId } from "@/modules/utils/id";
import type { APIRoute } from "astro";
import { Webhook } from "svix";

interface ClerkEmailAddress {
  email_address: string;
  id: string;
}

interface ClerkUserCreatedData {
  id: string;
  email_addresses: ClerkEmailAddress[];
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
}

interface ClerkWebhookEvent {
  type: string;
  data: ClerkUserCreatedData;
}

export const POST: APIRoute = async ({ request, locals }) => {
  const D1Database = locals.runtime?.env?.DB;
  const webhookSecret = locals.runtime?.env?.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret || !D1Database) {
    return new Response("Server misconfigured", { status: 503 });
  }

  const log = createEventLogger(D1Database);

  const svixId = request.headers.get("svix-id");
  const svixTimestamp = request.headers.get("svix-timestamp");
  const svixSignature = request.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const body = await request.text();

  let event: ClerkWebhookEvent;
  try {
    const wh = new Webhook(webhookSecret);
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkWebhookEvent;
  } catch (err) {
    console.error("Clerk webhook signature verification failed:", err);
    log.error({
      source: "clerk-webhook",
      message: "Webhook signature verification failed",
      metadata: { error: err instanceof Error ? err.message : String(err) },
    });
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type !== "user.created") {
    return new Response("OK", { status: 200 });
  }

  const { data } = event;
  const email = data.email_addresses[0]?.email_address;

  if (!email) {
    log.error({
      source: "clerk-webhook",
      message: `No email found for Clerk user ${data.id}`,
      metadata: { clerkUserId: data.id },
    });
    return new Response("OK", { status: 200 });
  }

  const nameParts = [data.first_name, data.last_name].filter(Boolean);
  const name = nameParts.length > 0 ? nameParts.join(" ") : null;

  const db = getDb(D1Database);

  try {
    await db.insert(users).values({
      id: genUniqueId("user"),
      clerkUserId: data.id,
      email,
      name,
      avatarUrl: data.image_url,
    });

    log.info({
      source: "clerk-webhook",
      message: `User created for Clerk user ${data.id}`,
      metadata: { clerkUserId: data.id, email },
    });

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Failed to insert user from Clerk webhook:", error);
    log.error({
      source: "clerk-webhook",
      message: `Failed to insert user for Clerk user ${data.id}`,
      metadata: {
        clerkUserId: data.id,
        error: error instanceof Error ? error.message : String(error),
      },
    });
    return new Response("Internal error", { status: 500 });
  }
};
