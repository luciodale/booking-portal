/**
 * Edit Property Route
 * Per-field inline editing with individual save buttons
 */

import { rootRoute } from "@/modules/property/routes/BackofficeRoot";
import { PropertyEditView } from "@/modules/property/ui";
import { createRoute, useParams } from "@tanstack/react-router";

function EditPropertyPage() {
  const { id } = useParams({ from: "/properties/$id/edit" });

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-foreground mb-6">Edit Property</h1>
      <PropertyEditView propertyId={id} />
    </div>
  );
}

export const editPropertyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/properties/$id/edit",
  component: EditPropertyPage,
});
