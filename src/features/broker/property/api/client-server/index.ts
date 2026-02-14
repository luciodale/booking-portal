import type {
  CreatePropertyInput,
  PropertyWithDetails,
  UpdatePropertyInput,
} from "@/features/broker/property/api/types";
import { createProperty } from "./createProperty";
import { deleteProperty } from "./deleteProperty";
import { getPropertyById } from "./getPropertyById";
import { queryProperties } from "./queryProperties";
import { updateProperty } from "./updateProperty";
import { uploadImages } from "./uploadImages";

export { createProperty } from "./createProperty";
export { deleteProperty } from "./deleteProperty";
export { getPropertyById } from "./getPropertyById";
export { queryProperties } from "./queryProperties";
export { updateProperty } from "./updateProperty";
export { uploadImages } from "./uploadImages";

export const propertyApi = {
  list: queryProperties,
  get: getPropertyById,
  create: (data: CreatePropertyInput) => createProperty(data),
  update: (id: string, data: UpdatePropertyInput) => updateProperty(id, data),
  delete: deleteProperty,
};

export const imageApi = {
  upload: uploadImages,
};
