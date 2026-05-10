import { useIsPmsIntegrated } from "@/features/broker/pms/queries/useIsPmsIntegrated";
import { SmoobuApiKeyUpdateForm } from "@/features/broker/pms/ui/SmoobuApiKeyUpdateForm";
import { CheckCircle } from "lucide-react";

export function IntegrationsView() {
  const { integrationStatus, isLoading, isIntegrated } = useIsPmsIntegrated();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto py-8 px-6">
      <h1 className="text-2xl font-semibold mb-4">Integrations</h1>

      {isIntegrated ? (
        <>
          <div className="rounded-lg border border-success/30 bg-success/10 p-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="text-success" size={24} />
              <h2 className="text-lg font-semibold text-success">
                Smoobu Connected
              </h2>
            </div>
            <div className="mt-4 flex flex-col gap-4 text-sm">
              {integrationStatus?.integration?.pmsEmail && (
                <div>
                  <span className="text-muted-foreground">Email</span>
                  <p className="font-medium text-foreground">
                    {integrationStatus.integration.pmsEmail}
                  </p>
                </div>
              )}
              {integrationStatus?.integration?.pmsUserId && (
                <div>
                  <span className="text-muted-foreground">User ID</span>
                  <p className="font-medium text-foreground">
                    {integrationStatus.integration.pmsUserId}
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="mt-6">
            <SmoobuApiKeyUpdateForm />
          </div>
        </>
      ) : (
        <p className="text-muted-foreground">
          No PMS integration configured. Connect Smoobu during property creation
          to sync your listings automatically.
        </p>
      )}
    </div>
  );
}
