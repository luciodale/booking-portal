/**
 * Smoobu API Key Verification Proxy
 * Verifies Smoobu API key by calling /api/me endpoint
 */

import { verifyApiKey } from "@/modules/smoobu/api/handlers";

export const POST = verifyApiKey;
