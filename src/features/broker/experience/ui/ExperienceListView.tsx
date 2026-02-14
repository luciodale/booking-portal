import { experienceCategoryLabels } from "@/features/broker/experience/constants/categoryLabels";
import { useDeleteExperience } from "@/features/broker/experience/queries/useDeleteExperience";
import { useExperiences } from "@/features/broker/experience/queries/useExperiences";
import { Select } from "@/modules/ui/Select";
import { cn } from "@/modules/utils/cn";
import { Link } from "@tanstack/react-router";
import { useState } from "react";

function formatPrice(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export function ExperienceListView() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

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
          Create Experience
        </Link>
      </div>

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
            ...Object.entries(experienceCategoryLabels).map(
              ([value, label]) => ({
                value,
                label,
              })
            ),
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

      {error && (
        <div className="bg-error/10 border border-error/20 rounded-lg p-4 mb-6">
          <p className="text-error text-sm">
            Failed to load experiences: {error.message}
          </p>
        </div>
      )}

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-secondary">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Experience
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Status
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
                  colSpan={5}
                  className="px-6 py-12 text-center text-muted-foreground"
                >
                  Loading experiences...
                </td>
              </tr>
            ) : !data || data.experiences.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-muted-foreground"
                >
                  No experiences found. Create your first experience to get
                  started.
                </td>
              </tr>
            ) : (
              data.experiences.map((exp) => (
                <tr
                  key={exp.id}
                  className="hover:bg-secondary/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {exp.primaryImageUrl && (
                        <img
                          src={exp.primaryImageUrl}
                          alt={exp.title}
                          className="h-10 w-10 rounded-lg object-cover mr-3"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {exp.title}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {exp.location} &middot; {exp.duration}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {exp.category
                      ? (experienceCategoryLabels[exp.category] ?? exp.category)
                      : "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    {formatPrice(exp.basePrice, exp.currency)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={cn(
                        "px-2.5 py-1 inline-flex text-xs leading-5 font-medium rounded-full",
                        exp.status === "published" &&
                          "bg-success/20 text-success",
                        exp.status === "draft" && "bg-warning/20 text-warning",
                        exp.status === "archived" && "bg-error/20 text-error"
                      )}
                    >
                      {exp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      to="/experiences/$id/edit"
                      params={{ id: exp.id }}
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
                          deleteExperience.mutate(exp.id);
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
