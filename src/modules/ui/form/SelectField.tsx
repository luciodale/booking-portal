/**
 * SelectField Component
 * Type-safe select dropdown with react-hook-form integration
 */

import { Select } from "@/modules/ui/Select";
import { cn } from "@/modules/utils/cn";
import { Controller, type FieldValues } from "react-hook-form";
import { FormError } from "./FormError";
import type { SelectFieldProps } from "./types";

export function SelectField<TFieldValues extends FieldValues>({
  name,
  control,
  label,
  description,
  required = false,
  disabled = false,
  options,
  placeholder,
  className = "",
}: SelectFieldProps<TFieldValues>) {
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

          <Select
            value={field.value || ""}
            onChange={field.onChange}
            options={options}
            placeholder={placeholder}
            disabled={disabled}
            error={!!fieldState.error}
          />

          <FormError message={fieldState.error?.message} />
        </div>
      )}
    />
  );
}
