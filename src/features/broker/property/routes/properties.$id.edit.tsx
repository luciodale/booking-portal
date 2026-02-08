/**
 * Edit Property Route
 * Per-field inline editing with individual save buttons
 */

import { useProperty } from "@/features/broker/property/hooks/queries";
import { rootRoute } from "@/features/broker/property/routes/BackofficeRoot";
import { PropertyEditView } from "@/features/broker/property/ui";
import { createRoute, useParams } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";

function EditPropertyPage() {
  const { id } = useParams({ from: "/properties/$id/edit" });
  const { data: property } = useProperty(id);

  const viewUrl =
    property?.tier === "elite" ? `/elite/${id}` : `/property/${id}`;

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Edit Property</h1>
        <a
          href={viewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          View Property
          <ExternalLink size={16} />
        </a>
      </div>
      <PropertyEditView propertyId={id} />
    </div>
  );
}

export const editPropertyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/properties/$id/edit",
  component: EditPropertyPage,
});
