/**
 * Check apartment availability via Smoobu API (server-side).
 */

import type { SmoobuAvailabilityResponse } from "@/schemas/smoobu";
import { smoobuAvailabilityResponseSchema } from "@/schemas/smoobu";
import { SMOOBU_BASE_URL } from "../constants";

export async function checkSmoobuAvailability(
  apiKey: string,
  params: {
    arrivalDate: string;
    departureDate: string;
    apartments: number[];
    customerId: number;
    guests?: number;
  }
): Promise<SmoobuAvailabilityResponse> {
  const response = await fetch(
    `${SMOOBU_BASE_URL}/booking/checkApartmentAvailability`,
    {
      method: "POST",
      headers: {
        "Api-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    }
  );

  if (!response.ok) {
    throw new Error(`Smoobu availability check failed: ${response.status}`);
  }

  const json = (await response.json()) as unknown;
  const parsed = smoobuAvailabilityResponseSchema.safeParse(json);
  if (!parsed.success) {
    console.error(
      "Smoobu availability validation errors:",
      parsed.error.issues
    );
    console.error("Smoobu raw response:", JSON.stringify(json, null, 2));
    throw new Error("Invalid Smoobu availability response");
  }
  return parsed.data;
}
