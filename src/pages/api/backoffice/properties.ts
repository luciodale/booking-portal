import {
  createProperty,
  listProperties,
} from "@/modules/property/api/handlers";

export const prerender = false;

export const GET = listProperties;
export const POST = createProperty;
