/**
 * TextField Component
 * Type-safe text input field with react-hook-form integration
 */

import { cn } from "@/modules/utils/cn";
import { Controller, type FieldValues } from "react-hook-form";
import { FormError } from "./FormError";
import type { TextFieldProps } from "./types";

export function TextField<TFieldValues extends FieldValues>({
  name,
  control,
  label,
  description,
  required = false,
  disabled = false,
  type = "text",
  placeholder,
  autoComplete,
  maxLength,
  className = "",
}: TextFieldProps<TFieldValues>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <div className={cn("mb-4", className)}>
          {label && (
            <label
              htmlFor={field.name}
              className="block text-sm font-medium text-foreground mb-1"
            >
              {label}
              {required && <span className="text-error ml-1">*</span>}
            </label>
          )}

          {description && (
            <p className="text-sm text-muted-foreground mb-2">{description}</p>
          )}

          <input
            {...field}
            id={field.name}
            type={type}
            placeholder={placeholder}
            autoComplete={autoComplete}
            maxLength={maxLength}
            disabled={disabled}
            value={field.value || ""}
            className={cn(
              "input",
              fieldState.error && "border-error",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          />

          <FormError message={fieldState.error?.message} />
        </div>
      )}
    />
  );
}
