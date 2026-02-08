/**
 * Centralized Schema Exports
 * Single source of truth for all API types and validations
 */

// ============================================================================
// Domain Schemas (derived from Drizzle)
// ============================================================================

export * from "./experience";
export * from "./property";
export * from "./smoobu";

// Explicit type re-exports for commonly used types
export type {
  CreatePropertyInput,
  PropertyListItem,
  PropertyWithDetails,
  UpdatePropertyInput,
  UploadImageInput,
  UploadImageResponse,
} from "./property";

export type {
  CreateExperienceInput,
  ExperienceListItem,
  ExperienceWithDetails,
  UpdateExperienceInput,
} from "./experience";

// ============================================================================
// Legacy Type Aliases (for backward compatibility with deleted api-client/types)
// ============================================================================

export type PropertyResponse = import("./property").PropertyWithDetails;
export type CreatePropertyRequest = import("./property").CreatePropertyInput;
export type UpdatePropertyRequest = import("./property").UpdatePropertyInput;

export type ExperienceResponse = import("./experience").ExperienceWithDetails;
export type CreateExperienceRequest = import("./experience").CreateExperienceInput;
export type UpdateExperienceRequest = import("./experience").UpdateExperienceInput;

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

// ============================================================================
// List Response Types
// ============================================================================

/** Property list response */
export interface PropertyListResponse {
  properties: import("./property").PropertyListItem[];
  total: number;
}

/** Experience list response */
export interface ExperienceListResponse {
  experiences: import("./experience").ExperienceListItem[];
  total: number;
}

/** Image upload response */
export interface UploadImagesResponse {
  images: import("./property").UploadImageResponse[];
}
