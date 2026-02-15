import { getDb } from "@/db";
import { cityTaxDefaults } from "@/db/schema";
import { resolveBrokerContext } from "@/features/broker/auth/resolveBrokerContext";
import {
  jsonError,
  jsonSuccess,
  mapErrorToStatus,
  safeErrorMessage,
} from "@/features/broker/property/api/server-handler/responseHelpers";
import { genUniqueId } from "@/modules/utils/id";
import type { APIRoute } from "astro";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const db = getDb(locals.runtime.env.DB);
    const broker = await resolveBrokerContext(locals, db);

    if (!broker.userId) return jsonError("No user account", 403);

    const url = new URL(request.url);
    const city = url.searchParams.get("city");
    const country = url.searchParams.get("country");

    if (!city || !country) {
      return jsonError("city and country are required", 400);
    }

    const [row] = await db
      .select()
      .from(cityTaxDefaults)
      .where(
        and(
          eq(cityTaxDefaults.userId, broker.userId),
          eq(cityTaxDefaults.city, city),
          eq(cityTaxDefaults.country, country)
        )
      )
      .limit(1);

    return jsonSuccess(row ?? null);
  } catch (error) {
    return jsonError(
      safeErrorMessage(error, "Failed to fetch city tax"),
      mapErrorToStatus(error)
    );
  }
};

const upsertSchema = z.object({
  city: z.string().min(1),
  country: z.string().min(1),
  amount: z.number().int().nonnegative(),
  maxNights: z.number().int().positive().nullable(),
});

export const PUT: APIRoute = async ({ request, locals }) => {
  try {
    const db = getDb(locals.runtime.env.DB);
    const broker = await resolveBrokerContext(locals, db);

    if (!broker.userId) return jsonError("No user account", 403);

    const parsed = upsertSchema.safeParse(await request.json());
    if (!parsed.success) {
      return jsonError("Invalid request", 400, parsed.error.issues);
    }

    const { city, country, amount, maxNights } = parsed.data;

    const [existing] = await db
      .select({ id: cityTaxDefaults.id })
      .from(cityTaxDefaults)
      .where(
        and(
          eq(cityTaxDefaults.userId, broker.userId),
          eq(cityTaxDefaults.city, city),
          eq(cityTaxDefaults.country, country)
        )
      )
      .limit(1);

    if (existing) {
      await db
        .update(cityTaxDefaults)
        .set({ amount, maxNights, updatedAt: new Date().toISOString() })
        .where(eq(cityTaxDefaults.id, existing.id));

      const [updated] = await db
        .select()
        .from(cityTaxDefaults)
        .where(eq(cityTaxDefaults.id, existing.id))
        .limit(1);

      return jsonSuccess(updated);
    }

    const newId = genUniqueId("ctx");
    await db.insert(cityTaxDefaults).values({
      id: newId,
      userId: broker.userId,
      city,
      country,
      amount,
      maxNights,
    });

    const [created] = await db
      .select()
      .from(cityTaxDefaults)
      .where(eq(cityTaxDefaults.id, newId))
      .limit(1);

    return jsonSuccess(created, 201);
  } catch (error) {
    return jsonError(
      safeErrorMessage(error, "Failed to upsert city tax"),
      mapErrorToStatus(error)
    );
  }
};
