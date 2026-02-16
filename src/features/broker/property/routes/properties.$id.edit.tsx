/**
 * Edit Property Route
 * Per-field inline editing with individual save buttons
 */

import { useProperty } from "@/features/broker/property/queries/useProperty";
import { rootRoute } from "@/features/broker/property/routes/BackofficeRoot";
import { PropertyEditView } from "@/features/broker/property/ui/PropertyEditView";
import { BackofficePageHeader } from "@/features/broker/ui/BackofficePageHeader";
import { createRoute, useParams } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";

function EditPropertyPage() {
  const { id } = useParams({ from: "/properties/$id/edit" });
  const { data: property } = useProperty(id);

  const viewUrl =
    property?.tier === "elite" ? `/elite/${id}` : `/property/${id}`;

  return (
    <div className="p-8">
      <BackofficePageHeader
        title="Edit Property"
        backTo="/properties"
        backLabel="Back to Properties"
      >
        <a
          href={viewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          View Property
          <ExternalLink size={16} />
        </a>
      </BackofficePageHeader>
      <PropertyEditView propertyId={id} />
    </div>
  );
}

export const editPropertyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/properties/$id/edit",
  component: EditPropertyPage,
});
