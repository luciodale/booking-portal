import {
  deleteProperty,
  getProperty,
  updateProperty,
} from "@/features/broker/property/api/handlers";

export const prerender = false;

export const GET = getProperty;
export const PUT = updateProperty;
export const PATCH = updateProperty; // Support both PUT and PATCH for updates
export const DELETE = deleteProperty;
