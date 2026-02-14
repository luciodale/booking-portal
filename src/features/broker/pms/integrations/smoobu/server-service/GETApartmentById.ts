/**
 * Fetch single apartment details from Smoobu API (server-side, uses broker apiKey).
 */

import { SMOOBU_BASE_URL } from "@/constants";
import type { SmoobuApartmentDetails } from "@/schemas/smoobu";
import { smoobuApartmentDetailsSchema } from "@/schemas/smoobu";

export async function fetchApartmentById(
  apiKey: string,
  id: number
): Promise<SmoobuApartmentDetails> {
  const response = await fetch(`${SMOOBU_BASE_URL}/api/apartments/${id}`, {
    headers: {
      "Api-Key": apiKey,
      "Cache-Control": "no-cache",
    },
  });

  if (!response.ok) {
    throw new Error(`Smoobu apartment ${id} fetch failed: ${response.status}`);
  }

  const json = (await response.json()) as unknown;
  const parsed = smoobuApartmentDetailsSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error("Invalid Smoobu apartment details response");
  }
  return parsed.data;
}
