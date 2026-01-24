/**
 * StaticAssetPathField Component
 * Input for static asset paths (e.g., PDF flyers)
 */

import { cn } from "@/lib/cn";
import { Controller, type FieldValues } from "react-hook-form";
import { FormError } from "./FormError";
import type { TextFieldProps } from "./types";

export function StaticAssetPathField<TFieldValues extends FieldValues>({
  name,
  control,
  label,
  description,
  required = false,
  disabled = false,
  placeholder = "/flyers/property-name.pdf",
  className = "",
}: Omit<TextFieldProps<TFieldValues>, "type">) {
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

          <div className="flex gap-2">
            <input
              {...field}
              id={field.name}
              type="text"
              placeholder={placeholder}
              disabled={disabled}
              value={field.value || ""}
              className={cn(
                "input flex-1",
                fieldState.error && "border-error",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            />

            {field.value && (
              <a
                href={field.value}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 text-sm font-medium text-primary hover:text-primary-hover transition-colors"
              >
                Preview
              </a>
            )}
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            Enter the path to a static file (e.g., /flyers/mallorca-villa.pdf)
          </p>

          <FormError message={fieldState.error?.message} />
        </div>
      )}
    />
  );
}
