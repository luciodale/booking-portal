import type { CreateExperienceInput, UpdateExperienceInput } from "@/schemas/experience";
import { createExperience } from "./createExperience";
import { deleteExperience } from "./deleteExperience";
import { getExperienceById } from "./getExperienceById";
import { queryExperiences } from "./queryExperiences";
import { updateExperience } from "./updateExperience";

export { createExperience } from "./createExperience";
export { deleteExperience } from "./deleteExperience";
export { getExperienceById } from "./getExperienceById";
export { queryExperiences } from "./queryExperiences";
export { updateExperience } from "./updateExperience";

export const experienceApi = {
  list: queryExperiences,
  get: getExperienceById,
  create: (data: CreateExperienceInput) => createExperience(data),
  update: (id: string, data: UpdateExperienceInput) => updateExperience(id, data),
  delete: deleteExperience,
};
