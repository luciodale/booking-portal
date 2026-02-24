import { useConnectStatus } from "@/features/broker/connect/queries/useConnectStatus";
import { useCreateConnectAccount } from "@/features/broker/connect/queries/useCreateConnectAccount";
import { useCreateAccountLink } from "@/features/broker/connect/queries/useCreateAccountLink";
import { AlertTriangle, CheckCircle } from "lucide-react";

export function ConnectOnboardingView() {
  const { data: connectStatus, isLoading } = useConnectStatus();
  const createAccountMutation = useCreateConnectAccount();
  const createLinkMutation = useCreateAccountLink();

  const isRevoked = connectStatus?.status === "revoked";
  const isPending =
    createAccountMutation.isPending || createLinkMutation.isPending;

  async function handleStartOnboarding() {
    await createAccountMutation.mutateAsync(
      isRevoked ? { replace: true } : undefined
    );

    const { url } = await createLinkMutation.mutateAsync();
    window.location.href = url;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

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

  return (
    <div className="max-w-lg mx-auto py-8 px-6">
      <h1 className="text-2xl font-semibold mb-4">Set Up Payouts</h1>
      <p className="text-muted-foreground mb-6">
        Connect your bank account to receive payments from guest bookings. This
        process is powered by Stripe and takes a few minutes.
      </p>
      {isRevoked && (
        <div className="rounded-lg border border-red-500/30 bg-red-50 dark:bg-red-950/20 p-4 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle
              className="text-red-600 dark:text-red-400"
              size={16}
            />
            <p className="text-sm font-medium text-red-700 dark:text-red-400">
              Previous connection is no longer valid
            </p>
          </div>
          <p className="text-sm text-red-600 dark:text-red-400/80">
            Your linked Stripe account was revoked or can no longer be accessed.
            Please set up a new connection below.
          </p>
        </div>
      )}
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
        disabled={isPending}
        className="rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {isPending
          ? "Redirecting to Stripe..."
          : isRevoked
            ? "Reconnect Payouts"
            : connectStatus?.status === "incomplete"
              ? "Continue Setup"
              : "Set Up Payouts"}
      </button>
    </div>
  );
}
