/**
 * AdditionalCostsEditor - Shared controlled component for editing additional costs.
 * Used by both property and experience forms/edit views.
 */

import { cn } from "@/modules/utils/cn";
import { AddRowButton, RemoveRowButton } from "./ListEditorButtons";

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
  showErrors?: boolean;
}

function getRowErrors<P extends string>(row: CostRow<P>): string[] {
  const errors: string[] = [];
  if (!row.label.trim()) errors.push("Label is required");
  if (row.amount <= 0) errors.push("Amount must be greater than 0");
  return errors;
}

export function validateAdditionalCosts<P extends string>(
  costs: CostRow<P>[]
): string | null {
  for (let i = 0; i < costs.length; i++) {
    const errors = getRowErrors(costs[i]);
    if (errors.length > 0) return `Row ${i + 1}: ${errors.join(", ")}`;
  }
  return null;
}

export function AdditionalCostsEditor<P extends string>({
  costs,
  perOptions,
  showMaxNights = false,
  onChange,
  disabled = false,
  showErrors = false,
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
      {costs.map((row, index) => {
        const errors = showErrors ? getRowErrors(row) : [];
        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: cost rows have no stable ID
          <div key={index} className="space-y-1">
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  value={row.label}
                  onChange={(e) => updateRow(index, { label: e.target.value })}
                  disabled={disabled}
                  placeholder="Cost label"
                  className={cn(
                    "input w-full",
                    disabled && "opacity-50",
                    showErrors && !row.label.trim() && "border-error"
                  )}
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
                  className={cn(
                    "input w-full",
                    disabled && "opacity-50",
                    showErrors && row.amount <= 0 && "border-error"
                  )}
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

              <RemoveRowButton onClick={() => removeRow(index)} disabled={disabled} />
            </div>
            {errors.length > 0 && (
              <p className="text-xs text-error">{errors.join(". ")}</p>
            )}
          </div>
        );
      })}

      <AddRowButton onClick={addRow} disabled={disabled} label="Add cost" />
    </div>
  );
}
