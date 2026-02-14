import type { TGetIntegrationListingDetailResponse } from "@/features/broker/pms/api/types";

export async function getIntegrationListingById(
  id: number
): Promise<TGetIntegrationListingDetailResponse> {
  const response = await fetch(`/api/backoffice/integrations/listings/${id}`);
  if (!response.ok)
    throw new Error("Failed to fetch integration listing details");
  const json = (await response.json()) as {
    data: TGetIntegrationListingDetailResponse;
  };
  return json.data;
}
