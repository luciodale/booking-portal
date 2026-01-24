/**
 * Pricing Rules React Query Hooks
 * Type-safe queries and mutations for pricing rules
 */

import {
  type ApiError,
  type PricingRuleData,
  type UpdatePricingRuleRequest,
  pricingRuleApi,
} from "@/modules/api-client/client";
import type { CreatePricingRuleRequest } from "@/modules/api-client/types";
import { queryKeys } from "@/modules/property/hooks/queries";
import {
  type UseMutationOptions,
  type UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

// ============================================================================
// Query Keys for Pricing Rules
// ============================================================================

export const pricingQueryKeys = {
  all: ["pricingRules"] as const,
  byAsset: (assetId: string) => [...pricingQueryKeys.all, assetId] as const,
};

// ============================================================================
// Queries
// ============================================================================

/**
 * Hook to fetch pricing rules for an asset
 */
export function usePricingRules(
  assetId: string,
  options?: Omit<UseQueryOptions<PricingRuleData[]>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: pricingQueryKeys.byAsset(assetId),
    queryFn: () => pricingRuleApi.list(assetId),
    enabled: !!assetId,
    ...options,
  });
}

// ============================================================================
// Mutations
// ============================================================================

/**
 * Hook to create a pricing rule
 */
export function useCreatePricingRule(
  options?: UseMutationOptions<
    PricingRuleData,
    ApiError,
    CreatePricingRuleRequest,
    unknown
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: pricingRuleApi.create,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: pricingQueryKeys.byAsset(variables.assetId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.all });
    },
    ...options,
  });
}

/**
 * Hook to update a pricing rule
 */
export function useUpdatePricingRule(
  assetId: string,
  options?: UseMutationOptions<
    PricingRuleData,
    ApiError,
    { id: string; data: UpdatePricingRuleRequest },
    unknown
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => pricingRuleApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: pricingQueryKeys.byAsset(assetId),
      });
    },
    ...options,
  });
}

/**
 * Hook to delete a pricing rule
 */
export function useDeletePricingRule(
  assetId?: string,
  options?: UseMutationOptions<void, ApiError, string, unknown>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: pricingRuleApi.delete,
    onSuccess: () => {
      if (assetId) {
        queryClient.invalidateQueries({
          queryKey: pricingQueryKeys.byAsset(assetId),
        });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.all });
    },
    ...options,
  });
}
