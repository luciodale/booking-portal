/**
 * NumberInput - Controlled number input with react-hook-form
 */

import { centsToUnit, toCents } from "@/modules/money/money";
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
  step?: string;
  labelSuffix?: React.ReactNode;
  centsMode?: boolean;
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
  step,
  labelSuffix,
  centsMode = false,
}: NumberInputProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const rawValue = field.value as number | undefined;
        const displayValue =
          centsMode && rawValue != null ? centsToUnit(rawValue) : rawValue;

        return (
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
              <p className="text-sm text-muted-foreground mb-2">
                {description}
              </p>
            )}
            <input
              {...field}
              id={name}
              type="number"
              placeholder={placeholder}
              min={min}
              max={max}
              step={step ?? (centsMode ? "0.01" : undefined)}
              value={displayValue ?? ""}
              onChange={(e) => {
                if (e.target.value === "") {
                  field.onChange(undefined);
                  return;
                }
                const num = Number(e.target.value);
                field.onChange(centsMode ? toCents(num) : num);
              }}
              className={cn("input", fieldState.error && "border-error")}
            />
            {fieldState.error && (
              <p className="text-sm text-error mt-1">
                {fieldState.error.message}
              </p>
            )}
          </div>
        );
      }}
    />
  );
}
