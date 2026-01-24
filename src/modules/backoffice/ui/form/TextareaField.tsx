/**
 * TextareaField Component
 * Type-safe textarea input with react-hook-form integration
 */

import { cn } from "@/lib/cn";
import { Controller, type FieldValues } from "react-hook-form";
import { FormError } from "./FormError";
import type { TextareaFieldProps } from "./types";

export function TextareaField<TFieldValues extends FieldValues>({
  name,
  control,
  label,
  description,
  required = false,
  disabled = false,
  placeholder,
  rows = 4,
  maxLength,
  className = "",
}: TextareaFieldProps<TFieldValues>) {
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

          <textarea
            {...field}
            id={field.name}
            placeholder={placeholder}
            rows={rows}
            maxLength={maxLength}
            disabled={disabled}
            value={field.value || ""}
            className={cn(
              "input resize-y",
              fieldState.error && "border-error",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          />

          {maxLength && field.value && (
            <p className="mt-1 text-xs text-muted-foreground text-right">
              {field.value.length} / {maxLength}
            </p>
          )}

          <FormError message={fieldState.error?.message} />
        </div>
      )}
    />
  );
}
