/**
 * Create Experience Route
 * Full form + images submitted together on save
 */

import {
  ExperienceForm,
  type CreateExperienceFormData,
} from "@/modules/experience/ui";
import { useCreateExperience } from "@/modules/experience/hooks/queries";
import { rootRoute } from "@/modules/property/routes/BackofficeRoot";
import { showError } from "@/modules/shared/notificationStore";
import { createRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

function CreateExperiencePage() {
  const navigate = useNavigate();
  const createExperience = useCreateExperience({});
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (data: CreateExperienceFormData) => {
    try {
      // Extract images and experience data
      const { images, ...experienceData } = data;

      // First create the experience
      const newExperience = await createExperience.mutateAsync(experienceData);

      // Then upload images (use the same upload endpoint with experienceId)
      if (images.length > 0) {
        setIsUploading(true);

        const formData = new FormData();
        formData.append("assetId", newExperience.id);
        formData.append("assetType", "experience"); // Indicate this is for an experience

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
          showError("Experience created but image upload failed.");
        }

        setIsUploading(false);
      }

      // Navigate to the experience edit page
      navigate({
        to: "/experiences/$id/edit",
        params: { id: newExperience.id },
      });
    } catch (error) {
      console.error("Submission failed", error);
      setIsUploading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-foreground mb-6">
        Create New Experience
      </h1>
      <ExperienceForm
        onSubmit={handleSubmit}
        isLoading={createExperience.isPending || isUploading}
      />
    </div>
  );
}

export const createExperienceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/experiences/new",
  component: CreateExperiencePage,
});

