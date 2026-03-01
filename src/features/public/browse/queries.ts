import { assets, images } from "@/db/schema";
import { generateImageUrl } from "@/modules/r2/r2-helpers";
import { and, count, desc, eq, isNotNull, sql } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import type * as schema from "@/db/schema";

type Db = DrizzleD1Database<typeof schema>;
type Tier = "elite" | "standard";

export type CityCard = {
  city: string;
  count: number;
  imageUrl: string;
};

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

export async function fetchCityCards(
  db: Db,
  tier: Tier
): Promise<CityCard[]> {
  const cityRows = await db
    .select({
      city: assets.city,
      count: count(),
    })
    .from(assets)
    .where(
      and(
        eq(assets.tier, tier),
        eq(assets.status, "published"),
        sql`${assets.city} IS NOT NULL AND ${assets.city} != ''`
      )
    )
    .groupBy(assets.city)
    .orderBy(desc(count()));

  const validRows = cityRows.filter(
    (row): row is typeof row & { city: string } => row.city != null
  );

  return Promise.all(
    validRows.map(async (row) => {
      const [firstAsset] = await db
        .select({ id: assets.id })
        .from(assets)
        .where(
          and(
            eq(assets.tier, tier),
            eq(assets.status, "published"),
            eq(assets.city, row.city)
          )
        )
        .limit(1);

      let imageUrl = "";
      if (firstAsset) {
        const [img] = await db
          .select()
          .from(images)
          .where(
            and(eq(images.assetId, firstAsset.id), eq(images.isPrimary, true))
          )
          .limit(1);
        if (img) imageUrl = generateImageUrl(img.r2Key);
      }

      return { city: row.city, count: row.count, imageUrl };
    })
  );
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
    .where(
      and(
        eq(assets.tier, tier),
        eq(assets.status, "published"),
        sql`lower(${assets.city}) = ${cityLower}`
      )
    );

  const totalCount = countRow?.count ?? 0;
  const totalPages = Math.ceil(totalCount / PER_PAGE);
  const offset = (page - 1) * PER_PAGE;

  const propertiesRaw = await db
    .select()
    .from(assets)
    .where(
      and(
        eq(assets.tier, tier),
        eq(assets.status, "published"),
        sql`lower(${assets.city}) = ${cityLower}`
      )
    )
    .orderBy(desc(assets.createdAt))
    .limit(PER_PAGE)
    .offset(offset);

  const properties = await Promise.all(
    propertiesRaw.map(async (asset) => {
      const [primaryImage] = await db
        .select()
        .from(images)
        .where(and(eq(images.assetId, asset.id), eq(images.isPrimary, true)))
        .limit(1);

      return {
        asset,
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

export async function fetchSearchProperties(
  db: Db,
  city: string
): Promise<SearchPropertyItem[]> {
  const cityLower = city.toLowerCase();

  const propertiesRaw = await db
    .select()
    .from(assets)
    .where(
      and(
        eq(assets.status, "published"),
        sql`lower(${assets.city}) = ${cityLower}`,
        isNotNull(assets.latitude),
        isNotNull(assets.longitude)
      )
    )
    .orderBy(desc(assets.createdAt));

  return Promise.all(
    propertiesRaw.map(async (asset) => {
      const [primaryImage] = await db
        .select()
        .from(images)
        .where(and(eq(images.assetId, asset.id), eq(images.isPrimary, true)))
        .limit(1);

      return {
        asset,
        imageUrl: primaryImage ? generateImageUrl(primaryImage.r2Key) : "",
        latitude: Number(asset.latitude),
        longitude: Number(asset.longitude),
      };
    })
  );
}
