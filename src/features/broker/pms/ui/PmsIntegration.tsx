/**
 * PMS integration setup: provider dropdown + selected provider setup card.
 * Shown when broker is not yet integrated.
 */

import type { TGetIntegrationsResponse } from "@/features/broker/pms/api/types";
import {
  type PmsProvider,
  availablePms,
} from "@/features/broker/pms/constants/integrations";
import { SmoobuSetupCard } from "@/features/broker/pms/integrations/smoobu/ui/SmoobuSetupCard";
import { Select } from "@/modules/ui/Select";
import { useState } from "react";

const pmsOptions = availablePms.map((pms) => ({
  value: pms,
  label: pms.charAt(0).toUpperCase() + pms.slice(1),
}));

export type PmsIntegrationProps = {
  integrationStatus: TGetIntegrationsResponse | undefined;
  isLoading: boolean;
};

export function PmsIntegration({
  integrationStatus,
  isLoading,
}: PmsIntegrationProps) {
  const [selectedPms, setSelectedPms] = useState<PmsProvider>(availablePms[0]);

  return (
    <div className="mb-8">
      <div className="mb-4 max-w-xs">
        <label
          htmlFor="pms-select"
          className="block text-sm font-medium text-foreground mb-1"
        >
          Integration
        </label>
        <Select
          id="pms-select"
          value={selectedPms}
          onChange={(v) => setSelectedPms(v as PmsProvider)}
          options={pmsOptions}
          placeholder="Select integration"
        />
      </div>
      {selectedPms === "smoobu" && (
        <SmoobuSetupCard
          integrationStatus={integrationStatus}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
