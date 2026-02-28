import { BrokerFeeOverrides } from "@/features/admin/settings/ui/BrokerFeeOverrides";
import {
  usePlatformSettings,
  useUpdateSetting,
} from "@/features/admin/settings/queries/useSettings";
import { showError } from "@/modules/ui/react/stores/notificationStore";
import { useEffect, useState } from "react";

export function PlatformSettingsView() {
  const { data: settings, isLoading } = usePlatformSettings();
  const updateMutation = useUpdateSetting();
  const [feePercent, setFeePercent] = useState("");

  useEffect(() => {
    if (settings?.application_fee_percent != null) {
      setFeePercent(settings.application_fee_percent);
    }
  }, [settings]);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const n = Number(feePercent);
    if (!Number.isInteger(n) || n < 0 || n > 100) {
      showError("Fee must be a whole number between 0 and 100");
      return;
    }
    updateMutation.mutate({
      key: "application_fee_percent",
      value: String(n),
    });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-10 px-6">
      <h1 className="text-2xl font-semibold mb-8">Platform Settings</h1>
      <form onSubmit={handleSave} className="space-y-5">
        <div>
          <label
            htmlFor="fee-percent"
            className="block text-sm font-medium text-foreground mb-1.5"
          >
            Application Fee (%)
          </label>
          <p className="text-sm text-muted-foreground mb-3">
            Percentage of each booking total retained by the platform. The
            remainder goes to the broker.
          </p>
          <input
            id="fee-percent"
            type="number"
            min={0}
            max={100}
            step={1}
            value={feePercent}
            onChange={(e) => setFeePercent(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {updateMutation.isPending ? "Saving..." : "Save"}
        </button>
      </form>

      <BrokerFeeOverrides />
    </div>
  );
}
