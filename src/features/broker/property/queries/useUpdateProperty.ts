import { propertyApi } from "@/features/broker/property/api/client-server/propertyApi";
import type {
  PropertyWithDetails,
  UpdatePropertyInput,
} from "@/features/broker/property/api/types";
import { propertyQueryKeys } from "@/features/broker/property/constants/queryKeys";
import type { UseMutationOptions } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateProperty(
  options?: UseMutationOptions<
    PropertyWithDetails,
    Error,
    { id: string; data: UpdatePropertyInput },
    unknown
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePropertyInput }) =>
      propertyApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: propertyQueryKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: propertyQueryKeys.lists() });
    },
    ...options,
  });
}
