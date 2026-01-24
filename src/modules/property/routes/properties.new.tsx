/**
 * Create Property Route
 * Full form + images submitted together on save
 */

import { displayToKebab } from "@/modules/property/domain/sync-features";
import { useCreateProperty } from "@/modules/property/hooks/queries";
import { rootRoute } from "@/modules/property/routes/BackofficeRoot";
import {
  CreatePropertyForm,
  type CreatePropertyFormData,
} from "@/modules/property/ui";
import { createRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

function CreatePropertyPage() {
  const navigate = useNavigate();
  const createProperty = useCreateProperty({});
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (data: CreatePropertyFormData) => {
    try {
      // Extract images and property data
      const { images, ...propertyData } = data;

      // Ensure all tags are kebab-cased (idempotent)
      const normalizedData = {
        ...propertyData,
        amenities: propertyData.amenities?.map(displayToKebab) ?? [],
        highlights: propertyData.highlights?.map(displayToKebab) ?? [],
        views: propertyData.views?.map(displayToKebab) ?? [],
      };

      // First create the property
      const newProperty = await createProperty.mutateAsync(normalizedData);

      // Then upload images
      if (images.length > 0) {
        setIsUploading(true);

        const formData = new FormData();
        formData.append("assetId", newProperty.id);

        // Find primary image index
        const primaryIndex = images.findIndex((img) => img.isPrimary);

        for (const img of images) {
          formData.append("images", img.file);
        }

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

        setIsUploading(false);
      }

      // Navigate to the property edit page
      navigate({
        to: "/properties/$id/edit",
        params: { id: newProperty.id },
      });
    } catch (error) {
      console.error("Submission failed", error);
      setIsUploading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-foreground mb-6">
        Create New Property
      </h1>
      <CreatePropertyForm
        onSubmit={handleSubmit}
        isLoading={createProperty.isPending || isUploading}
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
