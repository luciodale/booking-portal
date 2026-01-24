import {
  deleteExperience,
  getExperience,
  updateExperience,
} from "@/modules/experience/api/handlers";

export const prerender = false;

export const GET = getExperience;
export const PUT = updateExperience;
export const PATCH = updateExperience; // Support both PUT and PATCH for updates
export const DELETE = deleteExperience;
