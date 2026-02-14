/**
 * Verify Smoobu API key before storing in backoffice (integration connect flow).
 */

import type { ApiErrorResponse, ApiSuccessResponse } from "@/schemas/api";
import type {
  SmoobuApiKeyVerificationRequest,
  SmoobuUser,
} from "@/schemas/smoobu";
import { SmoobuApiError } from "./SmoobuApiError";

export async function verifySmoobuApiKey(
  request: SmoobuApiKeyVerificationRequest
): Promise<SmoobuUser> {
  const response = await fetch("/api/smoobu/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  const result: ApiSuccessResponse<SmoobuUser> | ApiErrorResponse =
    await response.json();

  if (!result.success) {
    const err = result as ApiErrorResponse;
    throw new SmoobuApiError(
      response.status,
      "Verification Failed",
      err.error.message
    );
  }

  return result.data;
}
