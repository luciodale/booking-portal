/**
 * TextareaInput - Controlled textarea with react-hook-form
 */

import { cn } from "@/modules/utils/cn";
import {
  type Control,
  Controller,
  type FieldValues,
  type Path,
} from "react-hook-form";

interface TextareaInputProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  required?: boolean;
  description?: string;
  placeholder?: string;
  rows?: number;
}

export function TextareaInput<T extends FieldValues>({
  name,
  control,
  label,
  required,
  description,
  placeholder,
  rows = 4,
}: TextareaInputProps<T>) {
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
          {description && (
            <p className="text-sm text-muted-foreground mb-2">{description}</p>
          )}
          <textarea
            {...field}
            id={name}
            placeholder={placeholder}
            rows={rows}
            value={(field.value as string) || ""}
            className={cn(
              "input resize-none",
              fieldState.error && "border-error"
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
