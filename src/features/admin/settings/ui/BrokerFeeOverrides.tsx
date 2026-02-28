import {
  useBrokerFees,
  useBrokers,
  useDeleteBrokerFee,
  useUpsertBrokerFee,
} from "@/features/admin/settings/queries/useBrokerFees";
import { cn } from "@/modules/utils/cn";
import { showError } from "@/modules/ui/react/stores/notificationStore";
import { SearchableDropdown } from "@luciodale/react-searchable-dropdown";
import { ChevronDown, Pencil, Trash2, X } from "lucide-react";
import { useState } from "react";

type EditingRow = {
  userId: string;
  feePercent: string;
};

export function BrokerFeeOverrides() {
  const { data: overrides, isLoading } = useBrokerFees();
  const { data: brokers } = useBrokers();
  const upsertMutation = useUpsertBrokerFee();
  const deleteMutation = useDeleteBrokerFee();

  const [selectedBroker, setSelectedBroker] = useState<
    { value: string; label: string } | undefined
  >(undefined);
  const [newFee, setNewFee] = useState("");
  const [editing, setEditing] = useState<EditingRow | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const brokerOptions = (brokers ?? []).map((b) => ({
    value: b.id,
    label: b.name ? `${b.name} (${b.email})` : b.email,
  }));

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedBroker) return;
    const n = Number(newFee);
    if (!Number.isInteger(n) || n < 0 || n > 100) {
      showError("Fee must be a whole number between 0 and 100");
      return;
    }
    upsertMutation.mutate(
      { userId: selectedBroker.value, feePercent: n },
      {
        onSuccess: () => {
          setSelectedBroker(undefined);
          setNewFee("");
        },
      }
    );
  }

  function handleEditSave(userId: string) {
    if (!editing) return;
    const n = Number(editing.feePercent);
    if (!Number.isInteger(n) || n < 0 || n > 100) {
      showError("Fee must be a whole number between 0 and 100");
      return;
    }
    upsertMutation.mutate(
      { userId, feePercent: n },
      { onSuccess: () => setEditing(null) }
    );
  }

  function handleDelete(userId: string) {
    deleteMutation.mutate(
      { userId },
      { onSuccess: () => setConfirmDelete(null) }
    );
  }

  return (
    <div className="mt-14">
      <h2 className="text-lg font-semibold mb-2">Broker Fee Overrides</h2>
      <p className="text-sm text-muted-foreground mb-8">
        Set a custom application fee for specific brokers. Overrides the default
        10%.
      </p>

      {/* Add override form */}
      <form
        onSubmit={handleAdd}
        className="flex flex-wrap items-end gap-4 mb-10"
      >
        <div className="w-full sm:w-72">
          <span className="block text-sm font-medium text-foreground mb-1.5">
            Broker
          </span>
          <SearchableDropdown
            options={brokerOptions}
            value={selectedBroker}
            setValue={setSelectedBroker}
            searchOptionKeys={["label"]}
            placeholder="Search broker..."
            classNameSearchableDropdownContainer="relative"
            classNameSearchQueryInput="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary pr-9"
            classNameDropdownOptions="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden"
            classNameDropdownOption="px-3 py-2 text-sm text-foreground cursor-pointer"
            classNameDropdownOptionFocused="bg-secondary"
            classNameDropdownOptionNoMatch="px-3 py-2 text-sm text-muted-foreground"
            DropdownIcon={({ toggled }: { toggled: boolean }) => (
              <ChevronDown
                className={cn(
                  "w-4 h-4 shrink-0 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-transform",
                  toggled && "rotate-180"
                )}
              />
            )}
          />
        </div>
        <div className="w-28">
          <label
            htmlFor="broker-fee-input"
            className="block text-sm font-medium text-foreground mb-1.5"
          >
            Fee %
          </label>
          <input
            id="broker-fee-input"
            type="number"
            min={0}
            max={100}
            step={1}
            value={newFee}
            onChange={(e) => setNewFee(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button
          type="submit"
          disabled={!selectedBroker || !newFee || upsertMutation.isPending}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {upsertMutation.isPending ? "Saving..." : "Add Override"}
        </button>
      </form>

      {/* Overrides table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-primary" />
        </div>
      ) : !overrides?.length ? (
        <p className="text-sm text-muted-foreground">
          No broker-specific overrides set.
        </p>
      ) : (
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-3 pr-4 font-medium text-muted-foreground">
                  Broker
                </th>
                <th className="pb-3 pr-4 font-medium text-muted-foreground">
                  Fee %
                </th>
                <th className="pb-3 font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {overrides.map((row) => (
                <tr key={row.userId} className="border-b border-border/50">
                  <td className="py-4 pr-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                      <span className="font-medium">{row.name ?? "—"}</span>
                      <span className="text-muted-foreground text-xs sm:text-sm">
                        {row.email}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 pr-4">
                    {editing?.userId === row.userId ? (
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={1}
                        value={editing.feePercent}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            feePercent: e.target.value,
                          })
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleEditSave(row.userId);
                          if (e.key === "Escape") setEditing(null);
                        }}
                        className="w-20 rounded-md border border-border bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    ) : (
                      `${row.feePercent}%`
                    )}
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      {editing?.userId === row.userId ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleEditSave(row.userId)}
                            disabled={upsertMutation.isPending}
                            className="rounded px-2 py-1 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditing(null)}
                            className="rounded px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : confirmDelete === row.userId ? (
                        <>
                          <span className="text-xs text-muted-foreground">
                            Are you sure?
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDelete(row.userId)}
                            disabled={deleteMutation.isPending}
                            className="rounded px-2 py-1 text-xs font-medium bg-error text-error-foreground hover:bg-error/90 disabled:opacity-50"
                          >
                            Yes
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDelete(null)}
                            className="rounded px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                          >
                            No
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              setEditing({
                                userId: row.userId,
                                feePercent: String(row.feePercent),
                              })
                            }
                            className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-secondary"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDelete(row.userId)}
                            className="rounded p-1 text-muted-foreground hover:text-error hover:bg-secondary"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
