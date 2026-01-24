/**
 * Form Field Types
 * Shared TypeScript types for all form components
 */

import type { Control, FieldPath, FieldValues } from "react-hook-form";

/**
 * Base props for all form fields
 */
export interface BaseFieldProps<TFieldValues extends FieldValues> {
  name: FieldPath<TFieldValues>;
  control: Control<TFieldValues>;
  label?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * Props for text-based inputs (text, email, url, etc.)
 */
export interface TextFieldProps<TFieldValues extends FieldValues>
  extends BaseFieldProps<TFieldValues> {
  type?: "text" | "email" | "url" | "tel";
  placeholder?: string;
  autoComplete?: string;
  maxLength?: number;
}

/**
 * Props for textarea inputs
 */
export interface TextareaFieldProps<TFieldValues extends FieldValues>
  extends BaseFieldProps<TFieldValues> {
  placeholder?: string;
  rows?: number;
  maxLength?: number;
}

/**
 * Props for number inputs
 */
export interface NumberFieldProps<TFieldValues extends FieldValues>
  extends BaseFieldProps<TFieldValues> {
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}

/**
 * Props for select inputs
 */
export interface SelectFieldProps<TFieldValues extends FieldValues>
  extends BaseFieldProps<TFieldValues> {
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

/**
 * Props for file upload inputs
 */
export interface FileUploadFieldProps<TFieldValues extends FieldValues>
  extends BaseFieldProps<TFieldValues> {
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  onUpload?: (files: File[]) => Promise<void>;
}
