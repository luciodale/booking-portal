import { imageApi } from "@/features/broker/property/api/client-server";
import type { UploadImagesResponse } from "@/features/broker/property/api/types";
import { propertyQueryKeys } from "@/features/broker/property/constants/queryKeys";
import type { UseMutationOptions } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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
      queryClient.invalidateQueries({
        queryKey: propertyQueryKeys.detail(variables.assetId),
      });
    },
    ...options,
  });
}
