/**
 * Property List Component
 * Displays all properties with search and filtering
 */

import { cn } from "@/modules/utils/cn";
import { useDeleteProperty, useProperties } from "@/modules/property/hooks/queries";
import { Link } from "@tanstack/react-router";
import { useState } from "react";

export function PropertyList() {
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Type-safe query with single source of truth types
  const { data, isLoading, error } = useProperties({
    search: search || undefined,
    tier: tierFilter || undefined,
    status: statusFilter || undefined,
  });

  const deleteProperty = useDeleteProperty();

  return (
    <div className="p-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Properties</h1>

        <Link
          to="/properties/new"
          search={{ type: "elite" }}
          className="btn-primary"
        >
          Create New Property
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Search properties..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input flex-1"
        />

        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
          className="input w-auto min-w-36"
        >
          <option value="">All Tiers</option>
          <option value="elite">Elite</option>
          <option value="standard">Standard</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input w-auto min-w-40"
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-error/10 border border-error/20 rounded-lg p-4 mb-6">
          <p className="text-error text-sm">
            Failed to load properties: {error.message}
          </p>
        </div>
      )}

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-secondary">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Property
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Tier
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
                  Loading properties...
                </td>
              </tr>
            ) : !data || data.properties.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-muted-foreground"
                >
                  No properties found. Create your first property to get
                  started.
                </td>
              </tr>
            ) : (
              data.properties.map((property) => (
                <tr
                  key={property.id}
                  className="hover:bg-secondary/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {property.primaryImageUrl && (
                        <img
                          src={property.primaryImageUrl}
                          alt={property.title}
                          className="h-10 w-10 rounded-lg object-cover mr-3"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {property.title}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {property.bedrooms} bed • {property.maxGuests} guests
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {property.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={
                        property.tier === "elite"
                          ? "badge-elite"
                          : "badge-standard"
                      }
                    >
                      {property.tier}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={cn(
                        "px-2.5 py-1 inline-flex text-xs leading-5 font-medium rounded-full",
                        property.status === "published" &&
                          "bg-success/20 text-success",
                        property.status === "draft" &&
                          "bg-warning/20 text-warning",
                        property.status === "archived" &&
                          "bg-error/20 text-error"
                      )}
                    >
                      {property.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    €{(property.basePrice / 100).toFixed(0)} / night
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      to="/properties/$id/edit"
                      params={{ id: property.id }}
                      className="text-primary hover:text-primary-hover mr-4 transition-colors"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          window.confirm(
                            "Are you sure you want to archive this property?"
                          )
                        ) {
                          deleteProperty.mutate(property.id);
                        }
                      }}
                      disabled={deleteProperty.isPending}
                      className="text-error hover:text-error/80 disabled:opacity-50 transition-colors"
                    >
                      {deleteProperty.isPending ? "Archiving..." : "Archive"}
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
