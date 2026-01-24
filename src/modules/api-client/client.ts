/**
 * Type-Safe API Client
 * Uses single source of truth types from elite-schema
 * Provides typed fetch wrappers for all backoffice API endpoints
 */

import type {
  ApiResponse,
  CreateExperienceRequest,
  CreatePricingRuleRequest,
  CreatePropertyRequest,
  ExperienceListResponse,
  ExperienceResponse,
  PropertyListResponse,
  PropertyResponse,
  UpdateExperienceRequest,
  UpdatePropertyRequest,
  UploadImagesResponse,
} from "@/modules/api-client/types";

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
// Experience API
// ============================================================================

export const experienceApi = {
  /**
   * Fetch all experiences with optional filters
   */
  list: async (params?: {
    search?: string;
    category?: string;
    status?: string;
  }): Promise<ExperienceListResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set("search", params.search);
    if (params?.category) searchParams.set("category", params.category);
    if (params?.status) searchParams.set("status", params.status);

    const query = searchParams.toString();
    const url = `/api/backoffice/experiences${query ? `?${query}` : ""}`;

    return apiFetch<ExperienceListResponse>(url);
  },

  /**
   * Fetch a single experience by ID
   */
  get: async (id: string): Promise<ExperienceResponse> => {
    return apiFetch<ExperienceResponse>(`/api/backoffice/experiences/${id}`);
  },

  /**
   * Create a new experience
   */
  create: async (data: CreateExperienceRequest): Promise<ExperienceResponse> => {
    return apiFetch<ExperienceResponse>("/api/backoffice/experiences", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Update an existing experience
   */
  update: async (
    id: string,
    data: UpdateExperienceRequest
  ): Promise<ExperienceResponse> => {
    return apiFetch<ExperienceResponse>(`/api/backoffice/experiences/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete/archive an experience
   */
  delete: async (id: string): Promise<void> => {
    return apiFetch<void>(`/api/backoffice/experiences/${id}`, {
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

export interface PricingRuleData {
  id: string;
  assetId: string;
  name: string;
  startDate: string;
  endDate: string;
  multiplier: number;
  minNights: number | null;
  priority: number;
  active: boolean;
  createdAt: string | null;
}

interface PricingRulesListResponse {
  pricingRules: PricingRuleData[];
}

export interface UpdatePricingRuleRequest {
  name?: string;
  startDate?: string;
  endDate?: string;
  multiplier?: number;
  minNights?: number | null;
  priority?: number;
}

export const pricingRuleApi = {
  /**
   * Fetch all pricing rules for an asset
   */
  list: async (assetId: string): Promise<PricingRuleData[]> => {
    const response = await apiFetch<PricingRulesListResponse>(
      `/api/backoffice/pricing-rules?assetId=${encodeURIComponent(assetId)}`
    );
    return response.pricingRules;
  },

  /**
   * Create a new pricing rule
   */
  create: async (data: CreatePricingRuleRequest): Promise<PricingRuleData> => {
    return apiFetch<PricingRuleData>("/api/backoffice/pricing-rules", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Update an existing pricing rule
   */
  update: async (id: string, data: UpdatePricingRuleRequest): Promise<PricingRuleData> => {
    return apiFetch<PricingRuleData>(`/api/backoffice/pricing-rules/${id}`, {
      method: "PATCH",
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
