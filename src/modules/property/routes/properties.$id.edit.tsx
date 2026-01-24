/**
 * Edit Property Route
 */

import type { CreatePropertyInput } from "@/modules/property/domain/schema";
import { rootRoute } from "@/modules/property/routes/BackofficeRoot";
import { ElitePropertyForm } from "@/modules/ui/views/PropertyFormView";
import { useProperty, useUpdateProperty } from "@/modules/property/hooks/queries";
import { createRoute, useParams } from "@tanstack/react-router";

function EditPropertyPage() {
  const { id } = useParams({ from: "/properties/$id/edit" });

  // Type-safe query and mutation
  const { data: property, isLoading, error } = useProperty(id);
  const updateProperty = useUpdateProperty({
    onSuccess: () => {
      alert("Property updated successfully!");
    },
    onError: (error) => {
      alert(`Failed to update property: ${error.message}`);
    },
  });

  const handleSubmit = async (data: CreatePropertyInput) => {
    updateProperty.mutate({ id, data });
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="text-center text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="p-8">
        <div className="text-center text-error">
          {error?.message || "Property not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-foreground mb-6">Edit Property</h1>
      <ElitePropertyForm
        defaultValues={property as Partial<CreatePropertyInput>}
        onSubmit={handleSubmit}
        isLoading={updateProperty.isPending}
      />
      {updateProperty.isError && (
        <div className="mt-4 bg-error/10 border border-error/20 rounded-lg p-4">
          <p className="text-error text-sm">
            Error: {updateProperty.error.message}
          </p>
        </div>
      )}
    </div>
  );
}

export const editPropertyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/properties/$id/edit",
  component: EditPropertyPage,
});
