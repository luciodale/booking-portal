import { BrokerFeeOverrides } from "@/features/admin/settings/ui/BrokerFeeOverrides";
import { DEFAULT_APPLICATION_FEE_PERCENT } from "@/features/admin/settings/domain/getApplicationFeePercent";

export function PlatformSettingsView() {
  return (
    <div className="max-w-xl mx-auto py-10 px-6">
      <h1 className="text-2xl font-semibold mb-8">Platform Settings</h1>
      <div>
        <span className="block text-sm font-medium text-foreground mb-1.5">
          Default Application Fee
        </span>
        <p className="text-sm text-muted-foreground">
          {DEFAULT_APPLICATION_FEE_PERCENT}% of each booking total is retained
          by the platform. The remainder goes to the broker.
        </p>
      </div>

      <BrokerFeeOverrides />
    </div>
  );
}
