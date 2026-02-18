import { getDb } from "@/db";
import { assets, images } from "@/db/schema";
import { generateImageUrl } from "@/modules/r2/r2-helpers";
import { formatLocation } from "@/utils/formatLocation";
import type { APIRoute } from "astro";
import { safeErrorMessage } from "@/features/broker/property/api/server-handler/responseHelpers";
import { getRequestLocale } from "@/i18n/request-locale";
import { t } from "@/i18n/t";
import { asc, eq } from "drizzle-orm";

export const GET: APIRoute = async ({ params, request, locals }) => {
  const locale = getRequestLocale(request);
  try {
    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ error: t(locale, "error.missingPropertyId") }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const D1Database = locals.runtime?.env?.DB;
    if (!D1Database) {
      return new Response(JSON.stringify({ error: t(locale, "error.dbNotAvailable") }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      });
    }

    const db = getDb(D1Database);

    const [asset] = await db
      .select()
      .from(assets)
      .where(eq(assets.id, id))
      .limit(1);

    if (!asset || asset.status !== "published") {
      return new Response(JSON.stringify({ error: t(locale, "error.propertyNotFound") }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const assetImages = await db
      .select()
      .from(images)
      .where(eq(images.assetId, asset.id))
      .orderBy(asc(images.order));

    const imageUrls = assetImages.map((img) => generateImageUrl(img.r2Key));

    return new Response(
      JSON.stringify({
        data: {
          id: asset.id,
          title: asset.title,
          location: formatLocation(asset),
          tier: asset.tier,
          description: asset.description,
          shortDescription: asset.shortDescription,
          bedrooms: asset.bedrooms,
          bathrooms: asset.bathrooms,
          maxOccupancy: asset.maxOccupancy,
          sqMeters: asset.sqMeters,
          amenities: asset.amenities,
          highlights: asset.highlights,
          views: asset.views,
          smoobuPropertyId: asset.smoobuPropertyId,
          images: imageUrls,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching property:", error);
    return new Response(
      JSON.stringify({
        error: safeErrorMessage(error, t(locale, "error.failedToFetchProperty"), locale),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
