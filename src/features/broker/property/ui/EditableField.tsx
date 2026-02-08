/**
 * EditableField - Generic inline editable field with save button
 * Per-field update pattern for edit mode
 */

import {
  displayToKebab,
  kebabToDisplay,
} from "@/features/broker/property/domain/sync-features";
import { Select } from "@/modules/ui/Select";
import { cn } from "@/modules/utils/cn";
import { getErrorMessages } from "@/modules/utils/errors";
import { Check, Loader2 } from "lucide-react";
import { type ReactNode, useState } from "react";

interface EditableFieldProps<T> {
  label: string;
  value: T;
  onSave: (value: T) => Promise<void>;
  renderInput: (props: {
    value: T;
    onChange: (value: T) => void;
    disabled: boolean;
  }) => ReactNode;
  description?: string;
  className?: string;
}

export function EditableField<T>({
  label,
  value,
  onSave,
  renderInput,
  description,
  className,
}: EditableFieldProps<T>) {
  const [localValue, setLocalValue] = useState<T>(value);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const hasChanges = JSON.stringify(localValue) !== JSON.stringify(value);

  const handleSave = async () => {
    if (!hasChanges) return;

    setIsSaving(true);
    setErrors([]);

    try {
      await onSave(localValue);
    } catch (err) {
      setErrors(getErrorMessages(err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={cn("group", className)}>
      <div className="flex items-center justify-between mb-1">
        <span className="block text-sm font-medium text-foreground">
          {label}
        </span>
      </div>

      {description && (
        <p className="text-sm text-muted-foreground mb-2">{description}</p>
      )}

      <div className="flex items-start gap-3">
        <div className="flex-1">
          {renderInput({
            value: localValue,
            onChange: setLocalValue,
            disabled: isSaving,
          })}
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className={cn(
            "p-4 rounded-lg border border-border transition-all duration-200",
            hasChanges
              ? "bg-primary text-primary-foreground hover:bg-primary-hover shadow-md"
              : "bg-secondary text-muted-foreground cursor-not-allowed opacity-50"
          )}
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
        </button>
      </div>

      {errors.length > 0 && (
        <div className="mt-2 space-y-1">
          {errors.map((error) => (
            <p key={error} className="text-sm text-error">
              {error}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

/** Text input variant */
export function EditableTextField({
  label,
  value,
  onSave,
  description,
  placeholder,
  maxLength,
  className,
}: {
  label: string;
  value: string;
  onSave: (value: string) => Promise<void>;
  description?: string;
  placeholder?: string;
  maxLength?: number;
  className?: string;
}) {
  return (
    <EditableField
      label={label}
      value={value}
      onSave={onSave}
      description={description}
      className={className}
      renderInput={({ value, onChange, disabled }) => (
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          maxLength={maxLength}
          className={cn("input", disabled && "opacity-50")}
        />
      )}
    />
  );
}

/** Textarea variant */
export function EditableTextareaField({
  label,
  value,
  onSave,
  description,
  placeholder,
  rows = 4,
  maxLength,
  className,
}: {
  label: string;
  value: string;
  onSave: (value: string) => Promise<void>;
  description?: string;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  className?: string;
}) {
  return (
    <EditableField
      label={label}
      value={value}
      onSave={onSave}
      description={description}
      className={className}
      renderInput={({ value, onChange, disabled }) => (
        <textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          rows={rows}
          maxLength={maxLength}
          className={cn("input resize-none", disabled && "opacity-50")}
        />
      )}
    />
  );
}

/** Number input variant */
export function EditableNumberField({
  label,
  value,
  onSave,
  description,
  placeholder,
  min,
  max,
  className,
}: {
  label: string;
  value: number | undefined;
  onSave: (value: number | undefined) => Promise<void>;
  description?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  className?: string;
}) {
  return (
    <EditableField
      label={label}
      value={value}
      onSave={onSave}
      description={description}
      className={className}
      renderInput={({ value, onChange, disabled }) => (
        <input
          type="number"
          value={value ?? ""}
          onChange={(e) => {
            const val =
              e.target.value === "" ? undefined : Number(e.target.value);
            onChange(val);
          }}
          disabled={disabled}
          placeholder={placeholder}
          min={min}
          max={max}
          className={cn("input", disabled && "opacity-50")}
        />
      )}
    />
  );
}

/** Select variant */
export function EditableSelectField({
  label,
  value,
  onSave,
  options,
  description,
  className,
}: {
  label: string;
  value: string;
  onSave: (value: string) => Promise<void>;
  options: Array<{ value: string; label: string }>;
  description?: string;
  className?: string;
}) {
  return (
    <EditableField
      label={label}
      value={value}
      onSave={onSave}
      description={description}
      className={className}
      renderInput={({ value, onChange, disabled }) => (
        <Select
          value={value || ""}
          onChange={onChange}
          options={options}
          disabled={disabled}
        />
      )}
    />
  );
}

/** Tags/array variant */
export function EditableTagsField({
  label,
  value,
  onSave,
  options,
  description,
  allowCustom = true,
  className,
}: {
  label: string;
  value: string[];
  onSave: (value: string[]) => Promise<void>;
  options: Array<{ value: string; label: string }>;
  description?: string;
  allowCustom?: boolean;
  className?: string;
}) {
  const [customInput, setCustomInput] = useState("");
  const optionValues = new Set(options.map((o) => o.value));

  return (
    <EditableField
      label={label}
      value={value}
      onSave={onSave}
      description={description}
      className={className}
      renderInput={({ value: selectedValues, onChange, disabled }) => {
        const customTags = selectedValues.filter((v) => !optionValues.has(v));

        const toggleValue = (val: string) => {
          if (disabled) return;
          const newValues = selectedValues.includes(val)
            ? selectedValues.filter((v) => v !== val)
            : [...selectedValues, val];
          onChange(newValues);
        };

        const addCustomTag = () => {
          const trimmed = customInput.trim().toLowerCase().replace(/\s+/g, "-");
          if (!trimmed || selectedValues.includes(trimmed)) return;
          onChange([...selectedValues, trimmed]);
          setCustomInput("");
        };

        return (
          <div>
            <div className="flex flex-wrap gap-2">
              {options.map((option) => {
                const isSelected = selectedValues.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleValue(option.value)}
                    disabled={disabled}
                    className={cn(
                      "px-3 py-1.5 text-sm rounded-full border transition-colors",
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-foreground border-border hover:border-primary/50",
                      disabled
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    )}
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
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomTag();
                    }
                  }}
                  placeholder="Add custom..."
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
          </div>
        );
      }}
    />
  );
}

/** Section variant - for saving multiple fields together */
interface EditableSectionFieldProps<T extends Record<string, unknown>> {
  title: string;
  values: T;
  onSave: (values: T) => Promise<void>;
  renderFields: (props: {
    values: T;
    onChange: (values: T) => void;
    disabled: boolean;
  }) => ReactNode;
  description?: string;
  headerAction?: ReactNode;
  className?: string;
}

export function EditableSectionField<T extends Record<string, unknown>>({
  title,
  values,
  onSave,
  renderFields,
  description,
  headerAction,
  className,
}: EditableSectionFieldProps<T>) {
  const [localValues, setLocalValues] = useState<T>(values);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const hasChanges = JSON.stringify(localValues) !== JSON.stringify(values);

  const handleSave = async () => {
    if (!hasChanges) return;

    setIsSaving(true);
    setErrors([]);

    try {
      await onSave(localValues);
    } catch (err) {
      setErrors(getErrorMessages(err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={cn("group", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          {headerAction}
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className={cn(
            "px-4 py-2 rounded-lg border border-border transition-all duration-200 flex items-center gap-2",
            hasChanges
              ? "bg-primary text-primary-foreground hover:bg-primary-hover shadow-md"
              : "bg-secondary text-muted-foreground cursor-not-allowed opacity-50"
          )}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              {hasChanges ? "Save Section" : "Saved"}
            </>
          )}
        </button>
      </div>

      {description && (
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
      )}

      {renderFields({
        values: localValues,
        onChange: setLocalValues,
        disabled: isSaving,
      })}

      {errors.length > 0 && (
        <div className="mt-4 p-3 rounded-lg bg-error/10 border border-error/20">
          <div className="space-y-1">
            {errors.map((error) => (
              <p key={error} className="text-sm text-error">
                {error}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** Feature Group variant - for amenities/highlights/views with syncing */
interface EditableFeatureGroupFieldProps {
  amenities: string[];
  highlights: string[];
  views: string[];
  onSave: (data: {
    amenities: string[];
    highlights: string[];
    views: string[];
  }) => Promise<void>;
  highlightsOptions: Array<{ value: string }>;
  amenitiesOptions: Array<{ value: string }>;
  viewsOptions: Array<{ value: string }>;
  className?: string;
}

export function EditableFeatureGroupField({
  amenities,
  highlights,
  views,
  onSave,
  amenitiesOptions,
  highlightsOptions,
  viewsOptions,
  className,
}: EditableFeatureGroupFieldProps) {
  return (
    <EditableSectionField
      title="Features & Amenities"
      values={{ amenities, highlights, views }}
      onSave={onSave}
      className={className}
      description="Items are unique across all categories - adding to one removes from others"
      renderFields={({ values, onChange, disabled }) => {
        const syncedOnChange = (
          fieldName: "amenities" | "highlights" | "views",
          newValue: string[]
        ) => {
          if (disabled) return;

          // Find items added in this change
          const addedItems = newValue.filter(
            (v) => !values[fieldName].includes(v)
          );

          // Start with the updated field
          const updated = { ...values, [fieldName]: newValue };

          // Remove newly added items from the other two fields
          const otherFields = (
            ["amenities", "highlights", "views"] as const
          ).filter((f) => f !== fieldName);

          for (const field of otherFields) {
            updated[field] = updated[field].filter(
              (v) => !addedItems.includes(v)
            );
          }

          onChange(updated);
        };

        return (
          <div className="space-y-6">
            {/* Amenities */}
            <div>
              <div className="block text-sm font-medium text-foreground mb-3">
                Property Amenities
              </div>
              <TagsInput
                value={values.amenities}
                onChange={(newValue) => syncedOnChange("amenities", newValue)}
                options={amenitiesOptions}
                disabled={disabled}
              />
            </div>

            {/* Highlights */}
            <div>
              <div className="block text-sm font-medium text-foreground mb-3">
                Signature Highlights
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Key features that make this property special
              </p>
              <TagsInput
                value={values.highlights}
                onChange={(newValue) => syncedOnChange("highlights", newValue)}
                options={highlightsOptions}
                disabled={disabled}
              />
            </div>

            {/* Views */}
            <div>
              <div className="block text-sm font-medium text-foreground mb-3">
                Panoramic Views
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Views available from the property
              </p>
              <TagsInput
                value={values.views}
                onChange={(newValue) => syncedOnChange("views", newValue)}
                options={viewsOptions}
                disabled={disabled}
              />
            </div>
          </div>
        );
      }}
    />
  );
}

/** Internal TagsInput component for EditableFeatureGroupField */
function TagsInput({
  value,
  onChange,
  options,
  disabled,
}: {
  value: string[];
  onChange: (value: string[]) => void;
  options: Array<{ value: string }>;
  disabled: boolean;
}) {
  const [customInput, setCustomInput] = useState("");
  const optionValues = new Set(options.map((o) => o.value));
  const customTags = value.filter((v) => !optionValues.has(v));

  const toggleValue = (val: string) => {
    if (disabled) return;
    const newValues = value.includes(val)
      ? value.filter((v) => v !== val)
      : [...value, val];
    onChange(newValues);
  };

  const addCustomTag = () => {
    if (disabled) return;
    const kebabTag = displayToKebab(customInput);
    if (!kebabTag || value.includes(kebabTag)) return;
    onChange([...value, kebabTag]);
    setCustomInput("");
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = value.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => toggleValue(option.value)}
              disabled={disabled}
              className={cn(
                "px-3 py-1.5 text-sm rounded-full border transition-colors",
                isSelected
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-foreground border-border hover:border-primary/50",
                disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              )}
            >
              {kebabToDisplay(option.value)}
            </button>
          );
        })}

        {customTags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => toggleValue(tag)}
            disabled={disabled}
            className={cn(
              "px-3 py-1.5 text-sm rounded-full border bg-primary text-primary-foreground border-primary flex items-center gap-1",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {kebabToDisplay(tag)}
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
          placeholder="Add custom..."
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
    </div>
  );
}
