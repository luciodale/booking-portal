import type * as schema from "@/db/schema";
import {
  assetExperiences,
  assets,
  experienceImages,
  experiences,
  images,
  users,
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
    .innerJoin(users, eq(experiences.userId, users.id))
    .where(
      and(
        eq(experiences.status, "published"),
        eq(users.stripeSetupComplete, true),
        sql`${experiences.city} IS NOT NULL AND ${experiences.city} != ''`
      )
    )
    .groupBy(experiences.city)
    .orderBy(desc(count()));

  const validRows = cityRows.filter(
    (row): row is typeof row & { city: string } => row.city != null
  );

  const cards: ExperienceCityCard[] = [];
  for (const row of validRows) {
    const [firstExp] = await db
      .select({
        id: experiences.id,
        imageUrl: experiences.imageUrl,
        primaryR2Key: experienceImages.r2Key,
      })
      .from(experiences)
      .innerJoin(users, eq(experiences.userId, users.id))
      .leftJoin(
        experienceImages,
        and(
          eq(experienceImages.experienceId, experiences.id),
          eq(experienceImages.isPrimary, true)
        )
      )
      .where(
        and(
          eq(experiences.status, "published"),
          eq(users.stripeSetupComplete, true),
          eq(experiences.city, row.city)
        )
      )
      .limit(1);

    let imageUrl = "";
    if (firstExp?.primaryR2Key) {
      imageUrl = generateImageUrl(firstExp.primaryR2Key);
    } else if (firstExp?.imageUrl) {
      imageUrl = generateImageUrl(firstExp.imageUrl);
    }

    cards.push({ city: row.city, count: row.count, imageUrl });
  }

  return cards;
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
    .innerJoin(users, eq(experiences.userId, users.id))
    .where(
      and(
        eq(experiences.status, "published"),
        eq(users.stripeSetupComplete, true),
        sql`lower(${experiences.city}) = ${cityLower}`
      )
    );

  const totalCount = countRow?.count ?? 0;
  const totalPages = Math.ceil(totalCount / PER_PAGE);
  const offset = (page - 1) * PER_PAGE;

  const rows = await db
    .select({
      exp: experiences,
      primaryR2Key: experienceImages.r2Key,
    })
    .from(experiences)
    .innerJoin(users, eq(experiences.userId, users.id))
    .leftJoin(
      experienceImages,
      and(
        eq(experienceImages.experienceId, experiences.id),
        eq(experienceImages.isPrimary, true)
      )
    )
    .where(
      and(
        eq(experiences.status, "published"),
        eq(users.stripeSetupComplete, true),
        sql`lower(${experiences.city}) = ${cityLower}`
      )
    )
    .orderBy(desc(experiences.createdAt))
    .limit(PER_PAGE)
    .offset(offset);

  const items = rows.map((row) => {
    const imageUrl = row.primaryR2Key
      ? generateImageUrl(row.primaryR2Key)
      : row.exp.imageUrl
        ? generateImageUrl(row.exp.imageUrl)
        : "";

    return {
      id: row.exp.id,
      title: row.exp.title,
      location: formatLocation(row.exp),
      imageUrl,
      duration: row.exp.duration ?? "",
      category: row.exp.category
        ? (experienceCategoryLabels[row.exp.category] ?? row.exp.category)
        : "Other",
      shortDescription: row.exp.shortDescription ?? "",
      basePrice: row.exp.basePrice,
      currency: row.exp.currency,
      maxParticipants: row.exp.maxParticipants,
    };
  });

  return { experiences: items, totalCount, totalPages };
}

export async function fetchExperienceById(
  db: Db,
  id: string
): Promise<ExperienceDetail | null> {
  const [expRow] = await db
    .select({ experiences })
    .from(experiences)
    .innerJoin(users, eq(experiences.userId, users.id))
    .where(
      and(
        eq(experiences.id, id),
        eq(experiences.status, "published"),
        eq(users.stripeSetupComplete, true)
      )
    )
    .limit(1);

  if (!expRow) return null;
  const exp = expRow.experiences;

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
