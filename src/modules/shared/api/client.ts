/**
 * Type-Safe API Client
 * Uses single source of truth types from elite-schema
 * Provides typed fetch wrappers for all backoffice API endpoints
 */

import type {
  ApiResponse,
  CreatePricingRuleRequest,
  CreatePropertyRequest,
  PropertyListResponse,
  PropertyResponse,
  UpdatePropertyRequest,
  UploadImagesResponse,
} from "@/modules/shared/api/types";

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

/**
 * Type-safe fetch wrapper
 */
async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data: ApiResponse<T> = await response.json();

  if (!response.ok || !data.success) {
    const error = "error" in data ? data.error : { message: "Unknown error" };
    throw new ApiError(error.message, response.status, error.details);
  }

  return data.data;
}

/**
 * Type-safe multipart/form-data fetch wrapper
 */
async function apiFormFetch<T>(url: string, formData: FormData): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  const data: ApiResponse<T> = await response.json();

  if (!response.ok || !data.success) {
    const error = "error" in data ? data.error : { message: "Unknown error" };
    throw new ApiError(error.message, response.status, error.details);
  }

  return data.data;
}

// ============================================================================
// Property API
// ============================================================================

export const propertyApi = {
  /**
   * Fetch all properties with optional filters
   */
  list: async (params?: {
    search?: string;
    tier?: string;
    status?: string;
  }): Promise<PropertyListResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set("search", params.search);
    if (params?.tier) searchParams.set("tier", params.tier);
    if (params?.status) searchParams.set("status", params.status);

    const query = searchParams.toString();
    const url = `/api/backoffice/properties${query ? `?${query}` : ""}`;

    return apiFetch<PropertyListResponse>(url);
  },

  /**
   * Fetch a single property by ID
   */
  get: async (id: string): Promise<PropertyResponse> => {
    return apiFetch<PropertyResponse>(`/api/backoffice/properties/${id}`);
  },

  /**
   * Create a new property
   */
  create: async (data: CreatePropertyRequest): Promise<PropertyResponse> => {
    return apiFetch<PropertyResponse>("/api/backoffice/properties", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Update an existing property
   */
  update: async (
    id: string,
    data: UpdatePropertyRequest
  ): Promise<PropertyResponse> => {
    return apiFetch<PropertyResponse>(`/api/backoffice/properties/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete/archive a property
   */
  delete: async (id: string): Promise<void> => {
    return apiFetch<void>(`/api/backoffice/properties/${id}`, {
      method: "DELETE",
    });
  },
};

// ============================================================================
// Image Upload API
// ============================================================================

export const imageApi = {
  /**
   * Upload images for an asset
   */
  upload: async (
    assetId: string,
    files: File[],
    options?: {
      primaryIndex?: number;
      altTexts?: Record<number, string>;
    }
  ): Promise<UploadImagesResponse> => {
    const formData = new FormData();
    formData.append("assetId", assetId);

    files.forEach((file, index) => {
      formData.append("images", file);
      if (options?.altTexts?.[index]) {
        formData.append(`alt_${index}`, options.altTexts[index]);
      }
    });

    if (options?.primaryIndex !== undefined) {
      formData.append("isPrimary", String(options.primaryIndex));
    }

    return apiFormFetch<UploadImagesResponse>(
      "/api/backoffice/upload-images",
      formData
    );
  },
};

// ============================================================================
// Pricing Rules API
// ============================================================================

interface PricingRuleResponse {
  id: string;
}

export const pricingRuleApi = {
  /**
   * Create a new pricing rule
   */
  create: async (data: CreatePricingRuleRequest): Promise<PricingRuleResponse> => {
    return apiFetch<PricingRuleResponse>("/api/backoffice/pricing-rules", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a pricing rule
   */
  delete: async (id: string): Promise<void> => {
    return apiFetch<void>(`/api/backoffice/pricing-rules/${id}`, {
      method: "DELETE",
    });
  },
};
