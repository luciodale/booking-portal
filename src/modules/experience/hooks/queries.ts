/**
 * Experience React Query Hooks
 * Type-safe wrappers for API calls using TanStack Query
 */

import { experienceApi } from "@/modules/api-client/client";
import { showSuccess } from "@/modules/shared/notificationStore";
import type {
  CreateExperienceRequest,
  ExperienceListResponse,
  ExperienceResponse,
  UpdateExperienceRequest,
} from "@/schemas";
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

export const experienceQueryKeys = {
  all: ["experiences"] as const,
  lists: () => [...experienceQueryKeys.all, "list"] as const,
  list: (filters?: {
    search?: string;
    category?: string;
    status?: string;
  }) => [...experienceQueryKeys.lists(), filters] as const,
  details: () => [...experienceQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...experienceQueryKeys.details(), id] as const,
};

// ============================================================================
// Experience Queries
// ============================================================================

/**
 * Fetch all experiences with optional filters
 */
export function useExperiences(
  params?: {
    search?: string;
    category?: string;
    status?: string;
  },
  options?: Omit<
    UseQueryOptions<ExperienceListResponse>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: experienceQueryKeys.list(params),
    queryFn: () => experienceApi.list(params),
    ...options,
  });
}

/**
 * Fetch a single experience by ID
 */
export function useExperience(
  id: string,
  options?: Omit<UseQueryOptions<ExperienceResponse>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: experienceQueryKeys.detail(id),
    queryFn: () => experienceApi.get(id),
    enabled: !!id,
    ...options,
  });
}

// ============================================================================
// Experience Mutations
// ============================================================================

/**
 * Create a new experience
 */
export function useCreateExperience(
  options?: UseMutationOptions<
    ExperienceResponse,
    Error,
    CreateExperienceRequest,
    unknown
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExperienceRequest) => experienceApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: experienceQueryKeys.lists() });
      showSuccess("Experience created successfully!");
    },
    ...options,
  });
}

/**
 * Update an existing experience
 */
export function useUpdateExperience(
  options?: UseMutationOptions<
    ExperienceResponse,
    Error,
    { id: string; data: UpdateExperienceRequest },
    unknown
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExperienceRequest }) =>
      experienceApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: experienceQueryKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: experienceQueryKeys.lists() });
    },
    ...options,
  });
}

/**
 * Delete/archive an experience
 */
export function useDeleteExperience(
  options?: UseMutationOptions<void, Error, string, unknown>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => experienceApi.delete(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({
        queryKey: experienceQueryKeys.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: experienceQueryKeys.lists() });
    },
    ...options,
  });
}
