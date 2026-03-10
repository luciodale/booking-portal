import { assets, images, users } from "@/db/schema";
import { generateImageUrl } from "@/modules/r2/r2-helpers";
import { and, count, desc, eq, isNotNull, sql } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import type * as schema from "@/db/schema";

type Db = DrizzleD1Database<typeof schema>;
type Tier = "elite" | "standard";

export type PropertyItem = {
  asset: typeof assets.$inferSelect;
  imageUrl: string;
};

export type PaginatedProperties = {
  properties: PropertyItem[];
  totalCount: number;
  totalPages: number;
};

const PER_PAGE = 5;

export async function fetchCitiesByTier(db: Db, tier: Tier): Promise<string[]> {
  const cityRows = await db
    .select({ city: assets.city })
    .from(assets)
    .innerJoin(users, eq(assets.userId, users.id))
    .where(
      and(
        eq(assets.tier, tier),
        eq(assets.status, "published"),
        eq(users.stripeSetupComplete, true),
        sql`${assets.city} IS NOT NULL AND ${assets.city} != ''`
      )
    )
    .groupBy(assets.city)
    .orderBy(assets.city);

  return cityRows
    .map((row) => row.city)
    .filter((city): city is string => city != null);
}

export async function fetchPropertiesByCity(
  db: Db,
  tier: Tier,
  city: string,
  page: number
): Promise<PaginatedProperties> {
  const cityLower = city.toLowerCase();

  const [countRow] = await db
    .select({ count: count() })
    .from(assets)
    .innerJoin(users, eq(assets.userId, users.id))
    .where(
      and(
        eq(assets.tier, tier),
        eq(assets.status, "published"),
        eq(users.stripeSetupComplete, true),
        sql`lower(${assets.city}) = ${cityLower}`
      )
    );

  const totalCount = countRow?.count ?? 0;
  const totalPages = Math.ceil(totalCount / PER_PAGE);
  const offset = (page - 1) * PER_PAGE;

  const propertiesRaw = await db
    .select({ assets })
    .from(assets)
    .innerJoin(users, eq(assets.userId, users.id))
    .where(
      and(
        eq(assets.tier, tier),
        eq(assets.status, "published"),
        eq(users.stripeSetupComplete, true),
        sql`lower(${assets.city}) = ${cityLower}`
      )
    )
    .orderBy(desc(assets.createdAt))
    .limit(PER_PAGE)
    .offset(offset);

  const properties = await Promise.all(
    propertiesRaw.map(async (row) => {
      const [primaryImage] = await db
        .select()
        .from(images)
        .where(
          and(eq(images.assetId, row.assets.id), eq(images.isPrimary, true))
        )
        .limit(1);

      return {
        asset: row.assets,
        imageUrl: primaryImage ? generateImageUrl(primaryImage.r2Key) : "",
      };
    })
  );

  return { properties, totalCount, totalPages };
}

export async function fetchAllCities(db: Db): Promise<string[]> {
  const cityRows = await db
    .select({ city: assets.city })
    .from(assets)
    .where(
      and(
        eq(assets.status, "published"),
        sql`${assets.city} IS NOT NULL AND ${assets.city} != ''`
      )
    )
    .groupBy(assets.city)
    .orderBy(assets.city);

  return cityRows
    .map((row) => row.city)
    .filter((city): city is string => city != null);
}

export type SearchPropertyItem = {
  asset: typeof assets.$inferSelect;
  imageUrl: string;
  latitude: number;
  longitude: number;
};

/**
 * Deterministic offset (~300-500m) derived from the property ID
 * so the approximate pin is stable across page loads.
 */
function obfuscateCoordinates(
  id: string,
  lat: number,
  lng: number
): { latitude: number; longitude: number } {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  const angle = ((hash & 0xffff) / 0xffff) * Math.PI * 2;
  const radius = 0.003 + ((hash >>> 16) & 0xfff) / 0xfff * 0.002;
  return {
    latitude: lat + Math.sin(angle) * radius,
    longitude: lng + Math.cos(angle) * radius,
  };
}

export async function fetchSearchProperties(
  db: Db,
  city: string
): Promise<SearchPropertyItem[]> {
  const cityLower = city.toLowerCase();

  const propertiesRaw = await db
    .select()
    .from(assets)
    .innerJoin(users, eq(assets.userId, users.id))
    .where(
      and(
        eq(assets.status, "published"),
        eq(users.stripeSetupComplete, true),
        sql`lower(${assets.city}) = ${cityLower}`,
        isNotNull(assets.latitude),
        isNotNull(assets.longitude)
      )
    )
    .orderBy(desc(assets.createdAt));

  return Promise.all(
    propertiesRaw.map(async (row) => {
      const asset = row.assets;
      const [primaryImage] = await db
        .select()
        .from(images)
        .where(and(eq(images.assetId, asset.id), eq(images.isPrimary, true)))
        .limit(1);

      const lat = Number(asset.latitude);
      const lng = Number(asset.longitude);
      const coords = asset.showFullAddress
        ? { latitude: lat, longitude: lng }
        : obfuscateCoordinates(asset.id, lat, lng);

      const sanitizedAsset = asset.showFullAddress
        ? asset
        : { ...asset, street: null, zip: null };

      return {
        asset: sanitizedAsset,
        imageUrl: primaryImage ? generateImageUrl(primaryImage.r2Key) : "",
        ...coords,
      };
    })
  );
}
