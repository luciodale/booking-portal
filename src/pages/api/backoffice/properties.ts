import {
  createProperty,
  listProperties,
} from "@/features/broker/property/api/handlers";

export const prerender = false;

export const GET = listProperties;
export const POST = createProperty;
