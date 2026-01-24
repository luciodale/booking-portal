import {
  deleteProperty,
  getProperty,
  updateProperty,
} from "@/modules/property/api/handlers";

export const prerender = false;

export const GET = getProperty;
export const PUT = updateProperty;
export const DELETE = deleteProperty;
