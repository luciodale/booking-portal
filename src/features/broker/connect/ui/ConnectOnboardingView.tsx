import { useConnectStatus } from "@/features/broker/connect/queries/useConnectStatus";
import { useCreateConnectAccount } from "@/features/broker/connect/queries/useCreateConnectAccount";
import { useCreateAccountSession } from "@/features/broker/connect/queries/useCreateAccountSession";
import {
  ConnectAccountOnboarding,
  ConnectComponentsProvider,
} from "@stripe/react-connect-js";
import { loadConnectAndInitialize } from "@stripe/connect-js";
import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { connectQueryKeys } from "@/features/broker/connect/queries/useConnectStatus";
import { useQueryClient } from "@tanstack/react-query";

export function ConnectOnboardingView() {
  const { data: connectStatus, isLoading } = useConnectStatus();
  const queryClient = useQueryClient();
  const createAccountMutation = useCreateConnectAccount();
  const createSessionMutation = useCreateAccountSession();

  const [stripeConnectInstance, setStripeConnectInstance] = useState<
    ReturnType<typeof loadConnectAndInitialize> | undefined
  >(undefined);

  async function handleStartOnboarding() {
    const { accountId } = await createAccountMutation.mutateAsync();

    const instance = loadConnectAndInitialize({
      publishableKey: import.meta.env.PUBLIC_STRIPE_PUBLISHABLE_KEY,
      fetchClientSecret: async () => {
        const { clientSecret } = await createSessionMutation.mutateAsync();
        return clientSecret;
      },
      appearance: {
        overlays: "dialog",
      },
    });

    setStripeConnectInstance(instance);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  // Complete state
  if (connectStatus?.status === "complete") {
    return (
      <div className="max-w-lg mx-auto py-8 px-6">
        <div className="rounded-lg border border-green-500/30 bg-green-50 dark:bg-green-950/20 p-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="text-green-600" size={24} />
            <h2 className="text-lg font-semibold text-green-700 dark:text-green-400">
              Payouts Enabled
            </h2>
          </div>
          <p className="text-sm text-green-600 dark:text-green-400/80">
            Your account is fully set up. Booking payments will be routed to
            your bank account.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Charges</span>
              <p className="font-medium text-foreground">
                {connectStatus.chargesEnabled ? "Enabled" : "Pending"}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Payouts</span>
              <p className="font-medium text-foreground">
                {connectStatus.payoutsEnabled ? "Enabled" : "Pending"}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Embedded onboarding active
  if (stripeConnectInstance) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-6">
        <h1 className="text-2xl font-semibold mb-6">Complete Payout Setup</h1>
        <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
          <ConnectAccountOnboarding
            onExit={() => {
              queryClient.invalidateQueries({
                queryKey: connectQueryKeys.status(),
              });
              setStripeConnectInstance(undefined);
            }}
          />
        </ConnectComponentsProvider>
      </div>
    );
  }

  // Not started / incomplete
  return (
    <div className="max-w-lg mx-auto py-8 px-6">
      <h1 className="text-2xl font-semibold mb-4">Set Up Payouts</h1>
      <p className="text-muted-foreground mb-6">
        Connect your bank account to receive payments from guest bookings. This
        process is powered by Stripe and takes a few minutes.
      </p>
      {connectStatus?.status === "incomplete" && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-50 dark:bg-amber-950/20 p-4 mb-6">
          <p className="text-sm text-amber-700 dark:text-amber-400">
            Your account setup is incomplete. Please continue the onboarding
            process.
          </p>
        </div>
      )}
      <button
        type="button"
        onClick={handleStartOnboarding}
        disabled={
          createAccountMutation.isPending || createSessionMutation.isPending
        }
        className="rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {createAccountMutation.isPending || createSessionMutation.isPending
          ? "Setting up..."
          : connectStatus?.status === "incomplete"
            ? "Continue Setup"
            : "Set Up Payouts"}
      </button>
    </div>
  );
}
