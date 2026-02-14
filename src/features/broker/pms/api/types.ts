import type { PmsIntegration as DbPmsIntegration } from "@/db/schema";

export type TPmsIntegration = DbPmsIntegration;

export type TSafePmsIntegration = Omit<TPmsIntegration, "apiKey">;

export type IntegrationStatusResponse = {
  hasIntegration: boolean;
  integration: TSafePmsIntegration | null;
};

/** GET /api/backoffice/integrations — response data (single source of truth) */
export type TGetIntegrationsResponse = IntegrationStatusResponse;

/** POST /api/backoffice/integrations — request body (single source of truth) */
export type { TSmoobuCreateBodyInput as TPostIntegrationsRequest } from "@/features/broker/pms/integrations/smoobu/createBodySchema";

/** POST /api/backoffice/integrations — response data (created integration, no apiKey) */
export type TPostIntegrationsResponse = {
  id: string;
  provider: string;
  pmsUserId: number | null;
  pmsEmail: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export function isSmoobuIntegration(
  i: TSafePmsIntegration | null
): i is TSafePmsIntegration & { provider: "smoobu" } {
  return i?.provider === "smoobu";
}

/** GET /api/backoffice/integrations/listings — response (list of { id, name }) */
export type TGetIntegrationListingsResponse = {
  listings: Array<{ id: number; name: string }>;
};

/** GET /api/backoffice/integrations/listings/[id] — response (Smoobu apartment details) */
export type { SmoobuApartmentDetails as TGetIntegrationListingDetailResponse } from "@/schemas/smoobu";

// ============================================================================
// Smoobu Rates (public proxy)
// ============================================================================

/** GET /api/smoobu/rates — request params */
export type TGetSmoobuRatesRequest = {
  smoobuPropertyId: number;
  startDate: string;
  endDate: string;
};

/** GET /api/smoobu/rates — response data */
export type { SmoobuRatesResponse as TGetSmoobuRatesResponse } from "@/schemas/smoobu";

// ============================================================================
// Smoobu Availability (public proxy)
// ============================================================================

/** POST /api/smoobu/availability — request body */
export type TPostSmoobuAvailabilityRequest = {
  smoobuPropertyId: number;
  arrivalDate: string;
  departureDate: string;
  guests?: number;
};

/** POST /api/smoobu/availability — response data */
export type { SmoobuAvailabilityResponse as TPostSmoobuAvailabilityResponse } from "@/schemas/smoobu";
