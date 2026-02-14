import { rootRoute } from "@/features/broker/property/routes/BackofficeRoot";
import { ExperienceEditView } from "@/features/broker/experience/ui/ExperienceEditView";
import { createRoute, useParams } from "@tanstack/react-router";

function ExperienceEditPage() {
  const { id } = useParams({ from: "/experiences/$id/edit" });
  return (
    <div className="p-8">
      <ExperienceEditView experienceId={id} />
    </div>
  );
}

export const editExperienceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/experiences/$id/edit",
  component: ExperienceEditPage,
});
