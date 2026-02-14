export const availablePms = ["smoobu"] as const;
export type PmsProvider = (typeof availablePms)[number];

export const PMS_INTEGRATION_STATUS_QUERY_KEY = [
  "pms-integration-status",
] as const;

export const INTEGRATION_LISTINGS_QUERY_KEY = [
  "pms-integration-listings",
] as const;
export const integrationListingDetailKey = (id: number) =>
  ["pms-integration-listing-detail", id] as const;
