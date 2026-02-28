/**
 * Property Validation Schemas
 * Single source of truth for property validation on both client and server
 * Uses drizzle-zod for automatic schema generation from DB schema
 */

import { assets, images } from "@/db/schema";
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

// ============================================================================
// Property Creation Schema
// ============================================================================

/**
 * Base schema for property fields (without refinements)
 * Used as base for both create and update schemas
 * NOTE: Pricing removed - now managed by Smoobu
 */
const propertyFieldsSchema = baseAssetInsertSchema
  .omit({
    id: true,
    userId: true,
    createdAt: true,
    updatedAt: true,
    smoobuPropertyId: true, // Set separately after Smoobu selection
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

    city: z.string().min(2).optional(),
    country: z.string().min(2).optional(),

    // Room details - can be pre-filled from Smoobu
    maxOccupancy: z.number().int().min(1).max(50).optional(),
    bedrooms: z.number().int().min(0).max(20).optional(),
    bathrooms: z.number().int().min(0).max(20).optional(),
    sqMeters: z.number().int().min(10).optional(),

    // Bed details from Smoobu
    doubleBeds: z.number().int().min(0).optional().nullable(),
    singleBeds: z.number().int().min(0).optional().nullable(),
    sofaBeds: z.number().int().min(0).optional().nullable(),
    couches: z.number().int().min(0).optional().nullable(),
    childBeds: z.number().int().min(0).optional().nullable(),
    queenSizeBeds: z.number().int().min(0).optional().nullable(),
    kingSizeBeds: z.number().int().min(0).optional().nullable(),

    amenities: z.array(z.object({ name: z.string(), icon: z.string() })).optional(),
    views: z.array(z.object({ name: z.string(), icon: z.string() })).optional(),
    highlights: z.array(z.object({ name: z.string(), icon: z.string() })).optional(),

    checkIn: z
      .string()
      .regex(/^\d{2}:\d{2}$/, "Use HH:mm format")
      .optional()
      .nullable(),
    checkOut: z
      .string()
      .regex(/^\d{2}:\d{2}$/, "Use HH:mm format")
      .optional()
      .nullable(),

    latitude: z.string().min(1, "Latitude is required"),
    longitude: z.string().min(1, "Longitude is required"),

    showFullAddress: z.boolean().optional(),

    additionalCosts: z
      .array(
        z.object({
          label: z.string().min(1, "Label is required"),
          amount: z.number().int().min(1, "Amount must be greater than 0"),
          per: z.enum(["stay", "night", "guest", "night_per_guest"]),
          maxNights: z.number().int().min(1).optional(),
        })
      )
      .optional()
      .nullable(),
    extras: z
      .array(
        z.object({
          name: z.string().min(1, "Name is required"),
          icon: z.string(),
          amount: z.number().int().min(1, "Amount must be greater than 0"),
          per: z.enum(["stay", "night", "guest", "night_per_guest"]),
          maxNights: z.number().int().min(1).optional(),
        })
      )
      .optional()
      .nullable(),
  });

/**
 * Schema for creating a new property with Smoobu
 * Requires smoobuPropertyId to be set
 */
export const createPropertySchema = propertyFieldsSchema.extend({
  smoobuPropertyId: z.number().int().positive("Smoobu property ID required"),
});

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;

// ============================================================================
// Property Update Schema
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
});

export type PropertyWithDetails = z.infer<typeof propertyResponseSchema>;

/**
 * Lighter property schema for list views
 */
export const propertyListItemSchema = assetSelectSchema
  .pick({
    id: true,
    smoobuPropertyId: true,
    title: true,
    shortDescription: true,
    city: true,
    country: true,
    tier: true,
    status: true,
    maxOccupancy: true,
    bedrooms: true,
    bathrooms: true,
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
