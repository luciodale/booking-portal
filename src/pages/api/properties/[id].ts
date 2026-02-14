import { getDb } from "@/db";
import { assets, images } from "@/db/schema";
import { generateImageUrl } from "@/modules/r2/r2-helpers";
import type { APIRoute } from "astro";
import { asc, eq } from "drizzle-orm";

export const GET: APIRoute = async ({ params, locals }) => {
  try {
    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ error: "Missing property ID" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const D1Database = locals.runtime?.env?.DB;
    if (!D1Database) {
      return new Response(JSON.stringify({ error: "Database not available" }), {
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
      return new Response(JSON.stringify({ error: "Property not found" }), {
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
          location: asset.location,
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
        error:
          error instanceof Error ? error.message : "Failed to fetch property",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
