/**
 * Shared API Contract Types
 * Single source of truth for API requests/responses between worker and UI
 * All types are inferred from Zod schemas to ensure runtime validation matches TypeScript types
 */

import type {
  createExperienceSchema,
  experienceListItemSchema,
  experienceResponseSchema,
  updateExperienceSchema,
} from "@/modules/experience/domain/schema";
import type {
  createPricingRuleSchema,
  createPropertySchema,
  propertyListItemSchema,
  propertyResponseSchema,
  updatePropertySchema,
  uploadImageResponseSchema,
} from "@/modules/property/domain/schema";
import type { z } from "zod";

// ============================================================================
// Property API Types
// ============================================================================

/** Request body for creating a new property */
export type CreatePropertyRequest = z.infer<typeof createPropertySchema>;

/** Request body for updating an existing property */
export type UpdatePropertyRequest = z.infer<typeof updatePropertySchema>;

/** Response for single property (with all relations) */
export type PropertyResponse = z.infer<typeof propertyResponseSchema>;

/** Response for property list items (lighter payload) */
export type PropertyListItem = z.infer<typeof propertyListItemSchema>;

/** Response for property list endpoint */
export interface PropertyListResponse {
  properties: PropertyListItem[];
  total: number;
}

// ============================================================================
// Experience API Types
// ============================================================================

/** Request body for creating a new experience */
export type CreateExperienceRequest = z.infer<typeof createExperienceSchema>;

/** Request body for updating an existing experience */
export type UpdateExperienceRequest = z.infer<typeof updateExperienceSchema>;

/** Response for single experience (with all relations) */
export type ExperienceResponse = z.infer<typeof experienceResponseSchema>;

/** Response for experience list items (lighter payload) */
export type ExperienceListItem = z.infer<typeof experienceListItemSchema>;

/** Response for experience list endpoint */
export interface ExperienceListResponse {
  experiences: ExperienceListItem[];
  total: number;
}

// ============================================================================
// Image Upload API Types
// ============================================================================

/** Response for image upload */
export type UploadImageResponse = z.infer<typeof uploadImageResponseSchema>;

/** Response for multiple image uploads */
export interface UploadImagesResponse {
  images: UploadImageResponse[];
}

// ============================================================================
// Pricing Rules API Types
// ============================================================================

/** Request body for creating a pricing rule */
export type CreatePricingRuleRequest = z.infer<typeof createPricingRuleSchema>;

// ============================================================================
// Common API Response Wrappers
// ============================================================================

/** Success response wrapper */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

/** Error response wrapper */
export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

/** Generic API response type */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
