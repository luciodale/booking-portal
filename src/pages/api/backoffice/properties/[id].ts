import {
  deleteProperty,
  getProperty,
  updateProperty,
} from "@/modules/property/api/handlers";

export const prerender = false;

export const GET = getProperty;
export const PUT = updateProperty;
export const PATCH = updateProperty; // Support both PUT and PATCH for updates
export const DELETE = deleteProperty;
