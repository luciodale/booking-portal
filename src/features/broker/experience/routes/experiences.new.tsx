import { useCreateExperience } from "@/features/broker/experience/queries/useCreateExperience";
import {
  CreateExperienceForm,
  type CreateExperienceFormData,
} from "@/features/broker/experience/ui/CreateExperienceForm";
import { rootRoute } from "@/features/broker/property/routes/BackofficeRoot";
import { BackofficePageHeader } from "@/features/broker/ui/BackofficePageHeader";
import { showError } from "@/modules/ui/react/stores/notificationStore";
import { getErrorMessages } from "@/modules/utils/errors";
import { createRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

function CreateExperiencePage() {
  const navigate = useNavigate();
  const createExperience = useCreateExperience();
  const [isUploading, setIsUploading] = useState(false);

  async function handleSubmit(data: CreateExperienceFormData) {
    try {
      const { images, ...experienceData } = data;
      const newExperience = await createExperience.mutateAsync(experienceData);

      if (images.length > 0) {
        setIsUploading(true);
        const formData = new FormData();
        formData.append("experienceId", newExperience.id);
        const primaryIndex = images.findIndex((img) => img.isPrimary);
        for (const img of images) {
          formData.append("images", img.file);
        }
        if (primaryIndex >= 0) {
          formData.append("isPrimary", String(primaryIndex));
        }
        const response = await fetch(
          "/api/backoffice/upload-experience-images",
          { method: "POST", body: formData }
        );
        if (!response.ok) {
          showError("Experience created but image upload failed.");
        }
        setIsUploading(false);
      }

      navigate({
        to: "/experiences/$id/edit",
        params: { id: newExperience.id },
      });
    } catch (error) {
      console.error("Submission failed", error);
      setIsUploading(false);
    }
  }

  return (
    <div className="p-8">
      <BackofficePageHeader
        title="Create New Experience"
        backTo="/experiences"
        backLabel="Back to Experiences"
      />

      <CreateExperienceForm
        onSubmit={handleSubmit}
        isLoading={createExperience.isPending || isUploading}
      />

      {createExperience.isError && (
        <div className="mt-4 bg-error/10 border border-error/20 rounded-lg p-4 max-w-4xl mx-auto">
          <p className="text-error font-medium text-sm mb-2">
            Validation errors:
          </p>
          <ul className="list-disc list-inside space-y-1">
            {getErrorMessages(createExperience.error).map((msg) => (
              <li key={msg} className="text-error text-sm">
                {msg}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export const createExperienceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/experiences/new",
  component: CreateExperiencePage,
});
