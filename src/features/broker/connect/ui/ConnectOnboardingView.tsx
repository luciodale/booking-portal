import { useConnectStatus } from "@/features/broker/connect/queries/useConnectStatus";
import { useCreateAccountLink } from "@/features/broker/connect/queries/useCreateAccountLink";
import { useCreateConnectAccount } from "@/features/broker/connect/queries/useCreateConnectAccount";
import { useCreateLoginLink } from "@/features/broker/connect/queries/useCreateLoginLink";
import { AlertTriangle, CheckCircle, Clock, ExternalLink } from "lucide-react";

export function ConnectOnboardingView() {
  const { data: connectStatus, isLoading } = useConnectStatus();
  const createAccountMutation = useCreateConnectAccount();
  const createLinkMutation = useCreateAccountLink();
  const createLoginLinkMutation = useCreateLoginLink();

  const isRevoked = connectStatus?.status === "revoked";
  const isMutating =
    createAccountMutation.isPending || createLinkMutation.isPending;

  async function handleStartOnboarding() {
    await createAccountMutation.mutateAsync(
      isRevoked ? { replace: true } : undefined
    );

    const { url } = await createLinkMutation.mutateAsync();
    window.location.href = url;
  }

  async function handleManagePayouts() {
    const { url } = await createLoginLinkMutation.mutateAsync();
    window.open(url, "_blank");
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
        <div className="rounded-lg border border-success/30 bg-success/10 p-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="text-success" size={24} />
            <h2 className="text-lg font-semibold text-success">
              Payouts Enabled
            </h2>
          </div>
          <p className="text-sm text-success">
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
          <button
            type="button"
            onClick={handleManagePayouts}
            disabled={createLoginLinkMutation.isPending}
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {createLoginLinkMutation.isPending
              ? "Opening Stripe..."
              : "Manage Payout Details"}
            {!createLoginLinkMutation.isPending && <ExternalLink size={14} />}
          </button>
        </div>
      </div>
    );
  }

  if (connectStatus?.status === "pending") {
    return (
      <div className="max-w-lg mx-auto py-8 px-6">
        <div className="rounded-lg border border-info/30 bg-info/10 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="text-info" size={24} />
            <h2 className="text-lg font-semibold text-info">
              Verification in Progress
            </h2>
          </div>
          <p className="text-sm text-info">
            Your details have been submitted. Stripe is verifying your account —
            this usually takes a few moments.
          </p>
          <div className="mt-4 flex items-center gap-2 text-sm text-info">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-info border-t-transparent" />
            Checking status...
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
        <div className="rounded-lg border border-error/30 bg-error/10 p-4 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="text-error" size={16} />
            <p className="text-sm font-medium text-error">
              Previous connection is no longer valid
            </p>
          </div>
          <p className="text-sm text-error">
            Your linked Stripe account was revoked or can no longer be accessed.
            Please set up a new connection below.
          </p>
        </div>
      )}
      {connectStatus?.status === "incomplete" && (
        <div className="rounded-lg border border-warning/30 bg-warning/10 p-4 mb-6">
          <p className="text-sm text-warning">
            Your account setup is incomplete. Please continue the onboarding
            process.
          </p>
        </div>
      )}
      <button
        type="button"
        onClick={handleStartOnboarding}
        disabled={isMutating}
        className="rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {isMutating
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
