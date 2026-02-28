import { IntegrationsView } from "@/features/broker/pms/ui/IntegrationsView";
import { rootRoute } from "@/features/broker/property/routes/BackofficeRoot";
import { createRoute } from "@tanstack/react-router";

export const integrationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/integrations",
  component: IntegrationsView,
});
