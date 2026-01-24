/**
 * Types - Derived from Drizzle Schema (Single Source of Truth)
 */
import type { Asset, Experience } from "@/db/schema";

/** Asset with UI-specific fields not stored in DB */
export type AssetWithImages = Asset & {
  images: string[];
  tagline?: string;
};

/** Experience with linked asset discount */
export type LinkedExperience = Experience & {
  discountPercent: number;
};
