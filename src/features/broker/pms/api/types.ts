import type { PmsIntegration as DbPmsIntegration } from "@/db";

export type TPmsIntegration = DbPmsIntegration;

export type TSafePmsIntegration = Omit<TPmsIntegration, "apiKey">;

export type IntegrationStatusResponse = {
  hasIntegration: boolean;
  integration: TSafePmsIntegration | null;
};

/** GET /api/backoffice/integrations — response data (single source of truth) */
export type TGetIntegrationsResponse = IntegrationStatusResponse;

/** POST /api/backoffice/integrations — request body (single source of truth) */
export type {
  TSmoobuCreateBodyInput as TPostIntegrationsRequest,
} from "@/features/broker/pms/integrations/smoobu/createBodySchema";

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
