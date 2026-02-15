import type { SmoobuAvailabilityResponse } from "@/schemas/smoobu";

export async function checkPropertyAvailability(
  propertyId: string,
  params: {
    arrivalDate: string;
    departureDate: string;
    guests?: number;
  }
): Promise<SmoobuAvailabilityResponse> {
  const response = await fetch(`/api/properties/${propertyId}/availability`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!response.ok) throw new Error("Failed to check availability");
  const json = (await response.json()) as { data: SmoobuAvailabilityResponse };
  return json.data;
}
