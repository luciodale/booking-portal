/**
 * Experience Validation Schemas
 * Single source of truth for validation on both client and server
 */

import { experienceImages, experiences } from "@/db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// ============================================================================
// Auto-generated Base Schemas from Drizzle
// ============================================================================

/** Full experience schema inferred from DB */
export const experienceSelectSchema = createSelectSchema(experiences);

/** Base insert schema for experiences */
const baseExperienceInsertSchema = createInsertSchema(experiences);

/** Experience image select schema */
export const experienceImageSelectSchema = createSelectSchema(experienceImages);

// ============================================================================
// Experience Creation Schema
// ============================================================================

/**
 * Base schema for experience fields (without refinements)
 */
const experienceFieldsSchema = baseExperienceInsertSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    imageUrl: true, // Replaced by multi-image upload
  })
  .extend({
    // Override with stricter validations
    title: z.string().min(5, "Title must be at least 5 characters").max(200),
    description: z
      .string()
      .min(20, "Description must be at least 20 characters"),
    shortDescription: z
      .string()
      .min(10, "Short description must be at least 10 characters")
      .max(300),
    location: z.string().min(3),
    city: z.string().min(2).optional(),
    country: z.string().min(2).optional(),
    category: z.string().min(1, "Category is required"),
    duration: z.string().min(1, "Duration is required"),
    maxParticipants: z.number().int().min(1).max(100).optional(),
    basePrice: z
      .number()
      .int()
      .min(100, "Base price must be at least 1 EUR (100 cents)")
      .max(100000000, "Base price too high"),
  });

/**
 * Schema for creating a new experience
 */
export const createExperienceSchema = experienceFieldsSchema;

export type CreateExperienceInput = z.infer<typeof createExperienceSchema>;

// ============================================================================
// Experience Update Schema
// ============================================================================

/**
 * Schema for updating an existing experience
 * Makes most fields optional for partial updates
 */
export const updateExperienceSchema = experienceFieldsSchema.partial();

export type UpdateExperienceInput = z.infer<typeof updateExperienceSchema>;

// ============================================================================
// Experience Response Schemas
// ============================================================================

/**
 * Full experience with images for detailed view
 */
export const experienceResponseSchema = experienceSelectSchema.extend({
  images: z.array(experienceImageSelectSchema),
});

export type ExperienceWithDetails = z.infer<typeof experienceResponseSchema>;

/**
 * Lighter experience schema for list views
 */
export const experienceListItemSchema = experienceSelectSchema
  .pick({
    id: true,
    title: true,
    shortDescription: true,
    location: true,
    category: true,
    duration: true,
    status: true,
    basePrice: true,
    currency: true,
    maxParticipants: true,
    featured: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    primaryImageUrl: z.string().optional(),
  });

export type ExperienceListItem = z.infer<typeof experienceListItemSchema>;
