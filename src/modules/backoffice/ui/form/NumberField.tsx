/**
 * NumberField Component
 * Type-safe number input with react-hook-form integration
 */

import { cn } from "@/lib/cn";
import { Controller, type FieldValues } from "react-hook-form";
import { FormError } from "./FormError";
import type { NumberFieldProps } from "./types";

export function NumberField<TFieldValues extends FieldValues>({
  name,
  control,
  label,
  description,
  required = false,
  disabled = false,
  placeholder,
  min,
  max,
  step,
  className = "",
}: NumberFieldProps<TFieldValues>) {
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
            type="number"
            placeholder={placeholder}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            value={field.value || ""}
            onChange={(e) => {
              const value =
                e.target.value === "" ? undefined : Number(e.target.value);
              field.onChange(value);
            }}
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
