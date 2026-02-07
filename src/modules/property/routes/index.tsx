import { SmoobuSetupCard } from "@/modules/smoobu/ui/SmoobuSetupCard";
import { useQuery } from "@tanstack/react-query";
import { Link, createRoute } from "@tanstack/react-router";
import { rootRoute } from "./BackofficeRoot";

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Dashboard,
});

async function checkIntegrationStatus(): Promise<{
  hasIntegration: boolean;
  integration: unknown;
}> {
  const response = await fetch("/api/backoffice/integrations");
  if (!response.ok) {
    throw new Error("Failed to check integration status");
  }
  const json = (await response.json()) as {
    data: { hasIntegration: boolean; integration: unknown };
  };
  return json.data;
}

function Dashboard() {
  const { data: integrationStatus, isLoading } = useQuery({
    queryKey: ["smoobu-integration"],
    queryFn: checkIntegrationStatus,
  });

  const hasIntegration = integrationStatus?.hasIntegration ?? false;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
      <p className="text-muted-foreground mb-8">
        Welcome to the booking management portal.
      </p>

      {/* Smoobu Integration Section */}
      <div className="mb-8">
        <SmoobuSetupCard />
      </div>

      {/* Management Quadrants */}
      <div className="grid gap-6 md:grid-cols-2">
        <Link
          to="/properties"
          className={`group bg-card border border-border rounded-xl p-6 transition-all duration-200 ${
            !hasIntegration
              ? "opacity-50 cursor-not-allowed pointer-events-none"
              : "hover:bg-card-hover"
          }`}
          aria-disabled={!hasIntegration}
        >
          <h2 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
            Properties
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage your property listings, pricing, and availability.
          </p>
          {!hasIntegration && (
            <p className="text-xs text-warning mt-2">
              Connect Smoobu to enable
            </p>
          )}
        </Link>

        <Link
          to="/properties/new"
          className={`group bg-card border border-border rounded-xl p-6 transition-all duration-200 ${
            !hasIntegration
              ? "opacity-50 cursor-not-allowed pointer-events-none"
              : "hover:bg-card-hover"
          }`}
          aria-disabled={!hasIntegration}
        >
          <h2 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
            Create Property
          </h2>
          <p className="text-sm text-muted-foreground">
            Add a new property to your portfolio.
          </p>
          {!hasIntegration && (
            <p className="text-xs text-warning mt-2">
              Connect Smoobu to enable
            </p>
          )}
        </Link>

        <Link
          to="/experiences"
          className={`group bg-card border border-border rounded-xl p-6 transition-all duration-200 ${
            !hasIntegration
              ? "opacity-50 cursor-not-allowed pointer-events-none"
              : "hover:bg-card-hover"
          }`}
          aria-disabled={!hasIntegration}
        >
          <h2 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
            Experiences
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage curated experiences and activities.
          </p>
          {!hasIntegration && (
            <p className="text-xs text-warning mt-2">
              Connect Smoobu to enable
            </p>
          )}
        </Link>

        <Link
          to="/experiences/new"
          className={`group bg-card border border-border rounded-xl p-6 transition-all duration-200 ${
            !hasIntegration
              ? "opacity-50 cursor-not-allowed pointer-events-none"
              : "hover:bg-card-hover"
          }`}
          aria-disabled={!hasIntegration}
        >
          <h2 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
            Create Experience
          </h2>
          <p className="text-sm text-muted-foreground">
            Add a new experience to your offerings.
          </p>
          {!hasIntegration && (
            <p className="text-xs text-warning mt-2">
              Connect Smoobu to enable
            </p>
          )}
        </Link>
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-background/50 flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-[1.5px] border-zinc-800/20 border-t-zinc-900" />
            <p className="text-sm text-muted-foreground">
              Checking integration...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
