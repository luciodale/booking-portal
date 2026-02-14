import { propertyApi } from "@/features/broker/property/api/client-server/propertyApi";
import type {
  CreatePropertyInput,
  PropertyWithDetails,
} from "@/features/broker/property/api/types";
import { propertyQueryKeys } from "@/features/broker/property/constants/queryKeys";
import { showSuccess } from "@/modules/ui/react/stores/notificationStore";
import type { UseMutationOptions } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateProperty(
  options?: UseMutationOptions<
    PropertyWithDetails,
    Error,
    CreatePropertyInput,
    unknown
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePropertyInput) => propertyApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: propertyQueryKeys.lists() });
      showSuccess("Property created successfully!");
    },
    ...options,
  });
}
