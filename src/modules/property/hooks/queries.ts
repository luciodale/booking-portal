/**
 * React Query Hooks
 * Type-safe wrappers for API calls using TanStack Query
 */

import { imageApi, propertyApi } from "@/modules/api-client/client";
import type {
  CreatePropertyRequest,
  PropertyListResponse,
  PropertyResponse,
  UpdatePropertyRequest,
  UploadImagesResponse,
} from "@/modules/api-client/types";
import { showSuccess } from "@/modules/shared/notificationStore";
import {
  type UseMutationOptions,
  type UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

// ============================================================================
// Query Keys
// ============================================================================

export const queryKeys = {
  properties: {
    all: ["properties"] as const,
    lists: () => [...queryKeys.properties.all, "list"] as const,
    list: (filters?: {
      search?: string;
      tier?: string;
      status?: string;
    }) => [...queryKeys.properties.lists(), filters] as const,
    details: () => [...queryKeys.properties.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.properties.details(), id] as const,
  },
};

// ============================================================================
// Property Queries
// ============================================================================

/**
 * Fetch all properties with optional filters
 */
export function useProperties(
  params?: {
    search?: string;
    tier?: string;
    status?: string;
  },
  options?: Omit<UseQueryOptions<PropertyListResponse>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: queryKeys.properties.list(params),
    queryFn: () => propertyApi.list(params),
    ...options,
  });
}

/**
 * Fetch a single property by ID
 */
export function useProperty(
  id: string,
  options?: Omit<UseQueryOptions<PropertyResponse>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: queryKeys.properties.detail(id),
    queryFn: () => propertyApi.get(id),
    enabled: !!id,
    ...options,
  });
}

// ============================================================================
// Property Mutations
// ============================================================================

/**
 * Create a new property
 */
export function useCreateProperty(
  options?: UseMutationOptions<
    PropertyResponse,
    Error,
    CreatePropertyRequest,
    unknown
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePropertyRequest) => propertyApi.create(data),
    onSuccess: () => {
      // Invalidate all property lists
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.lists() });
      showSuccess("Property created successfully!");
    },
    ...options,
  });
}

/**
 * Update an existing property
 */
export function useUpdateProperty(
  options?: UseMutationOptions<
    PropertyResponse,
    Error,
    { id: string; data: UpdatePropertyRequest },
    unknown
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePropertyRequest }) =>
      propertyApi.update(id, data),
    onSuccess: (data, variables) => {
      // Invalidate specific property and all lists
      queryClient.invalidateQueries({
        queryKey: queryKeys.properties.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.lists() });
    },
    ...options,
  });
}

/**
 * Delete/archive a property
 */
export function useDeleteProperty(
  options?: UseMutationOptions<void, Error, string, unknown>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => propertyApi.delete(id),
    onSuccess: (_, id) => {
      // Remove from cache and invalidate lists
      queryClient.removeQueries({
        queryKey: queryKeys.properties.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.lists() });
    },
    ...options,
  });
}

// ============================================================================
// Image Upload Mutations
// ============================================================================

/**
 * Upload images for a property
 */
export function useUploadImages(
  options?: UseMutationOptions<
    UploadImagesResponse,
    Error,
    {
      assetId: string;
      files: File[];
      primaryIndex?: number;
      altTexts?: Record<number, string>;
    },
    unknown
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ assetId, files, primaryIndex, altTexts }) =>
      imageApi.upload(assetId, files, { primaryIndex, altTexts }),
    onSuccess: (_, variables) => {
      // Invalidate the property to refetch with new images
      queryClient.invalidateQueries({
        queryKey: queryKeys.properties.detail(variables.assetId),
      });
    },
    ...options,
  });
}
