/**
 * Create Property Route
 * Step 1: Select tier (Elite / Standard)
 * Step 2: Select property from integration
 * Step 3: Smart form with per-field Smoobu link buttons + images + submit
 */

import { mapSmoobuListingToCreatePropertyPartial } from "@/features/broker/property/domain/mapIntegrationListingToPrefill";
import { displayToKebab } from "@/features/broker/property/domain/sync-features";
import { useCreateProperty } from "@/features/broker/property/queries";
import { createSectionRoute } from "@/features/broker/property/routes/createSection";
import {
  CreatePropertyForm,
  type CreatePropertyFormData,
} from "@/features/broker/property/ui";
import { useIntegrationListingDetails } from "@/features/broker/pms/queries/useIntegrationListingDetails";
import { useIntegrationListings } from "@/features/broker/pms/queries/useIntegrationListings";
import { useIsPmsIntegrated } from "@/features/broker/pms/queries/useIsPmsIntegrated";
import { Select } from "@/modules/ui/Select";
import { showError } from "@/modules/ui/react/stores/notificationStore";
import { getErrorMessages } from "@/modules/utils/errors";
import { createRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

// =============================================================================
// Tier Selection Step
// =============================================================================

function TierCard({
  tier,
  title,
  description,
  selected,
  onSelect,
}: {
  tier: "elite" | "standard";
  title: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`text-left p-6 rounded-xl border-2 transition-all ${
        selected
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/40 bg-card"
      }`}
    >
      <div className="flex items-center gap-3 mb-2">
        <div
          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
            selected ? "border-primary" : "border-muted-foreground"
          }`}
        >
          {selected && <div className="w-2 h-2 rounded-full bg-primary" />}
        </div>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {tier === "elite" && <span className="badge-elite text-xs">Elite</span>}
      </div>
      <p className="text-sm text-muted-foreground ml-7">{description}</p>
    </button>
  );
}

// =============================================================================
// Main Component
// =============================================================================

function CreatePropertyPage() {
  const navigate = useNavigate();
  const { isIntegrated, isLoading: isIntegrationLoading } =
    useIsPmsIntegrated();
  const listingsQuery = useIntegrationListings(!!isIntegrated);

  const [selectedTier, setSelectedTier] = useState<
    "elite" | "standard" | null
  >(null);
  const [selectedListing, setSelectedListing] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const detailsQuery = useIntegrationListingDetails(
    selectedListing?.id ?? null
  );
  const createProperty = useCreateProperty({});
  const [isUploading, setIsUploading] = useState(false);

  const smoobuData =
    selectedListing && detailsQuery.data
      ? mapSmoobuListingToCreatePropertyPartial(
          selectedListing,
          detailsQuery.data
        )
      : null;

  async function handleSubmit(data: CreatePropertyFormData) {
    try {
      const { images, ...propertyData } = data;
      const normalizedData = {
        ...propertyData,
        amenities: propertyData.amenities?.map(displayToKebab) ?? [],
        highlights: propertyData.highlights?.map(displayToKebab) ?? [],
        views: propertyData.views?.map(displayToKebab) ?? [],
      };

      const newProperty = await createProperty.mutateAsync(normalizedData);

      if (images.length > 0) {
        setIsUploading(true);
        const formData = new FormData();
        formData.append("assetId", newProperty.id);
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
          showError("Property created but image upload failed.");
        }
        setIsUploading(false);
      }

      navigate({
        to: "/properties/$id/edit",
        params: { id: newProperty.id },
      });
    } catch (error) {
      console.error("Submission failed", error);
      setIsUploading(false);
    }
  }

  // Loading state
  if (isIntegrationLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="h-8 w-8 animate-spin rounded-full border-[1.5px] border-zinc-800/20 border-t-zinc-900" />
      </div>
    );
  }

  // No integration
  if (!isIntegrated) {
    return (
      <div className="max-w-xl">
        <h1 className="text-3xl font-bold text-foreground mb-6">
          Create New Property
        </h1>
        <p className="text-muted-foreground mb-4">
          Connect an integration to create a property from your PMS.
        </p>
        <Link to="/" className="text-primary hover:underline">
          Go to dashboard to connect integration
        </Link>
      </div>
    );
  }

  const listings = listingsQuery.data?.listings ?? [];
  const listingsOptions = listings.map((l) => ({
    value: String(l.id),
    label: l.name,
  }));

  // Step 1: Tier selection
  if (!selectedTier) {
    return (
      <div className="max-w-xl">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Create New Property
        </h1>
        <p className="text-muted-foreground mb-8">
          Choose the property tier to get started.
        </p>

        <div className="grid gap-4">
          <TierCard
            tier="elite"
            title="Elite"
            description="Luxury properties with premium features, video backgrounds, and PDF flyers."
            selected={selectedTier === "elite"}
            onSelect={() => setSelectedTier("elite")}
          />
          <TierCard
            tier="standard"
            title="Standard"
            description="Quality vacation rentals with all essential features."
            selected={selectedTier === "standard"}
            onSelect={() => setSelectedTier("standard")}
          />
        </div>
      </div>
    );
  }

  // Step 2: Smoobu property selection
  if (!selectedListing) {
    return (
      <div className="max-w-xl">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Create New Property
        </h1>
        <p className="text-muted-foreground mb-6">
          <span className="capitalize">{selectedTier}</span> tier selected.
          <button
            type="button"
            onClick={() => setSelectedTier(null)}
            className="text-primary hover:underline ml-2"
          >
            Change
          </button>
        </p>

        <div className="max-w-md">
          <label
            htmlFor="integration-listing-select"
            className="block text-sm font-medium text-foreground mb-1"
          >
            Select a Smoobu property
          </label>
          <Select
            id="integration-listing-select"
            value=""
            onChange={(v) => {
              const id = v ? Number(v) : null;
              const item = id ? listings.find((l) => l.id === id) : null;
              setSelectedListing(item ?? null);
            }}
            options={listingsOptions}
            placeholder={
              listingsQuery.isLoading ? "Loading..." : "Select property"
            }
          />
          {listings.length === 0 && !listingsQuery.isLoading && (
            <p className="text-sm text-muted-foreground mt-2">
              No properties found in your Smoobu account.
            </p>
          )}
        </div>
      </div>
    );
  }

  // Step 3: Form with per-field link buttons
  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-2">
        Create New Property
      </h1>
      <p className="text-muted-foreground mb-8">
        <span className="capitalize">{selectedTier}</span> &middot;{" "}
        {selectedListing.name}
        <button
          type="button"
          onClick={() => {
            setSelectedListing(null);
          }}
          className="text-primary hover:underline ml-2"
        >
          Change
        </button>
      </p>

      <CreatePropertyForm
        key={`${selectedTier}-${selectedListing.id}`}
        onSubmit={handleSubmit}
        isLoading={createProperty.isPending || isUploading}
        integrationPropertyId={selectedListing.id}
        tier={selectedTier}
        smoobuData={smoobuData}
      />

      {createProperty.isError && (
        <div className="mt-4 bg-error/10 border border-error/20 rounded-lg p-4 max-w-4xl mx-auto">
          <p className="text-error font-medium text-sm mb-2">
            Validation errors:
          </p>
          <ul className="list-disc list-inside space-y-1">
            {getErrorMessages(createProperty.error).map((msg) => (
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

export const createPropertyRoute = createRoute({
  getParentRoute: () => createSectionRoute,
  path: "/properties/new",
  component: CreatePropertyPage,
});
