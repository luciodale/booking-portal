import { getDb } from "@/db";
import { platformSettings } from "@/db/schema";
import { requireAdmin } from "@/modules/auth/auth";
import {
  jsonError,
  jsonSuccess,
  mapErrorToStatus,
} from "@/features/broker/property/api/server-handler/responseHelpers";
import type { APIContext } from "astro";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";

const putSettingSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
});

const validators: Record<string, z.ZodType<string>> = {};

export async function PUTSettings(
  request: Request,
  locals: APIContext["locals"]
) {
  try {
    requireAdmin(locals);

    const D1Database = locals.runtime?.env?.DB;
    if (!D1Database) return jsonError("Database not available", 503);

    const body = putSettingSchema.safeParse(await request.json());
    if (!body.success) {
      return jsonError("Invalid request", 400, body.error.issues);
    }

    const { key, value } = body.data;

    const keyValidator = validators[key];
    if (keyValidator) {
      const result = keyValidator.safeParse(value);
      if (!result.success) {
        return jsonError(result.error.issues[0]?.message ?? "Invalid value", 400);
      }
    }

    const db = getDb(D1Database);

    const [existing] = await db
      .select({ id: platformSettings.id })
      .from(platformSettings)
      .where(eq(platformSettings.key, key))
      .limit(1);

    if (existing) {
      await db
        .update(platformSettings)
        .set({ value, updatedAt: new Date().toISOString() })
        .where(eq(platformSettings.id, existing.id));
    } else {
      await db.insert(platformSettings).values({
        id: nanoid(),
        key,
        value,
        updatedAt: new Date().toISOString(),
      });
    }

    return jsonSuccess({ key, value });
  } catch (error) {
    console.error("[PUTSettings]", error);
    return jsonError("Internal error", mapErrorToStatus(error));
  }
}
