/**
 * Create Property Route
 */

import type { CreatePropertyInput } from "@/modules/property/domain/schema";
import { useCreateProperty } from "@/modules/property/hooks/queries";
import { rootRoute } from "@/modules/property/routes/BackofficeRoot";
import type { PropertyImage } from "@/modules/ui/form";
import { ElitePropertyForm } from "@/modules/ui/views/PropertyFormView";
import { createRoute, useNavigate } from "@tanstack/react-router";

/** Form data extends CreatePropertyInput with images */
interface PropertyFormData extends CreatePropertyInput {
  images?: PropertyImage[];
}

function CreatePropertyPage() {
  const navigate = useNavigate();
  const createProperty = useCreateProperty({});

  const handleSubmit = async (data: PropertyFormData) => {
    try {
      // First create the property
      const newProperty = await createProperty.mutateAsync(data);

      // Then upload images if any
      const imagesToUpload = data.images?.filter((img) => img.file) ?? [];

      if (imagesToUpload.length > 0) {
        const formData = new FormData();
        formData.append("assetId", newProperty.id);

        // Find primary image index
        const primaryIndex = imagesToUpload.findIndex((img) => img.isPrimary);

        imagesToUpload.forEach((img, index) => {
          if (img.file) {
            formData.append("images", img.file);
          }
        });

        if (primaryIndex >= 0) {
          formData.append("isPrimary", String(primaryIndex));
        }

        const response = await fetch("/api/backoffice/upload-images", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          console.error("Failed to upload images");
          alert("Property created but image upload failed.");
        }
      }

      // Navigate to the property edit page after successful creation
      navigate({
        to: "/properties/$id/edit",
        params: { id: newProperty.id },
      });
    } catch (error) {
      console.error("Submission failed", error);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-foreground mb-6">
        Create New Property
      </h1>
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
