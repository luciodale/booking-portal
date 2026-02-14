import { rootRoute } from "@/features/broker/property/routes/BackofficeRoot";
import { ExperienceListView } from "@/features/broker/experience/ui/ExperienceListView";
import { createRoute } from "@tanstack/react-router";

export const experiencesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/experiences",
  component: ExperienceListView,
});
