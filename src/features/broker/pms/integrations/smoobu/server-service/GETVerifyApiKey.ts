/**
 * Smoobu server handlers (verify API key for integration setup)
 */

import type { SmoobuErrorResponse } from "@/schemas/smoobu";
import { smoobuUserSchema, verifyApiKeyRequestSchema } from "@/schemas/smoobu";
import type { APIRoute } from "astro";
import {
  jsonError,
  jsonSuccess,
  safeErrorMessage,
} from "../../../api/server-handler/responseHelpers";
import { SMOOBU_BASE_URL } from "../constants";

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

    const json = (await response.json()) as unknown;
    const parsed = smoobuUserSchema.safeParse(json);
    if (!parsed.success) {
      console.error("Smoobu user parse error:", parsed.error.flatten());
      return jsonError("Invalid Smoobu user response", 502);
    }
    return jsonSuccess(parsed.data);
  } catch (error) {
    console.error("Error verifying Smoobu API key:", error);
    return jsonError(
      safeErrorMessage(error, "Failed to verify API key")
    );
  }
};
