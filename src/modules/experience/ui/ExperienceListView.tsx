/**
 * Experience List Component
 * Displays all experiences with search and filtering
 */

import {
  useDeleteExperience,
  useExperiences,
} from "@/modules/experience/hooks/queries";
import { Select } from "@/modules/ui/Select";
import { cn } from "@/modules/utils/cn";
import { Link } from "@tanstack/react-router";
import { useState } from "react";

export function ExperienceListView() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { data, isLoading, error } = useExperiences({
    search: search || undefined,
    category: categoryFilter || undefined,
    status: statusFilter || undefined,
  });

  const deleteExperience = useDeleteExperience();

  return (
    <div className="p-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Experiences</h1>

        <Link to="/experiences/new" className="btn-primary">
          Create New Experience
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Search experiences..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input flex-1"
        />

        <Select
          value={categoryFilter}
          onChange={setCategoryFilter}
          options={[
            { value: "", label: "All Categories" },
            { value: "sailing", label: "Sailing" },
            { value: "food_wine", label: "Food & Wine" },
            { value: "adventure", label: "Adventure" },
            { value: "culture", label: "Culture" },
            { value: "wellness", label: "Wellness" },
            { value: "other", label: "Other" },
          ]}
          placeholder="All Categories"
          className="w-auto min-w-40"
        />

        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "", label: "All Statuses" },
            { value: "draft", label: "Draft" },
            { value: "published", label: "Published" },
            { value: "archived", label: "Archived" },
          ]}
          placeholder="All Statuses"
          className="w-auto min-w-40"
        />
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-error/10 border border-error/20 rounded-lg p-4 mb-6">
          <p className="text-error text-sm">
            Failed to load experiences: {error.message}
          </p>
        </div>
      )}

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-secondary">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Experience
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-muted-foreground"
                >
                  Loading experiences...
                </td>
              </tr>
            ) : !data || data.experiences.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-muted-foreground"
                >
                  No experiences found. Create your first experience to get
                  started.
                </td>
              </tr>
            ) : (
              data.experiences.map((experience) => (
                <tr
                  key={experience.id}
                  className="hover:bg-secondary/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {experience.primaryImageUrl && (
                        <img
                          src={experience.primaryImageUrl}
                          alt={experience.title}
                          className="h-10 w-10 rounded-lg object-cover mr-3"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {experience.title}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {experience.duration} •{" "}
                          {experience.maxParticipants
                            ? `${experience.maxParticipants} max`
                            : "No limit"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {experience.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-primary/20 text-primary">
                      {experience.category
                        ?.replace("_", " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase()) ?? "Other"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={cn(
                        "px-2.5 py-1 inline-flex text-xs leading-5 font-medium rounded-full",
                        experience.status === "published" &&
                          "bg-success/20 text-success",
                        experience.status === "draft" &&
                          "bg-warning/20 text-warning",
                        experience.status === "archived" &&
                          "bg-error/20 text-error"
                      )}
                    >
                      {experience.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    €{(experience.basePrice / 100).toFixed(0)} / person
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      to="/experiences/$id/edit"
                      params={{ id: experience.id }}
                      className="text-primary hover:text-primary-hover mr-4 transition-colors"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          window.confirm(
                            "Are you sure you want to archive this experience?"
                          )
                        ) {
                          deleteExperience.mutate(experience.id);
                        }
                      }}
                      disabled={deleteExperience.isPending}
                      className="text-error hover:text-error/80 disabled:opacity-50 transition-colors"
                    >
                      {deleteExperience.isPending ? "Archiving..." : "Archive"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

