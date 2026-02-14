/**
 * SelectInput - Controlled select with react-hook-form
 */

import { Select } from "@/modules/ui/Select";
import {
  type Control,
  Controller,
  type FieldValues,
  type Path,
} from "react-hook-form";

interface SelectInputProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  required?: boolean;
  options: Array<{ value: string; label: string }>;
}

export function SelectInput<T extends FieldValues>({
  name,
  control,
  label,
  required,
  options,
}: SelectInputProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <div className="mb-4">
          <label
            htmlFor={name}
            className="block text-sm font-medium text-foreground mb-1"
          >
            {label}
            {required && <span className="text-error ml-1">*</span>}
          </label>
          <Select
            value={(field.value as string) || ""}
            onChange={field.onChange}
            options={options}
            error={!!fieldState.error}
          />
          {fieldState.error && (
            <p className="text-sm text-error mt-1">
              {fieldState.error.message}
            </p>
          )}
        </div>
      )}
    />
  );
}
