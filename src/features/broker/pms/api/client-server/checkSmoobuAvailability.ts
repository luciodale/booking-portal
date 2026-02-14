import type {
  TPostSmoobuAvailabilityRequest,
  TPostSmoobuAvailabilityResponse,
} from "@/features/broker/pms/api/types";

export async function checkSmoobuAvailability(
  params: TPostSmoobuAvailabilityRequest
): Promise<TPostSmoobuAvailabilityResponse> {
  const response = await fetch("/api/smoobu/availability", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!response.ok) throw new Error("Failed to check Smoobu availability");
  const json = (await response.json()) as {
    data: TPostSmoobuAvailabilityResponse;
  };
  return json.data;
}
