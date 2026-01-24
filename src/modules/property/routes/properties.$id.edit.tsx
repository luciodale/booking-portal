/**
 * Edit Property Route
 * Images are held in memory and only uploaded on save
 */

import type { CreatePropertyInput } from "@/modules/property/domain/schema";
import {
  useProperty,
  useUpdateProperty,
} from "@/modules/property/hooks/queries";
import { rootRoute } from "@/modules/property/routes/BackofficeRoot";
import type { PropertyImage } from "@/modules/ui/form";
import { ElitePropertyForm } from "@/modules/ui/views/PropertyFormView";
import { useQueryClient } from "@tanstack/react-query";
import { createRoute, useParams } from "@tanstack/react-router";
import { useState } from "react";

/** Form data extends CreatePropertyInput with images */
interface PropertyFormData extends CreatePropertyInput {
  images?: PropertyImage[];
}

/** Response type for image upload */
interface UploadResponse {
  success: boolean;
  data: {
    images: Array<{
      id: string;
      r2Path: string;
      r2Key: string;
      url?: string;
      isPrimary: boolean;
    }>;
  };
}

function EditPropertyPage() {
  const { id } = useParams({ from: "/properties/$id/edit" });
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

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

  // Transform DB images to UI format
  const existingImages: PropertyImage[] =
    property?.images?.map((img) => ({
      id: img.id,
      url: img.r2Path,
      isPrimary: img.isPrimary,
      isExisting: true,
    })) ?? [];

  // Delete an existing image from the server
  const handleDeleteImage = async (imageId: string): Promise<void> => {
    const response = await fetch(`/api/backoffice/images/${imageId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete image");
    }

    // Invalidate query to refresh
    queryClient.invalidateQueries({ queryKey: ["properties", id] });
  };

  // Set primary image on an existing image
  const handleSetPrimaryImage = async (imageId: string): Promise<void> => {
    const response = await fetch(`/api/backoffice/images/${imageId}/primary`, {
      method: "PUT",
    });

    if (!response.ok) {
      throw new Error("Failed to set primary image");
    }

    // Invalidate query to refresh
    queryClient.invalidateQueries({ queryKey: ["properties", id] });
  };

  // Upload images to server
  const uploadImages = async (
    images: PropertyImage[]
  ): Promise<{ success: boolean; uploadedIds: string[] }> => {
    const newImages = images.filter((img) => img.file && !img.isExisting);
    const uploadedIds: string[] = [];

    if (newImages.length === 0) {
      return { success: true, uploadedIds };
    }

    // Upload each new image
    for (const img of newImages) {
      if (!img.file) continue;

      const formData = new FormData();
      formData.append("assetId", id);
      formData.append("images", img.file);
      if (img.isPrimary) {
        formData.append("isPrimary", "0");
      }

      const response = await fetch("/api/backoffice/upload-images", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(errorData.error || "Failed to upload image");
      }

      const responseData = (await response.json()) as UploadResponse;
      const uploaded = responseData.data?.images?.[0];

      if (uploaded) {
        uploadedIds.push(uploaded.id);

        // If this image is primary and there are existing primary images, update them
        if (img.isPrimary) {
          await handleSetPrimaryImage(uploaded.id);
        }
      }
    }

    return { success: true, uploadedIds };
  };

  const handleSubmit = async (data: PropertyFormData) => {
    setIsSaving(true);

    try {
      const images = data.images ?? [];

      // Upload all new images first
      await uploadImages(images);

      // Update property data
      const { images: _, ...propertyData } = data;
      updateProperty.mutate({ id, data: propertyData });

      // Invalidate to refresh images
      queryClient.invalidateQueries({ queryKey: ["properties", id] });
    } catch (err) {
      alert(
        `Failed to save: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setIsSaving(false);
    }
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
        existingImages={existingImages}
        onSubmit={handleSubmit}
        isLoading={updateProperty.isPending || isSaving}
        onDeleteImage={handleDeleteImage}
        onSetPrimaryImage={handleSetPrimaryImage}
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
