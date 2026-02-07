/**
 * useSmoobuAvailability - Hook to check availability and get pricing
 * Used for booking flow - checks if dates are available and returns price
 */

import type {
  SmoobuAvailabilityRequest,
  SmoobuAvailabilityResponse,
} from "@/schemas/smoobu";
import { useMutation } from "@tanstack/react-query";

// ============================================================================
// API Client Function
// ============================================================================

async function checkSmoobuAvailability(
  request: SmoobuAvailabilityRequest
): Promise<SmoobuAvailabilityResponse> {
  const response = await fetch("/api/smoobu/availability", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = (await response.json()) as { error?: { message?: string } };
    throw new Error(error.error?.message || "Failed to check availability");
  }

  const json = (await response.json()) as { data: SmoobuAvailabilityResponse };
  return json.data;
}

// ============================================================================
// Hook
// ============================================================================

export function useSmoobuAvailability() {
  return useMutation({
    mutationFn: checkSmoobuAvailability,
  });
}
