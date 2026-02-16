import { ExperienceEditView } from "@/features/broker/experience/ui/ExperienceEditView";
import { rootRoute } from "@/features/broker/property/routes/BackofficeRoot";
import { BackofficePageHeader } from "@/features/broker/ui/BackofficePageHeader";
import { createRoute, useParams } from "@tanstack/react-router";

function ExperienceEditPage() {
  const { id } = useParams({ from: "/experiences/$id/edit" });
  return (
    <div className="p-8">
      <BackofficePageHeader
        title="Edit Experience"
        backTo="/experiences"
        backLabel="Back to Experiences"
      />
      <ExperienceEditView experienceId={id} />
    </div>
  );
}

export const editExperienceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/experiences/$id/edit",
  component: ExperienceEditPage,
});
