/**
 * AdditionalCostsEditor - Shared controlled component for editing additional costs.
 * Used by both property and experience forms/edit views.
 */

import { cn } from "@/modules/utils/cn";
import { Plus, Trash2 } from "lucide-react";

interface CostRow<P extends string = string> {
  label: string;
  amount: number;
  per: P;
  maxNights?: number;
}

interface PerOption<P extends string> {
  value: P;
  label: string;
}

interface AdditionalCostsEditorProps<P extends string> {
  costs: CostRow<P>[];
  perOptions: PerOption<P>[];
  showMaxNights?: boolean;
  onChange: (costs: CostRow<P>[]) => void;
  disabled?: boolean;
}

export function AdditionalCostsEditor<P extends string>({
  costs,
  perOptions,
  showMaxNights = false,
  onChange,
  disabled = false,
}: AdditionalCostsEditorProps<P>) {
  function addRow() {
    onChange([
      ...costs,
      { label: "", amount: 0, per: perOptions[0].value },
    ]);
  }

  function removeRow(index: number) {
    onChange(costs.filter((_, i) => i !== index));
  }

  function updateRow(index: number, patch: Partial<CostRow<P>>) {
    onChange(costs.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  return (
    <div className="space-y-3">
      {costs.map((row, index) => (
        <div key={index} className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={row.label}
              onChange={(e) => updateRow(index, { label: e.target.value })}
              disabled={disabled}
              placeholder="Cost label"
              className={cn("input w-full", disabled && "opacity-50")}
            />
          </div>

          <div className="w-32">
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
              onChange={(e) => updateRow(index, { per: e.target.value as P })}
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

          {showMaxNights && row.per === "night_per_guest" && (
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
        Add cost
      </button>
    </div>
  );
}
