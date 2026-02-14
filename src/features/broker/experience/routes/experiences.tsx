import { ExperienceListView } from "@/features/broker/experience/ui/ExperienceListView";
import { rootRoute } from "@/features/broker/property/routes/BackofficeRoot";
import { createRoute } from "@tanstack/react-router";

export const experiencesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/experiences",
  component: ExperienceListView,
});
