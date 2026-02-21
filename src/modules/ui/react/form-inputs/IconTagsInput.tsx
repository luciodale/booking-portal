/**
 * IconTagsInput - Multi-select tags with icons + custom input with icon picker
 */

import type { Feature } from "@/modules/constants";
import { kebabToDisplay } from "@/features/broker/property/domain/sync-features";
import { IconTextInput } from "@/modules/ui/react/form-inputs/IconTextInput";
import { cn } from "@/modules/utils/cn";
import { type LucideIcon, icons } from "lucide-react";
import { type ReactNode, useState } from "react";
import {
  type Control,
  Controller,
  type FieldValues,
  type Path,
} from "react-hook-form";

/** Resolve a kebab-case or PascalCase icon name to a lucide component */
function resolveIcon(name: string): LucideIcon | undefined {
  // Direct match (PascalCase from IconPicker)
  if (name in icons) return icons[name as keyof typeof icons];
  // Convert kebab-case → PascalCase ("chef-hat" → "ChefHat")
  const pascal = name
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
  return icons[pascal as keyof typeof icons];
}

interface IconTagsInputProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  description?: string;
  required?: boolean;
  defaultOptions: Array<{ value: string; icon: string }>;
  onChangeOverride?: (newValue: Feature[]) => void;
  labelSuffix?: ReactNode;
}

export function IconTagsInput<T extends FieldValues>({
  name,
  control,
  label,
  description,
  required,
  defaultOptions,
  onChangeOverride,
  labelSuffix,
}: IconTagsInputProps<T>) {
  const [customName, setCustomName] = useState("");
  const [customIcon, setCustomIcon] = useState("check");
  const defaultIds = new Set(defaultOptions.map((o) => o.value));

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const features: Feature[] = (field.value as Feature[]) || [];

        const handleChange = (newValue: Feature[]) => {
          if (onChangeOverride) {
            onChangeOverride(newValue);
          } else {
            field.onChange(newValue);
          }
        };

        const toggleDefault = (optValue: string, optIcon: string) => {
          const exists = features.some((f) => f.name === optValue);
          const newFeatures = exists
            ? features.filter((f) => f.name !== optValue)
            : [...features, { name: optValue, icon: optIcon }];
          handleChange(newFeatures);
        };

        const removeFeature = (featureName: string) => {
          handleChange(features.filter((f) => f.name !== featureName));
        };

        const addCustom = () => {
          const kebab = customName
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "");
          if (!kebab || features.some((f) => f.name === kebab)) return;
          if (defaultIds.has(kebab)) return;
          handleChange([...features, { name: kebab, icon: customIcon }]);
          setCustomName("");
          setCustomIcon("check");
        };

        const customFeatures = features.filter((f) => !defaultIds.has(f.name));

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

            {/* Default option pills */}
            <div className="flex flex-wrap gap-2">
              {defaultOptions.map((opt) => {
                const isSelected = features.some((f) => f.name === opt.value);
                const Icon = resolveIcon(opt.icon);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleDefault(opt.value, opt.icon)}
                    className={cn(
                      "px-3 py-1.5 text-sm rounded-full border transition-colors cursor-pointer inline-flex items-center gap-1.5",
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-foreground border-border hover:border-primary/50"
                    )}
                  >
                    {Icon && <Icon className="w-3.5 h-3.5" />}
                    {kebabToDisplay(opt.value)}
                  </button>
                );
              })}

              {/* Custom tags */}
              {customFeatures.map((feat) => {
                const Icon = resolveIcon(feat.icon);
                return (
                  <button
                    key={feat.name}
                    type="button"
                    onClick={() => removeFeature(feat.name)}
                    className="px-3 py-1.5 text-sm rounded-full border bg-primary text-primary-foreground border-primary flex items-center gap-1.5"
                  >
                    {Icon && <Icon className="w-3.5 h-3.5" />}
                    {kebabToDisplay(feat.name)}
                    <span className="text-xs">×</span>
                  </button>
                );
              })}
            </div>

            {/* Custom tag input with icon picker */}
            <IconTextInput
              textValue={customName}
              iconValue={customIcon}
              onTextChange={setCustomName}
              onIconChange={setCustomIcon}
              onAdd={addCustom}
              placeholder="Add custom tag..."
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
