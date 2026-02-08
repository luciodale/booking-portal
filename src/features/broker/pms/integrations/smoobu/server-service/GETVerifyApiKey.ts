/**
 * Smoobu server handlers (verify API key for integration setup)
 */

import { SMOOBU_BASE_URL } from "@/constants";
import type { SmoobuErrorResponse, SmoobuUser } from "@/schemas/smoobu";
import { verifyApiKeyRequestSchema } from "@/schemas/smoobu";
import type { APIRoute } from "astro";
import {
  jsonError,
  jsonSuccess,
} from "../../../api/server-handler/responseHelpers";

export const GETVerifyApiKey: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validation = verifyApiKeyRequestSchema.safeParse(body);

    if (!validation.success) {
      return jsonError("Validation failed", 400, validation.error.issues);
    }

    const { apiKey } = validation.data;

    const response = await fetch(`${SMOOBU_BASE_URL}/api/me`, {
      headers: {
        "Api-Key": apiKey,
        "Cache-Control": "no-cache",
      },
    });

    if (!response.ok) {
      const error: SmoobuErrorResponse = await response.json();
      return jsonError(error.detail || "Invalid API key", response.status);
    }

    const userData: SmoobuUser = await response.json();
    return jsonSuccess(userData);
  } catch (error) {
    console.error("Error verifying Smoobu API key:", error);
    return jsonError(
      error instanceof Error ? error.message : "Failed to verify API key"
    );
  }
};
