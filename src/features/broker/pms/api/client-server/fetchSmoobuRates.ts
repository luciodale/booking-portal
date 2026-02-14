import type { TGetSmoobuRatesResponse } from "@/features/broker/pms/api/types";

export async function fetchSmoobuRates(params: {
  smoobuPropertyId: number;
  startDate: string;
  endDate: string;
}): Promise<TGetSmoobuRatesResponse> {
  const url = new URL("/api/smoobu/rates", window.location.origin);
  url.searchParams.set("smoobuPropertyId", String(params.smoobuPropertyId));
  url.searchParams.set("startDate", params.startDate);
  url.searchParams.set("endDate", params.endDate);

  const response = await fetch(url.toString());
  if (!response.ok) throw new Error("Failed to fetch Smoobu rates");
  const json = (await response.json()) as { data: TGetSmoobuRatesResponse };
  return json.data;
}
