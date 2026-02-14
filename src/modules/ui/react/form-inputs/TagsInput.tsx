/**
 * TagsInput - Multi-select tags with custom input
 */

import { cn } from "@/modules/utils/cn";
import { useState } from "react";
import { type Control, Controller, type FieldValues, type Path } from "react-hook-form";

interface TagsInputProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  required?: boolean;
  description?: string;
  options: Array<{ value: string }>;
  /** Optional override for change handling (e.g., for synced fields) */
  onChangeOverride?: (newValue: string[]) => void;
  /** Convert kebab-case to display format */
  formatDisplay?: (value: string) => string;
  /** Convert display format to kebab-case */
  formatValue?: (value: string) => string;
  labelSuffix?: React.ReactNode;
}

/** Default kebab-to-display conversion */
const defaultFormatDisplay = (value: string) =>
  value
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

/** Default display-to-kebab conversion */
const defaultFormatValue = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

export function TagsInput<T extends FieldValues>({
  name,
  control,
  label,
  required,
  description,
  options,
  onChangeOverride,
  formatDisplay = defaultFormatDisplay,
  formatValue = defaultFormatValue,
  labelSuffix,
}: TagsInputProps<T>) {
  const [customInput, setCustomInput] = useState("");
  const optionValues = new Set(options.map((o) => o.value));

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const selectedValues: string[] = (field.value as string[]) || [];
        const customTags = selectedValues.filter((v) => !optionValues.has(v));

        const handleChange = (newValues: string[]) => {
          if (onChangeOverride) {
            onChangeOverride(newValues);
          } else {
            field.onChange(newValues);
          }
        };

        const toggleValue = (value: string) => {
          const newValues = selectedValues.includes(value)
            ? selectedValues.filter((v) => v !== value)
            : [...selectedValues, value];
          handleChange(newValues);
        };

        const addCustomTag = () => {
          const kebabTag = formatValue(customInput);
          if (!kebabTag || selectedValues.includes(kebabTag)) return;
          handleChange([...selectedValues, kebabTag]);
          setCustomInput("");
        };

        return (
          <div className="mb-4">
            <span className="block text-sm font-medium text-foreground mb-1">
              {label}
              {required && <span className="text-error ml-1">*</span>}
              {labelSuffix}
            </span>
            {description && (
              <p className="text-sm text-muted-foreground mb-2">
                {description}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              {options.map((option) => {
                const isSelected = selectedValues.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleValue(option.value)}
                    className={cn(
                      "px-3 py-1.5 text-sm rounded-full border transition-colors cursor-pointer",
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-foreground border-border hover:border-primary/50"
                    )}
                  >
                    {formatDisplay(option.value)}
                  </button>
                );
              })}

              {customTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleValue(tag)}
                  className="px-3 py-1.5 text-sm rounded-full border bg-primary text-primary-foreground border-primary flex items-center gap-1"
                >
                  {formatDisplay(tag)}
                  <span className="text-xs">×</span>
                </button>
              ))}
            </div>

            <div className="flex gap-2 mt-3">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomTag();
                  }
                }}
                placeholder="Add custom tag..."
                className="input flex-1 text-sm"
              />
              <button
                type="button"
                onClick={addCustomTag}
                disabled={!customInput.trim()}
                className="btn-secondary text-sm disabled:opacity-50"
              >
                Add
              </button>
            </div>

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

