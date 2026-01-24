import {
  createPricingRule,
  listPricingRules,
} from "@/modules/pricing/api/handlers";

export const prerender = false;

export const GET = listPricingRules;
export const POST = createPricingRule;
