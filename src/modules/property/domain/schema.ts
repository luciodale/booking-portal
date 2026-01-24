/**
 * Elite Property Validation Schemas
 * Single source of truth for validation on both client and server
 * Uses drizzle-zod for automatic schema generation from DB schema
 */

import { assets, images, pricingRules } from "@/db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// ============================================================================
// Auto-generated Base Schemas from Drizzle
// ============================================================================

/** Full asset schema inferred from DB */
export const assetSelectSchema = createSelectSchema(assets);

/** Base insert schema for assets */
const baseAssetInsertSchema = createInsertSchema(assets);

/** Image select schema */
export const imageSelectSchema = createSelectSchema(images);

/** Pricing rule select schema */
export const pricingRuleSelectSchema = createSelectSchema(pricingRules);

// ============================================================================
// Elite Property Creation Schema
// ============================================================================

/**
 * Base schema for property fields (without refinements)
 * Used as base for both create and update schemas
 */
const propertyFieldsSchema = baseAssetInsertSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    sortOrder: true,
    featured: true,
  })
  .extend({
    // Override with stricter validations
    title: z.string().min(5, "Title must be at least 5 characters").max(200),
    description: z
      .string()
      .min(50, "Description must be at least 50 characters"),
    shortDescription: z
      .string()
      .min(20, "Short description must be at least 20 characters")
      .max(500),

    location: z.string().min(3),
    city: z.string().min(2).optional(),
    country: z.string().min(2).optional(),

    maxGuests: z.number().int().min(1).max(50),
    bedrooms: z.number().int().min(0).max(20).optional(),
    bathrooms: z.number().int().min(0).max(20).optional(),
    sqMeters: z.number().int().min(10).optional(),

    amenities: z.array(z.string()).min(1, "At least one amenity required"),
    views: z.array(z.string()).optional(),
    highlights: z.array(z.string()).optional(),

    basePrice: z
      .number()
      .int()
      .min(100, "Base price must be at least 1 EUR (100 cents)")
      .max(100000000, "Base price too high"),

    cleaningFee: z.number().int().min(0).optional(),
    minNights: z.number().int().min(1).max(365).optional(),
    maxNights: z.number().int().min(1).max(365).optional(),

    pdfAssetPath: z
      .string()
      .regex(/^\/flyers\/[a-z0-9-]+\.pdf$/, "Invalid PDF path format")
      .optional()
      .nullable(),

    videoUrl: z.string().url().optional().nullable(),
  });

/** Min/max nights refinement - reusable for schemas that need it */
const minMaxNightsRefinement = <T extends { minNights?: number | null; maxNights?: number | null }>(
  data: T
) => {
  if (data.minNights && data.maxNights) {
    return data.minNights <= data.maxNights;
  }
  return true;
};

/**
 * Schema for creating a new elite property
 * Includes all fields that should be provided by the user
 */
export const createPropertySchema = propertyFieldsSchema.refine(
  minMaxNightsRefinement,
  {
    message: "Minimum nights cannot exceed maximum nights",
    path: ["minNights"],
  }
);

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;

// ============================================================================
// Elite Property Update Schema
// ============================================================================

/**
 * Schema for updating an existing property
 * Makes most fields optional for partial updates
 * Note: No cross-field refinement since fields may be absent in partials
 */
export const updatePropertySchema = propertyFieldsSchema.partial();

export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;

// ============================================================================
// Property Response Schemas
// ============================================================================

/**
 * Full property with images for detailed view
 */
export const propertyResponseSchema = assetSelectSchema.extend({
  images: z.array(imageSelectSchema),
  pricingRules: z.array(pricingRuleSelectSchema).optional(),
});

export type PropertyWithDetails = z.infer<typeof propertyResponseSchema>;

/**
 * Lighter property schema for list views
 */
export const propertyListItemSchema = assetSelectSchema
  .pick({
    id: true,
    title: true,
    shortDescription: true,
    location: true,
    tier: true,
    status: true,
    basePrice: true,
    currency: true,
    maxGuests: true,
    bedrooms: true,
    bathrooms: true,
    featured: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    primaryImageUrl: z.string().optional(),
  });

export type PropertyListItem = z.infer<typeof propertyListItemSchema>;

// ============================================================================
// Image Upload Schemas
// ============================================================================

/**
 * Schema for image upload metadata
 */
export const uploadImageSchema = z.object({
  assetId: z.string(),
  alt: z.string().max(200).optional(),
  isPrimary: z.boolean().optional(),
  order: z.number().int().min(0).max(100).optional(),
});

export type UploadImageInput = z.infer<typeof uploadImageSchema>;

/**
 * Response after successful image upload
 */
export const uploadImageResponseSchema = imageSelectSchema.extend({
  url: z.string().url(),
});

export type UploadImageResponse = z.infer<typeof uploadImageResponseSchema>;

// ============================================================================
// Pricing Rule Schemas
// ============================================================================

/** Base pricing rule fields (without refinements) */
const pricingRuleFieldsSchema = z.object({
  assetId: z.string(),
  name: z.string().min(3, "Name must be at least 3 characters").max(100),
  startDate: z.string().date("Invalid start date format (YYYY-MM-DD)"),
  endDate: z.string().date("Invalid end date format (YYYY-MM-DD)"),
  multiplier: z
    .number()
    .int()
    .min(10, "Multiplier must be at least 10% (10)")
    .max(1000, "Multiplier cannot exceed 10x (1000)"),
  minNights: z.number().int().min(1).optional().nullable(),
  priority: z.number().int().min(0).max(100).optional(),
});

/** Date range refinement - reusable */
const dateRangeRefinement = <T extends { startDate: string; endDate: string }>(
  data: T
) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return end > start;
};

/**
 * Schema for creating a pricing rule
 */
export const createPricingRuleSchema = pricingRuleFieldsSchema.refine(
  dateRangeRefinement,
  {
    message: "End date must be after start date",
    path: ["endDate"],
  }
);

export type CreatePricingRuleInput = z.infer<typeof createPricingRuleSchema>;

/**
 * Schema for updating a pricing rule
 */
export const updatePricingRuleSchema = pricingRuleFieldsSchema
  .omit({ assetId: true })
  .partial();

export type UpdatePricingRuleInput = z.infer<typeof updatePricingRuleSchema>;
