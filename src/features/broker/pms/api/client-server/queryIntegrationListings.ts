import type { TGetIntegrationListingsResponse } from "@/features/broker/pms/api/types";

export async function queryIntegrationListings(): Promise<TGetIntegrationListingsResponse> {
  const response = await fetch("/api/backoffice/integrations/listings");
  if (!response.ok) throw new Error("Failed to fetch integration listings");
  const json = (await response.json()) as {
    data: TGetIntegrationListingsResponse;
  };
  return json.data;
}
