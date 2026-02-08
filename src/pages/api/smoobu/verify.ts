/**
 * Smoobu API Key Verification Proxy
 * Verifies Smoobu API key by calling /api/me endpoint
 */

import { verifyApiKey } from "@/features/broker/pms/integrations/smoobu/handlers";

export const POST = verifyApiKey;
