import {
  createExperience,
  listExperiences,
} from "@/modules/experience/api/handlers";

export const prerender = false;

export const GET = listExperiences;
export const POST = createExperience;
