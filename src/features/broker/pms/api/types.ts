export type PmsIntegrationBase = {
  id: string;
  provider: string;
};

export type SmoobuIntegration = PmsIntegrationBase & {
  provider: "smoobu";
  pmsUserId?: number;
  pmsEmail?: string;
};

export type PmsIntegration = SmoobuIntegration;

export type IntegrationStatusResponse = {
  hasIntegration: boolean;
  integration: PmsIntegration | null;
};

export type SaveSmoobuIntegrationParams = {
  provider: "smoobu";
  apiKey: string;
  pmsUserId: number;
  pmsEmail: string;
};

export type SaveIntegrationParams = SaveSmoobuIntegrationParams;

export function isSmoobuIntegration(
  i: PmsIntegration | null
): i is SmoobuIntegration {
  return i?.provider === "smoobu";
}
