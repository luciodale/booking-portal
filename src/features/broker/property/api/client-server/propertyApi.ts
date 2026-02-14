import type {
  CreatePropertyInput,
  UpdatePropertyInput,
} from "@/features/broker/property/api/types";
import { createProperty } from "./createProperty";
import { deleteProperty } from "./deleteProperty";
import { getPropertyById } from "./getPropertyById";
import { queryProperties } from "./queryProperties";
import { updateProperty } from "./updateProperty";
import { uploadImages } from "./uploadImages";

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
