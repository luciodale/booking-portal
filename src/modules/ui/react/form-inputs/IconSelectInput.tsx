/**
 * IconSelectInput - Single-select category picker with icons
 * CategoryPicker: stateless presentational component
 * IconSelectInput: react-hook-form wrapper
 */

import { kebabToDisplay } from "@/features/broker/property/domain/sync-features";
import { IconTextInput } from "@/modules/ui/react/form-inputs/IconTextInput";
import { cn } from "@/modules/utils/cn";
import { type LucideIcon, icons } from "lucide-react";
import { useState } from "react";
import {
  type Control,
  type FieldValues,
  type Path,
  useController,
} from "react-hook-form";

function resolveIcon(name: string): LucideIcon | undefined {
  if (name in icons) return icons[name as keyof typeof icons];
  const pascal = name
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
  return icons[pascal as keyof typeof icons];
}

interface CategoryOption {
  value: string;
  label: string;
  icon: string;
}

interface CategoryPickerProps {
  category: string;
  categoryIcon: string;
  onChange: (category: string, icon: string) => void;
  disabled?: boolean;
  defaultOptions: CategoryOption[];
}

export function CategoryPicker({
  category,
  categoryIcon,
  onChange,
  disabled = false,
  defaultOptions,
}: CategoryPickerProps) {
  const [showCustom, setShowCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customIcon, setCustomIcon] = useState("check");

  const defaultIds = new Set(defaultOptions.map((o) => o.value));
  const isCustomSelection = category && !defaultIds.has(category);

  function selectDefault(opt: CategoryOption) {
    if (disabled) return;
    // Toggle off if already selected
    if (category === opt.value) {
      onChange("", "");
    } else {
      onChange(opt.value, "");
    }
    setShowCustom(false);
  }

  function addCustom() {
    const kebab = customName
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    if (!kebab || defaultIds.has(kebab)) return;
    onChange(kebab, customIcon);
    setCustomName("");
    setCustomIcon("check");
    setShowCustom(false);
  }

  function clearCustom() {
    if (disabled) return;
    onChange("", "");
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {defaultOptions.map((opt) => {
          const isSelected = category === opt.value;
          const Icon = resolveIcon(opt.icon);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => selectDefault(opt)}
              disabled={disabled}
              className={cn(
                "px-3 py-1.5 text-sm rounded-full border transition-colors inline-flex items-center gap-1.5",
                isSelected
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-foreground border-border hover:border-primary/50",
                disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              )}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              {opt.label}
            </button>
          );
        })}

        {/* Custom selection pill */}
        {isCustomSelection && (
          <button
            type="button"
            onClick={clearCustom}
            disabled={disabled}
            className={cn(
              "px-3 py-1.5 text-sm rounded-full border bg-primary text-primary-foreground border-primary flex items-center gap-1.5",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {(() => {
              const Icon = resolveIcon(categoryIcon);
              return Icon ? <Icon className="w-3.5 h-3.5" /> : null;
            })()}
            {kebabToDisplay(category)}
            <span className="text-xs">×</span>
          </button>
        )}

        {/* Add custom button */}
        <button
          type="button"
          onClick={() => setShowCustom(!showCustom)}
          disabled={disabled}
          className={cn(
            "px-3 py-1.5 text-sm rounded-full border transition-colors inline-flex items-center gap-1.5",
            showCustom
              ? "bg-secondary text-foreground border-primary/50"
              : "bg-card text-muted-foreground border-border hover:border-primary/50",
            disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
          )}
        >
          +
        </button>
      </div>

      {showCustom && (
        <IconTextInput
          textValue={customName}
          iconValue={customIcon}
          onTextChange={setCustomName}
          onIconChange={setCustomIcon}
          onAdd={addCustom}
          disabled={disabled}
          placeholder="Custom category name..."
        />
      )}
    </div>
  );
}

interface IconSelectInputProps<T extends FieldValues> {
  categoryName: Path<T>;
  iconName: Path<T>;
  control: Control<T>;
  label: string;
  required?: boolean;
  defaultOptions: CategoryOption[];
}

export function IconSelectInput<T extends FieldValues>({
  categoryName,
  iconName,
  control,
  label,
  required,
  defaultOptions,
}: IconSelectInputProps<T>) {
  const categoryCtrl = useController({ name: categoryName, control });
  const iconCtrl = useController({ name: iconName, control });

  return (
    <div className="mb-4">
      <span className="block text-sm font-medium text-foreground mb-1">
        {label}
        {required && <span className="text-error ml-1">*</span>}
      </span>

      <CategoryPicker
        category={(categoryCtrl.field.value as string) ?? ""}
        categoryIcon={(iconCtrl.field.value as string) ?? ""}
        onChange={(cat, icon) => {
          categoryCtrl.field.onChange(cat);
          iconCtrl.field.onChange(icon);
        }}
        defaultOptions={defaultOptions}
      />

      {categoryCtrl.fieldState.error && (
        <p className="text-sm text-error mt-1">
          {categoryCtrl.fieldState.error.message}
        </p>
      )}
    </div>
  );
}
