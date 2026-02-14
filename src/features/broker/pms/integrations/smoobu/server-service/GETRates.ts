/**
 * Fetch rates from Smoobu API (server-side).
 */

import { SMOOBU_BASE_URL } from "@/constants";
import type { SmoobuRatesResponse } from "@/schemas/smoobu";
import { smoobuRatesResponseSchema } from "@/schemas/smoobu";

export async function fetchSmoobuRates(
  apiKey: string,
  apartmentId: number,
  startDate: string,
  endDate: string
): Promise<SmoobuRatesResponse> {
  const url = new URL(`${SMOOBU_BASE_URL}/api/rates`);
  url.searchParams.append("apartments[]", String(apartmentId));
  url.searchParams.append("start_date", startDate);
  url.searchParams.append("end_date", endDate);

  const response = await fetch(url.toString(), {
    headers: {
      "Api-Key": apiKey,
      "Cache-Control": "no-cache",
    },
  });

  if (!response.ok) {
    throw new Error(`Smoobu rates API failed: ${response.status}`);
  }

  const json = (await response.json()) as unknown;
  const parsed = smoobuRatesResponseSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error("Invalid Smoobu rates response");
  }
  return parsed.data;
}
