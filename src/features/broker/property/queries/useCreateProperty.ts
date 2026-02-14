import { propertyApi } from "@/features/broker/property/api/client-server";
import type {
  CreatePropertyRequest,
  PropertyResponse,
} from "@/features/broker/property/api/types";
import { propertyQueryKeys } from "@/features/broker/property/constants/queryKeys";
import { showSuccess } from "@/modules/ui/react/stores/notificationStore";
import type { UseMutationOptions } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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
      queryClient.invalidateQueries({ queryKey: propertyQueryKeys.lists() });
      showSuccess("Property created successfully!");
    },
    ...options,
  });
}
