/**
 * NumberInput - Controlled number input with react-hook-form
 */

import { cn } from "@/modules/utils/cn";
import {
  type Control,
  Controller,
  type FieldValues,
  type Path,
} from "react-hook-form";

interface NumberInputProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  required?: boolean;
  description?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  labelSuffix?: React.ReactNode;
}

export function NumberInput<T extends FieldValues>({
  name,
  control,
  label,
  required,
  description,
  placeholder,
  min,
  max,
  labelSuffix,
}: NumberInputProps<T>) {
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
            {labelSuffix}
          </label>
          {description && (
            <p className="text-sm text-muted-foreground mb-2">{description}</p>
          )}
          <input
            {...field}
            id={name}
            type="number"
            placeholder={placeholder}
            min={min}
            max={max}
            value={(field.value as number) ?? ""}
            onChange={(e) => {
              const val =
                e.target.value === "" ? undefined : Number(e.target.value);
              field.onChange(val);
            }}
            className={cn("input", fieldState.error && "border-error")}
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
