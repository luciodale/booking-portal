/**
 * Backoffice Routes - Properties
 */

import { rootRoute } from "@/features/broker/property/routes/BackofficeRoot";
import { PropertyList } from "@/modules/ui/views/PropertyListView";
import { createRoute } from "@tanstack/react-router";

export const propertiesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/properties",
  component: PropertyList,
});
