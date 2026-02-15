import { getDb } from "@/db";
import { assets, images } from "@/db/schema";
import { resolveBrokerContext } from "@/features/broker/auth/resolveBrokerContext";
import { generateImageUrl } from "@/modules/r2/r2-helpers";
import type { PropertyListResponse } from "@/schemas/api";
import type { APIRoute } from "astro";
import { and, desc, eq, like, or } from "drizzle-orm";
import { jsonError, jsonSuccess, mapErrorToStatus } from "./responseHelpers";

export const GET: APIRoute = async ({ locals, url }) => {
  try {
    const D1Database = locals.runtime?.env?.DB;
    if (!D1Database) {
      return jsonError("Database not available", 503);
    }

    const db = getDb(D1Database);
    const ctx = await resolveBrokerContext(locals, db);

    const tier = url.searchParams.get("tier");
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search");

    let query = db.select().from(assets).$dynamic();

    const conditions = [];

    if (!ctx.isAdmin) {
      if (!ctx.userId) throw new Error("Forbidden");
      conditions.push(eq(assets.userId, ctx.userId));
    }

    if (tier) {
      conditions.push(eq(assets.tier, tier as "elite" | "standard"));
    }
    if (status) {
      conditions.push(
        eq(assets.status, status as "draft" | "published" | "archived")
      );
    }
    if (search) {
      conditions.push(
        or(
          like(assets.title, `%${search}%`),
          like(assets.location, `%${search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const properties = await query.orderBy(desc(assets.createdAt));

    const propertiesWithImages = await Promise.all(
      properties.map(async (property) => {
        const primaryImage = await db
          .select()
          .from(images)
          .where(
            and(eq(images.assetId, property.id), eq(images.isPrimary, true))
          )
          .limit(1);

        return {
          ...property,
          primaryImageUrl: primaryImage[0]
            ? generateImageUrl(primaryImage[0].r2Key)
            : undefined,
        };
      })
    );

    const response: PropertyListResponse = {
      properties: propertiesWithImages,
      total: properties.length,
    };

    return jsonSuccess(response);
  } catch (error) {
    console.error("Error listing properties:", error);
    return jsonError(
      error instanceof Error ? error.message : "Failed to list properties",
      mapErrorToStatus(error)
    );
  }
};
