/**
 * Pricing Rules React Query Hooks
 * Type-safe mutations for pricing rules
 */

import { type ApiError, pricingRuleApi } from "@/modules/shared/api/client";
import type { CreatePricingRuleRequest } from "@/modules/shared/api/types";
import {
  type UseMutationOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { queryKeys } from "./queries";

interface PricingRuleResponse {
  id: string;
}

/**
 * Hook to create a pricing rule
 */
export function useCreatePricingRule(
  options?: UseMutationOptions<
    PricingRuleResponse,
    ApiError,
    CreatePricingRuleRequest,
    unknown
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: pricingRuleApi.create,
    onSuccess: () => {
      // Invalidate property queries to refetch pricing rules
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.all });
    },
    ...options,
  });
}

/**
 * Hook to delete a pricing rule
 */
export function useDeletePricingRule(
  options?: UseMutationOptions<void, ApiError, string, unknown>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: pricingRuleApi.delete,
    onSuccess: () => {
      // Invalidate property queries to refetch pricing rules
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.all });
    },
    ...options,
  });
}
