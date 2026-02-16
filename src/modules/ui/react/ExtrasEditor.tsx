import type { PropertyExtra } from "@/features/public/booking/domain/pricingTypes";
import { cn } from "@/modules/utils/cn";
import { Plus, Trash2 } from "lucide-react";
import { IconPicker } from "./IconPicker";

const perOptions = [
  { value: "stay", label: "Per Stay" },
  { value: "night", label: "Per Night" },
  { value: "guest", label: "Per Guest" },
  { value: "night_per_guest", label: "Per Night Per Guest" },
] as const;

interface ExtrasEditorProps {
  extras: PropertyExtra[];
  onChange: (extras: PropertyExtra[]) => void;
  disabled?: boolean;
}

export function ExtrasEditor({
  extras,
  onChange,
  disabled = false,
}: ExtrasEditorProps) {
  function addRow() {
    onChange([
      ...extras,
      { name: "", icon: "", amount: 0, per: "stay" },
    ]);
  }

  function removeRow(index: number) {
    onChange(extras.filter((_, i) => i !== index));
  }

  function updateRow(index: number, patch: Partial<PropertyExtra>) {
    onChange(extras.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  return (
    <div className="space-y-3">
      {extras.map((row, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: extras have no stable ID
        <div key={index} className="flex items-start gap-3">
          <div className="w-36">
            <IconPicker
              value={row.icon}
              onChange={(icon) => updateRow(index, { icon })}
              disabled={disabled}
            />
          </div>

          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={row.name}
              onChange={(e) => updateRow(index, { name: e.target.value })}
              disabled={disabled}
              placeholder="Extra name"
              className={cn("input w-full", disabled && "opacity-50")}
            />
          </div>

          <div className="w-28">
            <input
              type="number"
              value={row.amount || ""}
              onChange={(e) =>
                updateRow(index, {
                  amount: e.target.value === "" ? 0 : Number(e.target.value),
                })
              }
              disabled={disabled}
              placeholder="Cents"
              min={0}
              className={cn("input w-full", disabled && "opacity-50")}
            />
          </div>

          <div className="w-44">
            <select
              value={row.per}
              onChange={(e) =>
                updateRow(index, {
                  per: e.target.value as PropertyExtra["per"],
                })
              }
              disabled={disabled}
              className={cn("input w-full", disabled && "opacity-50")}
            >
              {perOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {row.per === "night_per_guest" && (
            <div className="w-28">
              <input
                type="number"
                value={row.maxNights ?? ""}
                onChange={(e) =>
                  updateRow(index, {
                    maxNights:
                      e.target.value === ""
                        ? undefined
                        : Number(e.target.value),
                  })
                }
                disabled={disabled}
                placeholder="Max nights"
                min={1}
                className={cn("input w-full", disabled && "opacity-50")}
              />
            </div>
          )}

          <button
            type="button"
            onClick={() => removeRow(index)}
            disabled={disabled}
            className="p-2.5 rounded-lg border border-border text-muted-foreground hover:text-error hover:border-error/50 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addRow}
        disabled={disabled}
        className="flex items-center gap-2 text-sm text-primary hover:text-primary-hover transition-colors disabled:opacity-50"
      >
        <Plus className="w-4 h-4" />
        Add extra
      </button>
    </div>
  );
}
