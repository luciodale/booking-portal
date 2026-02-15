import { useIsPmsIntegrated } from "@/features/broker/pms/queries/useIsPmsIntegrated";
import { PmsIntegration } from "@/features/broker/pms/ui/PmsIntegration";
import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "./BackofficeRoot";
import { ExperienceSection, PropertySection } from "./PropertySection";

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Dashboard,
});

function Dashboard() {
  const { integrationStatus, isLoading, isIntegrated } = useIsPmsIntegrated();

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
      <p className="text-muted-foreground mb-8">
        Welcome to the booking management portal.
      </p>

      {isLoading ? (
        <div className="fixed inset-0 bg-background/50 flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-[1.5px] border-zinc-800/20 border-t-zinc-900" />
            <p className="text-sm text-muted-foreground">
              Checking integration...
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {isIntegrated ? (
            <PropertySection />
          ) : (
            <PmsIntegration
              integrationStatus={integrationStatus}
              isLoading={isLoading}
            />
          )}

          <ExperienceSection />
        </div>
      )}
    </div>
  );
}
