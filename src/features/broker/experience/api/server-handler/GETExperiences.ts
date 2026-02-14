import { getDb } from "@/db";
import { experienceImages, experiences } from "@/db/schema";
import { requireAuth } from "@/modules/auth/auth";
import { generateImageUrl } from "@/modules/r2/r2-helpers";
import type { ExperienceListResponse } from "@/schemas/api";
import type { APIRoute } from "astro";
import { and, desc, eq, like, or } from "drizzle-orm";
import { jsonError, jsonSuccess } from "./responseHelpers";

export const GET: APIRoute = async ({ locals, url }) => {
  try {
    requireAuth(locals);

    const D1Database = locals.runtime?.env?.DB;
    if (!D1Database) {
      return jsonError("Database not available", 503);
    }

    const db = getDb(D1Database);

    const category = url.searchParams.get("category");
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search");

    let query = db.select().from(experiences).$dynamic();

    const conditions = [];
    if (category) {
      conditions.push(eq(experiences.category, category));
    }
    if (status) {
      conditions.push(
        eq(experiences.status, status as "draft" | "published" | "archived")
      );
    }
    if (search) {
      conditions.push(
        or(
          like(experiences.title, `%${search}%`),
          like(experiences.location, `%${search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const allExperiences = await query.orderBy(desc(experiences.createdAt));

    const experiencesWithImages = await Promise.all(
      allExperiences.map(async (exp) => {
        const [primaryImage] = await db
          .select()
          .from(experienceImages)
          .where(
            and(
              eq(experienceImages.experienceId, exp.id),
              eq(experienceImages.isPrimary, true)
            )
          )
          .limit(1);

        return {
          ...exp,
          primaryImageUrl: primaryImage
            ? generateImageUrl(primaryImage.r2Key)
            : undefined,
        };
      })
    );

    const response: ExperienceListResponse = {
      experiences: experiencesWithImages,
      total: allExperiences.length,
    };

    return jsonSuccess(response);
  } catch (error) {
    console.error("Error listing experiences:", error);
    return jsonError(
      error instanceof Error ? error.message : "Failed to list experiences"
    );
  }
};
