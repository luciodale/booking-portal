/**
 * Backoffice Routes - Experiences List
 */

import { ExperienceListView } from "@/modules/experience/ui";
import { rootRoute } from "@/modules/property/routes/BackofficeRoot";
import { createRoute } from "@tanstack/react-router";

export const experiencesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/experiences",
  component: ExperienceListView,
});

