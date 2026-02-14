import { propertyApi } from "@/features/broker/property/api/client-server";
import type {
  PropertyResponse,
  UpdatePropertyRequest,
} from "@/features/broker/property/api/types";
import { propertyQueryKeys } from "@/features/broker/property/constants/queryKeys";
import type { UseMutationOptions } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: propertyQueryKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: propertyQueryKeys.lists() });
    },
    ...options,
  });
}
