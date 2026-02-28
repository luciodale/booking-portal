import type * as schema from "@/db/schema";
import {
  assetExperiences,
  cityTaxDefaults,
  experienceImages,
  experiences,
  users,
} from "@/db/schema";
import {
  experienceCategories,
  experienceCategoryLabels,
} from "@/features/broker/experience/constants/categoryLabels";
import { generateImageUrl } from "@/modules/r2/r2-helpers";
import { formatLocation } from "@/utils/formatLocation";
import { and, eq } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import type { CityTax } from "@/features/public/booking/domain/pricingTypes";

type Db = DrizzleD1Database<typeof schema>;

export type LinkedExperience = {
  id: string;
  title: string;
  location: string;
  imageUrl: string;
  duration: string;
  category: string;
  categoryIcon: string;
  discountPercent: number;
  basePrice: number;
  currency: string;
  showPrice: boolean;
};

export async function fetchLinkedExperiences(
  db: Db,
  assetId: string
): Promise<LinkedExperience[]> {
  const links = await db
    .select({
      experienceId: assetExperiences.experienceId,
      discountPercent: assetExperiences.discountPercent,
    })
    .from(assetExperiences)
    .where(eq(assetExperiences.assetId, assetId));

  const results = await Promise.all(
    links.map(async (link) => {
      const [exp] = await db
        .select()
        .from(experiences)
        .where(
          and(
            eq(experiences.id, link.experienceId),
            eq(experiences.status, "published")
          )
        )
        .limit(1);
      if (!exp) return null;

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
        categoryIcon:
          experienceCategories.find((c) => c.id === exp.category)?.icon ??
          exp.categoryIcon ??
          "circle-dot",
        discountPercent: link.discountPercent ?? 0,
        basePrice: exp.basePrice,
        currency: exp.currency,
        showPrice: exp.showPrice,
      };
    })
  );

  return results.filter(
    (e): e is NonNullable<typeof e> => e !== null
  );
}

export async function fetchOwnerWhatsapp(
  db: Db,
  userId: string
): Promise<string | null> {
  const [owner] = await db
    .select({ whatsappNumber: users.whatsappNumber })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return owner?.whatsappNumber ?? null;
}

export async function fetchCityTax(
  db: Db,
  userId: string,
  city: string | null,
  country: string | null
): Promise<CityTax | null> {
  if (!city || !country) return null;

  const [row] = await db
    .select({
      amount: cityTaxDefaults.amount,
      maxNights: cityTaxDefaults.maxNights,
    })
    .from(cityTaxDefaults)
    .where(
      and(
        eq(cityTaxDefaults.userId, userId),
        eq(cityTaxDefaults.city, city),
        eq(cityTaxDefaults.country, country)
      )
    )
    .limit(1);

  return row && row.amount > 0
    ? { amount: row.amount, maxNights: row.maxNights }
    : null;
}
