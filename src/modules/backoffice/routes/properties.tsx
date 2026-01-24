/**
 * Backoffice Routes - Properties
 */

import { rootRoute } from "@/modules/backoffice/routes/BackofficeRoot";
import { PropertyList } from "@/modules/backoffice/ui/PropertyList";
import { createRoute } from "@tanstack/react-router";

export const propertiesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/properties",
  component: PropertyList,
});
