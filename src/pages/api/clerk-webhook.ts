import { getDb } from "@/db";
import { users } from "@/db/schema";
import { createEventLogger } from "@/modules/logging/eventLogger";
import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";
import { Webhook } from "svix";

type ClerkEmailAddress = {
  email_address: string;
  id: string;
};

type ClerkUserCreatedData = {
  id: string;
  email_addresses: ClerkEmailAddress[];
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
};

type ClerkUserDeletedData = {
  id: string;
  deleted: boolean;
};

type ClerkWebhookEvent =
  | { type: "user.created" | "user.updated"; data: ClerkUserCreatedData }
  | { type: "user.deleted"; data: ClerkUserDeletedData }
  | { type: string; data: { id?: string } };

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
    await log.error({
      source: "clerk-webhook",
      message: "Webhook signature verification failed",
      metadata: { error: err instanceof Error ? err.message : String(err) },
    });
    return new Response("Invalid signature", { status: 400 });
  }

  const db = getDb(D1Database);

  if (event.type === "user.created") {
    const data = event.data as ClerkUserCreatedData;
    const email = data.email_addresses[0]?.email_address;

    if (!email) {
      await log.error({
        source: "clerk-webhook",
        message: `No email found for Clerk user ${data.id}`,
        metadata: { clerkUserId: data.id },
      });
      return new Response("OK", { status: 200 });
    }

    const nameParts = [data.first_name, data.last_name].filter(Boolean);
    const name = nameParts.length > 0 ? nameParts.join(" ") : null;

    try {
      await db.insert(users).values({
        id: data.id,
        email,
        name,
        avatarUrl: data.image_url,
      });

      await log.info({
        source: "clerk-webhook",
        message: `User created for Clerk user ${data.id}`,
        metadata: { clerkUserId: data.id },
      });

      return new Response("OK", { status: 200 });
    } catch (error) {
      await log.error({
        source: "clerk-webhook",
        message: `Failed to insert user for Clerk user ${data.id}`,
        metadata: {
          clerkUserId: data.id,
          error: error instanceof Error ? error.message : String(error),
        },
      });
      return new Response("Internal error", { status: 500 });
    }
  }

  if (event.type === "user.deleted") {
    // Anonymise in place rather than hard delete. Bookings and reviews carry
    // legal and tax obligations, so the FK target must remain. Strips PII,
    // marks unverified, leaves audit trail intact.
    const data = event.data as ClerkUserDeletedData;
    const clerkUserId = data.id;
    if (!clerkUserId) {
      return new Response("OK", { status: 200 });
    }

    try {
      const anonEmail = `deleted+${clerkUserId}@example.invalid`;
      await db
        .update(users)
        .set({
          email: anonEmail,
          name: null,
          phone: null,
          avatarUrl: null,
          whatsappNumber: null,
          bio: null,
          verified: false,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(users.id, clerkUserId));

      // Bookings are intentionally not auto cancelled. They carry legal and
      // tax obligations and may already have triggered services. Brokers
      // handle in-flight bookings manually via the backoffice.

      await log.info({
        source: "clerk-webhook",
        message: "User anonymised on Clerk deletion",
        metadata: { clerkUserId },
      });

      return new Response("OK", { status: 200 });
    } catch (error) {
      await log.error({
        source: "clerk-webhook",
        message: `Failed to anonymise Clerk user ${clerkUserId}`,
        metadata: {
          clerkUserId,
          error: error instanceof Error ? error.message : String(error),
        },
      });
      return new Response("Internal error", { status: 500 });
    }
  }

  // Unhandled event type. Log at info so we know what Clerk is sending.
  await log.info({
    source: "clerk-webhook",
    message: `Unhandled Clerk event type: ${event.type}`,
    metadata: { eventType: event.type },
  });
  return new Response("OK", { status: 200 });
};
