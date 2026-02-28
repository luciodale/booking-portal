import { ExperienceEditView } from "@/features/broker/experience/ui/ExperienceEditView";
import { rootRoute } from "@/features/broker/property/routes/BackofficeRoot";
import { BackofficePageHeader } from "@/features/broker/ui/BackofficePageHeader";
import { createRoute, useParams } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";

function ExperienceEditPage() {
  const { id } = useParams({ from: "/experiences/$id/edit" });
  return (
    <div className="p-8">
      <BackofficePageHeader
        title="Edit Experience"
        backTo="/experiences"
        backLabel="Back to Experiences"
      >
        <a
          href={`/experiences/${id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          View Experience
          <ExternalLink size={16} />
        </a>
      </BackofficePageHeader>
      <ExperienceEditView experienceId={id} />
    </div>
  );
}

export const editExperienceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/experiences/$id/edit",
  component: ExperienceEditPage,
});
