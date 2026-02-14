/**
 * Fetch list of apartments from Smoobu API (server-side, uses broker apiKey).
 */

import type { SmoobuApartmentsResponse } from "@/schemas/smoobu";
import { smoobuApartmentsResponseSchema } from "@/schemas/smoobu";
import { SMOOBU_BASE_URL } from "../constants";

export async function fetchListApartments(
  apiKey: string
): Promise<SmoobuApartmentsResponse> {
  const response = await fetch(`${SMOOBU_BASE_URL}/api/apartments`, {
    headers: {
      "Api-Key": apiKey,
      "Cache-Control": "no-cache",
    },
  });

  if (!response.ok) {
    throw new Error(`Smoobu apartments list failed: ${response.status}`);
  }

  const json = (await response.json()) as unknown;
  const parsed = smoobuApartmentsResponseSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error("Invalid Smoobu apartments response");
  }
  return parsed.data;
}
