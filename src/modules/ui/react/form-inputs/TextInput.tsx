/**
 * TextInput - Controlled text input with react-hook-form
 */

import { cn } from "@/modules/utils/cn";
import {
  type Control,
  Controller,
  type FieldValues,
  type Path,
} from "react-hook-form";

interface TextInputProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  required?: boolean;
  description?: string;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
  labelSuffix?: React.ReactNode;
}

export function TextInput<T extends FieldValues>({
  name,
  control,
  label,
  required,
  description,
  placeholder,
  maxLength,
  disabled,
  labelSuffix,
}: TextInputProps<T>) {
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
            type="text"
            placeholder={placeholder}
            maxLength={maxLength}
            disabled={disabled}
            value={(field.value as string) || ""}
            className={cn(
              "input",
              fieldState.error && "border-error",
              disabled && "opacity-50 cursor-not-allowed"
            )}
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
