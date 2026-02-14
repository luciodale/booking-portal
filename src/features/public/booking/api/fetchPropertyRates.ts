import type { SmoobuRatesResponse } from "@/schemas/smoobu";

export async function fetchPropertyRates(
  propertyId: string,
  startDate: string,
  endDate: string
): Promise<SmoobuRatesResponse> {
  const url = new URL(`/api/properties/${propertyId}/rates`, window.location.origin);
  url.searchParams.set("startDate", startDate);
  url.searchParams.set("endDate", endDate);

  const response = await fetch(url.toString());
  if (!response.ok) throw new Error("Failed to fetch rates");
  const json = (await response.json()) as { data: SmoobuRatesResponse };
  return json.data;
}
