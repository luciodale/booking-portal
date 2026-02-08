/**
 * Smoobu API Key Verification Proxy
 * Verifies Smoobu API key by calling /api/me endpoint
 */

import { GETVerifyApiKey } from "@/features/broker/pms/integrations/smoobu/server-service/GETVerifyApiKey";

export const POST = GETVerifyApiKey;
