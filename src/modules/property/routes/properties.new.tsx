/**
 * Create Property Route
 */

import type { CreatePropertyInput } from "@/modules/property/domain/schema";
import { rootRoute } from "@/modules/property/routes/BackofficeRoot";
import { ElitePropertyForm } from "@/modules/ui/views/PropertyFormView";
import { useCreateProperty } from "@/modules/property/hooks/queries";
import { createRoute, useNavigate } from "@tanstack/react-router";

function CreatePropertyPage() {
  const navigate = useNavigate();
  const createProperty = useCreateProperty({
    onSuccess: (data) => {
      // Navigate to the property edit page after successful creation
      navigate({
        to: "/properties/$id/edit",
        params: { id: data.id },
      });
    },
    onError: (error) => {
      alert(`Failed to create property: ${error.message}`);
    },
  });

  const handleSubmit = async (data: CreatePropertyInput) => {
    createProperty.mutate(data);
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-foreground mb-6">Create New Property</h1>
      <ElitePropertyForm
        onSubmit={handleSubmit}
        isLoading={createProperty.isPending}
      />
      {createProperty.isError && (
        <div className="mt-4 bg-error/10 border border-error/20 rounded-lg p-4">
          <p className="text-error text-sm">
            Error: {createProperty.error.message}
          </p>
        </div>
      )}
    </div>
  );
}

export const createPropertyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/properties/new",
  component: CreatePropertyPage,
});
