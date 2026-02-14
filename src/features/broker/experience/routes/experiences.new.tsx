import { useCreateExperience } from "@/features/broker/experience/queries/useCreateExperience";
import { CreateExperienceForm } from "@/features/broker/experience/ui/CreateExperienceForm";
import { rootRoute } from "@/features/broker/property/routes/BackofficeRoot";
import { getErrorMessages } from "@/modules/utils/errors";
import type { CreateExperienceInput } from "@/schemas/experience";
import { createRoute, useNavigate } from "@tanstack/react-router";

function CreateExperiencePage() {
  const navigate = useNavigate();
  const createExperience = useCreateExperience();

  async function handleSubmit(data: CreateExperienceInput) {
    const newExperience = await createExperience.mutateAsync(data);
    navigate({
      to: "/experiences/$id/edit",
      params: { id: newExperience.id },
    });
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-foreground mb-8">
        Create New Experience
      </h1>

      <CreateExperienceForm
        onSubmit={handleSubmit}
        isLoading={createExperience.isPending}
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
