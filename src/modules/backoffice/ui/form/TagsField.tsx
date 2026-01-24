/**
 * TagsField Component
 * Multi-select checkbox field for string arrays with custom tag support
 */

import { useState } from "react";
import { Controller, type FieldValues } from "react-hook-form";
import { FormError } from "./FormError";
import type { BaseFieldProps } from "./types";

interface TagsFieldProps<TFieldValues extends FieldValues>
  extends BaseFieldProps<TFieldValues> {
  options: Array<{ value: string; label: string }>;
  allowCustom?: boolean;
}

export function TagsField<TFieldValues extends FieldValues>({
  name,
  control,
  label,
  description,
  required = false,
  disabled = false,
  options,
  allowCustom = true,
  className = "",
}: TagsFieldProps<TFieldValues>) {
  const [customInput, setCustomInput] = useState("");
  const optionValues = new Set(options.map((o) => o.value));

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const selectedValues: string[] = field.value || [];
        const customTags = selectedValues.filter((v) => !optionValues.has(v));

        const toggleValue = (value: string) => {
          if (disabled) return;
          const newValues = selectedValues.includes(value)
            ? selectedValues.filter((v) => v !== value)
            : [...selectedValues, value];
          field.onChange(newValues);
        };

        const addCustomTag = () => {
          const trimmed = customInput.trim().toLowerCase().replace(/\s+/g, "-");
          if (!trimmed || selectedValues.includes(trimmed)) return;
          field.onChange([...selectedValues, trimmed]);
          setCustomInput("");
        };

        return (
          <div className={`mb-4 ${className}`}>
            {label && (
              <label className="block text-sm font-medium text-foreground mb-1">
                {label}
                {required && <span className="text-error ml-1">*</span>}
              </label>
            )}

            {description && (
              <p className="text-sm text-muted-foreground mb-2">{description}</p>
            )}

            <div className="flex flex-wrap gap-2">
              {options.map((option) => {
                const isSelected = selectedValues.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleValue(option.value)}
                    disabled={disabled}
                    className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-foreground border-border hover:border-primary/50"
                    } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    {option.label}
                  </button>
                );
              })}

              {customTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleValue(tag)}
                  disabled={disabled}
                  className="px-3 py-1.5 text-sm rounded-full border bg-primary text-primary-foreground border-primary flex items-center gap-1"
                >
                  {tag}
                  <span className="text-xs">×</span>
                </button>
              ))}
            </div>

            {allowCustom && (
              <div className="flex gap-2 mt-3">
                <input
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomTag())}
                  placeholder="Add custom amenity..."
                  disabled={disabled}
                  className="input flex-1 text-sm"
                />
                <button
                  type="button"
                  onClick={addCustomTag}
                  disabled={disabled || !customInput.trim()}
                  className="btn-secondary text-sm disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            )}

            <FormError message={fieldState.error?.message} />
          </div>
        );
      }}
    />
  );
}

