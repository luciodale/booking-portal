/**
 * Smoobu setup: API key verify + connect. Uses generic PmsSetupCard and pms/api.
 * Receives integrationStatus + isLoading from parent (dashboard).
 */

import {
  type IntegrationStatusResponse,
  type PmsIntegration,
  isSmoobuIntegration,
  saveIntegration,
} from "@/features/broker/pms/api";
import { PMS_INTEGRATION_STATUS_QUERY_KEY } from "@/features/broker/pms/constants/integrations";
import { verifySmoobuApiKey } from "@/features/broker/pms/integrations/smoobu/verifyApiKey";
import { PmsSetupCard } from "@/features/broker/pms/ui/PmsSetupCard";
import { TextInput } from "@/modules/ui/react/form-inputs";
import type { SmoobuUser } from "@/schemas/smoobu";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";

export type SmoobuSetupCardProps = {
  integrationStatus: IntegrationStatusResponse | undefined;
  isLoading: boolean;
};

type SmoobuApiKeyForm = { apiKey: string };

export function SmoobuSetupCard({
  integrationStatus,
  isLoading,
}: SmoobuSetupCardProps) {
  const queryClient = useQueryClient();
  const { control, getValues, reset, watch } = useForm<SmoobuApiKeyForm>({
    defaultValues: { apiKey: "" },
  });
  const apiKeyValue = watch("apiKey");
  const [verifiedUser, setVerifiedUser] = useState<SmoobuUser | null>(null);

  const verifyMutation = useMutation({
    mutationFn: (key: string) => verifySmoobuApiKey({ apiKey: key }),
    onSuccess: (user) => setVerifiedUser(user),
    onError: () => setVerifiedUser(null),
  });

  const saveMutation = useMutation({
    mutationFn: saveIntegration,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PMS_INTEGRATION_STATUS_QUERY_KEY,
      });
      reset({ apiKey: "" });
      setVerifiedUser(null);
    },
  });

  const handleVerify = () => {
    const apiKey = getValues("apiKey")?.trim() ?? "";
    if (!apiKey) return;
    verifyMutation.mutate(apiKey);
  };

  const handleConfirm = () => {
    if (!verifiedUser) return;
    const apiKey = getValues("apiKey") ?? "";
    saveMutation.mutate({
      provider: "smoobu",
      apiKey,
      pmsUserId: verifiedUser.id,
      pmsEmail: verifiedUser.email,
    });
  };

  const handleCancel = () => {
    setVerifiedUser(null);
    reset({ apiKey: "" });
    verifyMutation.reset();
  };

  return (
    <PmsSetupCard
      integrationStatus={integrationStatus}
      isLoading={isLoading}
      connectedTitle="Smoobu Connected"
      connectedDescription="Your Smoobu account is connected and ready to use."
      getConnectedDetail={(integration: PmsIntegration) =>
        isSmoobuIntegration(integration) && integration.pmsEmail ? (
          <p className="text-xs text-muted-foreground">
            Connected as: {integration.pmsEmail}
          </p>
        ) : null
      }
      setupTitle="Connect Smoobu"
      setupDescription="Connect your Smoobu account to manage properties and bookings."
    >
      {!verifiedUser ? (
        <>
          <div className="bg-muted/50 rounded-lg p-4 mb-4">
            <p className="text-xs text-muted-foreground mb-2">
              <strong>How to get your API key:</strong>
            </p>
            <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Go to Smoobu → Advanced → API Keys</li>
              <li>Generate an API key</li>
              <li>Paste it below</li>
            </ol>
          </div>

          <div className="space-y-3">
            <TextInput
              name="apiKey"
              control={control}
              label="API Key"
              placeholder="Enter your Smoobu API key"
              disabled={verifyMutation.isPending}
            />

            {verifyMutation.isError && (
              <div className="bg-error/10 border border-error/20 rounded-lg p-3">
                <p className="text-sm text-error">
                  {verifyMutation.error?.message ??
                    "Failed to verify API key. Please check and try again."}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={handleVerify}
              disabled={!apiKeyValue?.trim() || verifyMutation.isPending}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {verifyMutation.isPending ? "Verifying..." : "Verify API Key"}
            </button>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <p className="text-sm font-medium text-foreground mb-2">
              Confirm this is you:
            </p>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>
                <strong>Name:</strong>{" "}
                {[verifiedUser.firstName, verifiedUser.lastName]
                  .filter(Boolean)
                  .join(" ") ||
                  verifiedUser.name ||
                  "—"}
              </p>
              <p>
                <strong>Email:</strong> {verifiedUser.email}
              </p>
              <p>
                <strong>User ID:</strong> {verifiedUser.id}
              </p>
            </div>
          </div>

          {saveMutation.isError && (
            <div className="bg-error/10 border border-error/20 rounded-lg p-3">
              <p className="text-sm text-error">
                {saveMutation.error?.message ??
                  "Failed to save integration. Please try again."}
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={saveMutation.isPending}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saveMutation.isPending
                ? "Connecting..."
                : "Yes, Connect Account"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={saveMutation.isPending}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </PmsSetupCard>
  );
}
