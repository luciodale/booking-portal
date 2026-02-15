import type * as schema from "@/db/schema";
import {
  assetExperiences,
  assets,
  experienceImages,
  experiences,
  images,
} from "@/db/schema";
import { experienceCategoryLabels } from "@/features/broker/experience/constants/categoryLabels";
import { generateImageUrl } from "@/modules/r2/r2-helpers";
import { formatLocation } from "@/utils/formatLocation";
import { and, asc, count, desc, eq, sql } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";

type Db = DrizzleD1Database<typeof schema>;

const PER_PAGE = 5;

export type ExperienceCityCard = {
  city: string;
  count: number;
  imageUrl: string;
};

export type ExperienceListItem = {
  id: string;
  title: string;
  location: string;
  imageUrl: string;
  duration: string;
  category: string;
  shortDescription: string;
  basePrice: number;
  currency: string;
  maxParticipants: number | null;
};

export type ExperienceDetail = {
  experience: typeof experiences.$inferSelect;
  imageUrls: string[];
  categoryLabel: string;
  linkedProperties: {
    asset: typeof assets.$inferSelect;
    imageUrl: string;
  }[];
};

export async function fetchExperienceCityCards(
  db: Db
): Promise<ExperienceCityCard[]> {
  const cityRows = await db
    .select({
      city: experiences.city,
      count: count(),
    })
    .from(experiences)
    .where(
      and(
        eq(experiences.status, "published"),
        sql`${experiences.city} IS NOT NULL AND ${experiences.city} != ''`
      )
    )
    .groupBy(experiences.city)
    .orderBy(desc(count()));

  const validRows = cityRows.filter(
    (row): row is typeof row & { city: string } => row.city != null
  );

  return Promise.all(
    validRows.map(async (row) => {
      const [firstExp] = await db
        .select({ id: experiences.id, imageUrl: experiences.imageUrl })
        .from(experiences)
        .where(
          and(
            eq(experiences.status, "published"),
            eq(experiences.city, row.city)
          )
        )
        .limit(1);

      let imageUrl = "";
      if (firstExp) {
        const [img] = await db
          .select()
          .from(experienceImages)
          .where(
            and(
              eq(experienceImages.experienceId, firstExp.id),
              eq(experienceImages.isPrimary, true)
            )
          )
          .limit(1);
        if (img) {
          imageUrl = generateImageUrl(img.r2Key);
        } else if (firstExp.imageUrl) {
          imageUrl = generateImageUrl(firstExp.imageUrl);
        }
      }

      return { city: row.city, count: row.count, imageUrl };
    })
  );
}

export async function fetchExperiencesByCity(
  db: Db,
  city: string,
  page: number
): Promise<{
  experiences: ExperienceListItem[];
  totalCount: number;
  totalPages: number;
}> {
  const cityLower = city.toLowerCase();

  const [countRow] = await db
    .select({ count: count() })
    .from(experiences)
    .where(
      and(
        eq(experiences.status, "published"),
        sql`lower(${experiences.city}) = ${cityLower}`
      )
    );

  const totalCount = countRow?.count ?? 0;
  const totalPages = Math.ceil(totalCount / PER_PAGE);
  const offset = (page - 1) * PER_PAGE;

  const rows = await db
    .select()
    .from(experiences)
    .where(
      and(
        eq(experiences.status, "published"),
        sql`lower(${experiences.city}) = ${cityLower}`
      )
    )
    .orderBy(desc(experiences.createdAt))
    .limit(PER_PAGE)
    .offset(offset);

  const items = await Promise.all(
    rows.map(async (exp) => {
      const [primaryImg] = await db
        .select()
        .from(experienceImages)
        .where(
          and(
            eq(experienceImages.experienceId, exp.id),
            eq(experienceImages.isPrimary, true)
          )
        )
        .limit(1);

      const imageUrl = primaryImg
        ? generateImageUrl(primaryImg.r2Key)
        : exp.imageUrl
          ? generateImageUrl(exp.imageUrl)
          : "";

      return {
        id: exp.id,
        title: exp.title,
        location: formatLocation(exp),
        imageUrl,
        duration: exp.duration ?? "",
        category: exp.category
          ? (experienceCategoryLabels[exp.category] ?? exp.category)
          : "Other",
        shortDescription: exp.shortDescription ?? "",
        basePrice: exp.basePrice,
        currency: exp.currency,
        maxParticipants: exp.maxParticipants,
      };
    })
  );

  return { experiences: items, totalCount, totalPages };
}

export async function fetchExperienceById(
  db: Db,
  id: string
): Promise<ExperienceDetail | null> {
  const [exp] = await db
    .select()
    .from(experiences)
    .where(and(eq(experiences.id, id), eq(experiences.status, "published")))
    .limit(1);

  if (!exp) return null;

  const expImages = await db
    .select()
    .from(experienceImages)
    .where(eq(experienceImages.experienceId, exp.id))
    .orderBy(asc(experienceImages.order));

  const imageUrls = expImages.map((img) => generateImageUrl(img.r2Key));

  const categoryLabel = exp.category
    ? (experienceCategoryLabels[exp.category] ?? exp.category)
    : "Other";

  // Linked properties via junction table
  const links = await db
    .select({ assetId: assetExperiences.assetId })
    .from(assetExperiences)
    .where(eq(assetExperiences.experienceId, exp.id));

  const linkedProperties = (
    await Promise.all(
      links.map(async (link) => {
        const [asset] = await db
          .select()
          .from(assets)
          .where(
            and(eq(assets.id, link.assetId), eq(assets.status, "published"))
          )
          .limit(1);
        if (!asset) return null;

        const [primaryImg] = await db
          .select()
          .from(images)
          .where(and(eq(images.assetId, asset.id), eq(images.isPrimary, true)))
          .limit(1);

        return {
          asset,
          imageUrl: primaryImg ? generateImageUrl(primaryImg.r2Key) : "",
        };
      })
    )
  ).filter((p): p is NonNullable<typeof p> => p !== null);

  return { experience: exp, imageUrls, categoryLabel, linkedProperties };
}
