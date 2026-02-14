import { propertyApi } from "@/features/broker/property/api/client-server/propertyApi";
import { propertyQueryKeys } from "@/features/broker/property/constants/queryKeys";
import type { UseMutationOptions } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteProperty(
  options?: UseMutationOptions<void, Error, string, unknown>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => propertyApi.delete(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({
        queryKey: propertyQueryKeys.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: propertyQueryKeys.lists() });
    },
    ...options,
  });
}
