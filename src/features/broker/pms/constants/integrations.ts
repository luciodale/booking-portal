export const availablePms = ["smoobu"] as const;
export type PmsProvider = (typeof availablePms)[number];

export const PMS_INTEGRATION_STATUS_QUERY_KEY = [
  "pms-integration-status",
] as const;
