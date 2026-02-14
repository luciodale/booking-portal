import type {
  SmoobuCreateBookingRequest,
  SmoobuCreateBookingResponse,
} from "@/schemas/smoobu";
import { smoobuCreateBookingResponseSchema } from "@/schemas/smoobu";
import { SMOOBU_BASE_URL } from "../constants";

export async function createSmoobuBooking(
  apiKey: string,
  params: SmoobuCreateBookingRequest
): Promise<SmoobuCreateBookingResponse> {
  const response = await fetch(`${SMOOBU_BASE_URL}/api/reservations`, {
    method: "POST",
    headers: {
      "Api-Key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Smoobu create booking failed: ${response.status} - ${text}`
    );
  }

  const json = (await response.json()) as unknown;
  const parsed = smoobuCreateBookingResponseSchema.safeParse(json);
  if (!parsed.success) {
    console.error(
      "Smoobu booking response validation errors:",
      parsed.error.issues
    );
    console.error("Smoobu raw response:", JSON.stringify(json, null, 2));
    throw new Error("Invalid Smoobu booking response");
  }
  return parsed.data;
}
