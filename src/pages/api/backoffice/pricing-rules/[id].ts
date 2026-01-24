import {
  deletePricingRule,
  updatePricingRule,
} from "@/modules/pricing/api/handlers";

export const prerender = false;

export const PATCH = updatePricingRule;
export const DELETE = deletePricingRule;
