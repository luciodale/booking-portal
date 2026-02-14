import type { ExperienceListItem } from "./experience";
import type { PropertyListItem, UploadImageResponse } from "./property";

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface PropertyListResponse {
  properties: PropertyListItem[];
  total: number;
}

export interface ExperienceListResponse {
  experiences: ExperienceListItem[];
  total: number;
}

export interface UploadImagesResponse {
  images: UploadImageResponse[];
}
