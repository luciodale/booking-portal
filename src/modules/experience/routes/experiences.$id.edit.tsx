/**
 * Edit Experience Route
 * Placeholder for per-field inline editing (to be implemented similarly to properties)
 */

import { useExperience } from "@/modules/experience/hooks/queries";
import { rootRoute } from "@/modules/property/routes/BackofficeRoot";
import { createRoute, useParams } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";

function EditExperiencePage() {
  const { id } = useParams({ from: "/experiences/$id/edit" });
  const { data: experience, isLoading } = useExperience(id);

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="text-muted-foreground">Loading experience...</div>
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="p-8">
        <div className="text-error">Experience not found</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Edit Experience</h1>
        <a
          href={`/experience/${id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          View Experience
          <ExternalLink size={16} />
        </a>
      </div>

      {/* Basic Info Display - TODO: Convert to editable fields like PropertyEditView */}
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Experience Details
          </h2>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm text-muted-foreground">Title</dt>
              <dd className="text-foreground">{experience.title}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Description</dt>
              <dd className="text-foreground">{experience.description}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Location</dt>
              <dd className="text-foreground">{experience.location}</dd>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <dt className="text-sm text-muted-foreground">Category</dt>
                <dd className="text-foreground capitalize">
                  {experience.category?.replace("_", " ") ?? "Other"}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Duration</dt>
                <dd className="text-foreground">{experience.duration}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Price</dt>
                <dd className="text-foreground">
                  €{(experience.basePrice / 100).toFixed(0)} / person
                </dd>
              </div>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Status</dt>
              <dd className="text-foreground capitalize">{experience.status}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Images</h2>
          {experience.images.length > 0 ? (
            <div className="grid grid-cols-4 gap-4">
              {experience.images.map((image) => (
                <div
                  key={image.id}
                  className="aspect-4/3 rounded-lg overflow-hidden border border-border"
                >
                  <img
                    src={`/api/images/${image.r2Key}`}
                    alt={image.alt || "Experience image"}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No images uploaded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export const editExperienceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/experiences/$id/edit",
  component: EditExperiencePage,
});

