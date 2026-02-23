import { ConnectOnboardingView } from "@/features/broker/connect/ui/ConnectOnboardingView";
import { rootRoute } from "@/features/broker/property/routes/BackofficeRoot";
import { createRoute } from "@tanstack/react-router";

export const connectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/connect",
  component: ConnectOnboardingView,
});
