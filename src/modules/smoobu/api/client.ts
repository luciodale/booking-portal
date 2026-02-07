/**
 * Smoobu API Client
 * Client-side functions to interact with Smoobu API
 */

import { SMOOBU_BASE_URL } from "@/constants";
import type { ApiErrorResponse, ApiSuccessResponse } from "@/schemas";
import type {
  SmoobuApartmentDetails,
  SmoobuApartmentsResponse,
  SmoobuApiKeyVerificationRequest,
  SmoobuAvailabilityRequest,
  SmoobuAvailabilityResponse,
  SmoobuErrorResponse,
  SmoobuRatesResponse,
  SmoobuUser,
} from "@/schemas/smoobu";

// ============================================================================
// Error Handling
// ============================================================================

export class SmoobuApiError extends Error {
  constructor(
    public status: number,
    public title: string,
    public detail: string
  ) {
    super(`Smoobu API Error: ${title} - ${detail}`);
    this.name = "SmoobuApiError";
  }
}

async function handleSmoobuResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: SmoobuErrorResponse = await response.json();
    throw new SmoobuApiError(error.status, error.title, error.detail);
  }
  return response.json();
}

// ============================================================================
// Authentication
// ============================================================================

/**
 * Verify Smoobu API key and get user details
 * Called client-side before storing the API key
 */
export async function verifySmoobuApiKey(
  request: SmoobuApiKeyVerificationRequest
): Promise<SmoobuUser> {
  const response = await fetch("/api/smoobu/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  const result: ApiSuccessResponse<SmoobuUser> | ApiErrorResponse =
    await response.json();

  if (!result.success) {
    throw new SmoobuApiError(
      response.status,
      "Verification Failed",
      result.error.message
    );
  }

  return result.data;
}

// ============================================================================
// Apartments
// ============================================================================

/**
 * Get list of all apartments for authenticated user
 */
export async function getSmoobuApartments(
  apiKey: string
): Promise<SmoobuApartmentsResponse> {
  const response = await fetch(`${SMOOBU_BASE_URL}/api/apartments`, {
    headers: {
      "Api-Key": apiKey,
      "Cache-Control": "no-cache",
    },
  });

  return handleSmoobuResponse<SmoobuApartmentsResponse>(response);
}

/**
 * Get detailed information for a specific apartment
 */
export async function getSmoobuApartmentDetails(
  apiKey: string,
  apartmentId: number
): Promise<SmoobuApartmentDetails> {
  const response = await fetch(
    `${SMOOBU_BASE_URL}/api/apartments/${apartmentId}`,
    {
      headers: {
        "Api-Key": apiKey,
        "Cache-Control": "no-cache",
      },
    }
  );

  return handleSmoobuResponse<SmoobuApartmentDetails>(response);
}

// ============================================================================
// Rates
// ============================================================================

/**
 * Get rates for specified apartments and date range
 */
export async function getSmoobuRates(
  apiKey: string,
  params: {
    apartments: number[];
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
  }
): Promise<SmoobuRatesResponse> {
  const apartmentParams = params.apartments
    .map((id) => `apartments[]=${id}`)
    .join("&");
  const url = `${SMOOBU_BASE_URL}/api/rates?${apartmentParams}&start_date=${params.startDate}&end_date=${params.endDate}`;

  const response = await fetch(url, {
    headers: {
      "Api-Key": apiKey,
      "Cache-Control": "no-cache",
    },
  });

  return handleSmoobuResponse<SmoobuRatesResponse>(response);
}

// ============================================================================
// Availability
// ============================================================================

/**
 * Check apartment availability and get pricing
 */
export async function checkSmoobuAvailability(
  apiKey: string,
  request: SmoobuAvailabilityRequest
): Promise<SmoobuAvailabilityResponse> {
  const response = await fetch(
    `${SMOOBU_BASE_URL}/booking/checkApartmentAvailability`,
    {
      method: "POST",
      headers: {
        "Api-Key": apiKey,
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
      body: JSON.stringify(request),
    }
  );

  return handleSmoobuResponse<SmoobuAvailabilityResponse>(response);
}
