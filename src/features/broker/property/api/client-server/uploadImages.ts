import type { UploadImagesResponse } from "@/features/broker/property/api/types";

export async function uploadImages(
  assetId: string,
  files: File[],
  options?: {
    primaryIndex?: number;
    altTexts?: Record<number, string>;
  }
): Promise<UploadImagesResponse> {
  const formData = new FormData();
  formData.append("assetId", assetId);

  files.forEach((file, index) => {
    formData.append("images", file);
    if (options?.altTexts?.[index]) {
      formData.append(`alt_${index}`, options.altTexts[index]);
    }
  });

  if (options?.primaryIndex !== undefined) {
    formData.append("isPrimary", String(options.primaryIndex));
  }

  const response = await fetch("/api/backoffice/upload-images", {
    method: "POST",
    body: formData,
  });

  const json = (await response.json()) as {
    success: boolean;
    data?: UploadImagesResponse;
    error?: { message: string };
  };
  if (!response.ok || !json.success) {
    throw new Error(json.error?.message ?? "Failed to upload images");
  }
  return json.data as UploadImagesResponse;
}
