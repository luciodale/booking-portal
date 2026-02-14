/**
 * Type-Safe API Client
 * Re-exports API objects from features (single source of truth).
 */

import {
  imageApi as propertyImageApi,
  propertyApi as propertyApiFromFeature,
} from "@/features/broker/property/api/client-server";
import { experienceApi as experienceApiFromFeature } from "@/features/broker/experience/api/client-server";

/**
 * Base API error class
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ============================================================================
// Property API (re-export from feature)
// ============================================================================

export const propertyApi = propertyApiFromFeature;

// ============================================================================
// Experience API (re-export from feature)
// ============================================================================

export const experienceApi = experienceApiFromFeature;

// ============================================================================
// Image Upload API (re-export from feature)
// ============================================================================

export const imageApi = propertyImageApi;
