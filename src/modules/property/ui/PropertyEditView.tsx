/**
 * PropertyEditView - Per-field edit interface
 * Each field saves independently via inline save buttons
 */

import type { UpdatePropertyRequest } from "@/modules/api-client/types";
import {
  queryKeys,
  useProperty,
  useUpdateProperty,
} from "@/modules/property/hooks/queries";
import { getFacilityOptions } from "@/modules/shared/constants";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  EditableFeatureGroupField,
  EditableNumberField,
  EditableSelectField,
  EditableTextField,
  EditableTextareaField,
} from "./EditableField";
import { ImagesManager } from "./ImagesManager";

interface PropertyEditViewProps {
  propertyId: string;
}

export function PropertyEditView({ propertyId }: PropertyEditViewProps) {
  const queryClient = useQueryClient();
  const { data: property, isLoading, error } = useProperty(propertyId);
  const updateProperty = useUpdateProperty();

  const refreshProperty = () => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.properties.detail(propertyId),
    });
  };

  const saveField = async <K extends keyof UpdatePropertyRequest>(
    field: K,
    value: UpdatePropertyRequest[K]
  ) => {
    await updateProperty.mutateAsync({
      id: propertyId,
      data: { [field]: value },
    });
  };

  const saveFields = async (data: Partial<UpdatePropertyRequest>) => {
    await updateProperty.mutateAsync({
      id: propertyId,
      data,
    });
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="text-center text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="p-8">
        <div className="text-center text-error">
          {error?.message || "Property not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Basic Information */}
      <section className="bg-card border border-border p-6 rounded-xl">
        <h2 className="text-xl font-semibold text-foreground mb-6">
          Basic Information
        </h2>

        <div className="space-y-6">
          <EditableTextField
            label="Property Title"
            value={property.title}
            onSave={(v) => saveField("title", v)}
            placeholder="Stunning Oceanfront Villa"
            maxLength={200}
          />

          <EditableTextareaField
            label="Full Description"
            value={property.description ?? ""}
            onSave={(v) => saveField("description", v)}
            placeholder="Detailed description of the property..."
            rows={6}
            maxLength={5000}
          />

          <EditableTextareaField
            label="Short Description"
            value={property.shortDescription ?? ""}
            onSave={(v) => saveField("shortDescription", v)}
            description="Brief summary for property cards"
            placeholder="Luxury villa with stunning sea views..."
            rows={3}
            maxLength={500}
          />
        </div>
      </section>

      {/* Location */}
      <section className="bg-card border border-border p-6 rounded-xl">
        <h2 className="text-xl font-semibold text-foreground mb-6">Location</h2>

        <div className="space-y-6">
          <EditableTextField
            label="Location"
            value={property.location}
            onSave={(v) => saveField("location", v)}
            placeholder="Amalfi Coast, Italy"
          />

          <div className="grid grid-cols-2 gap-6">
            <EditableTextField
              label="City"
              value={property.city ?? ""}
              onSave={(v) => saveField("city", v)}
              placeholder="Amalfi"
            />

            <EditableTextField
              label="Country"
              value={property.country ?? ""}
              onSave={(v) => saveField("country", v)}
              placeholder="Italy"
            />
          </div>

          <EditableTextField
            label="Full Address"
            value={property.address ?? ""}
            onSave={(v) => saveField("address", v)}
            placeholder="Via Cristoforo Colombo 12, 84011 Amalfi SA"
          />
        </div>
      </section>

      {/* Property Details */}
      <section className="bg-card border border-border p-6 rounded-xl">
        <h2 className="text-xl font-semibold text-foreground mb-6">
          Property Details
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <EditableNumberField
            label="Max Guests"
            value={property.maxGuests ?? undefined}
            onSave={(v) => saveField("maxGuests", v)}
            min={1}
            max={50}
          />

          <EditableNumberField
            label="Bedrooms"
            value={property.bedrooms ?? undefined}
            onSave={(v) => saveField("bedrooms", v)}
            min={0}
            max={20}
          />

          <EditableNumberField
            label="Bathrooms"
            value={property.bathrooms ?? undefined}
            onSave={(v) => saveField("bathrooms", v)}
            min={0}
            max={20}
          />

          <EditableNumberField
            label="Size (m²)"
            value={property.sqMeters ?? undefined}
            onSave={(v) => saveField("sqMeters", v)}
            min={10}
          />
        </div>
      </section>

      {/* Features & Amenities (synced group) */}
      <section className="bg-card border border-border p-6 rounded-xl">
        <EditableFeatureGroupField
          amenities={property.amenities ?? []}
          highlights={property.highlights ?? []}
          views={property.views ?? []}
          onSave={(data) => saveFields(data)}
          amenitiesOptions={getFacilityOptions("amenity")}
          highlightsOptions={getFacilityOptions("highlight")}
          viewsOptions={getFacilityOptions("view")}
        />
      </section>

      {/* Pricing */}
      <section className="bg-card border border-border p-6 rounded-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-foreground">Pricing</h2>
          <Link
            to="/properties/$id/pricing"
            params={{ id: propertyId }}
            className="text-sm text-primary hover:text-primary-hover transition-colors font-medium"
          >
            Manage Dynamic Pricing →
          </Link>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <EditableNumberField
              label="Base Price (cents)"
              value={property.basePrice}
              onSave={(v) => saveField("basePrice", v)}
              description="Price in cents per night (e.g., 250000 = €2,500/night)"
              min={100}
            />

            <EditableNumberField
              label="Cleaning Fee (cents)"
              value={property.cleaningFee ?? undefined}
              onSave={(v) => saveField("cleaningFee", v)}
              description="One-time cleaning fee in cents"
              min={0}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <EditableNumberField
              label="Minimum Nights"
              value={property.minNights ?? undefined}
              onSave={(v) => saveField("minNights", v)}
              min={1}
            />

            <EditableNumberField
              label="Maximum Nights"
              value={property.maxNights ?? undefined}
              onSave={(v) => saveField("maxNights", v)}
              min={1}
            />
          </div>

          <EditableSelectField
            label="Currency"
            value={property.currency}
            onSave={(v) => saveField("currency", v as "eur" | "usd" | "gbp")}
            options={[
              { value: "eur", label: "EUR (€)" },
              { value: "usd", label: "USD ($)" },
              { value: "gbp", label: "GBP (£)" },
            ]}
          />
        </div>
      </section>

      {/* Images */}
      <section className="bg-card border border-border p-6 rounded-xl">
        <ImagesManager
          propertyId={propertyId}
          images={property.images ?? []}
          onRefresh={refreshProperty}
        />
      </section>

      {/* Media Links */}
      <section className="bg-card border border-border p-6 rounded-xl">
        <h2 className="text-xl font-semibold text-foreground mb-6">
          Additional Media
        </h2>

        <div className="space-y-6">
          <EditableTextField
            label="Video URL"
            value={property.videoUrl ?? ""}
            onSave={(v) => saveField("videoUrl", v || null)}
            description="Optional video URL for elite properties"
            placeholder="https://vimeo.com/..."
          />

          <EditableTextField
            label="PDF Flyer Path"
            value={property.pdfAssetPath ?? ""}
            onSave={(v) => saveField("pdfAssetPath", v || null)}
            description="Path to manually uploaded PDF flyer"
            placeholder="/flyers/mallorca-villa.pdf"
          />
        </div>
      </section>

      {/* Property Status */}
      <section className="bg-card border border-border p-6 rounded-xl">
        <h2 className="text-xl font-semibold text-foreground mb-6">
          Property Status
        </h2>

        <div className="grid grid-cols-2 gap-6">
          <EditableSelectField
            label="Status"
            value={property.status}
            onSave={(v) =>
              saveField("status", v as "draft" | "published" | "archived")
            }
            options={[
              { value: "draft", label: "Draft" },
              { value: "published", label: "Published" },
              { value: "archived", label: "Archived" },
            ]}
          />

          <EditableSelectField
            label="Tier"
            value={property.tier}
            onSave={(v) => saveField("tier", v as "elite" | "standard")}
            options={[
              { value: "elite", label: "Elite" },
              { value: "standard", label: "Standard" },
            ]}
          />
        </div>
      </section>
    </div>
  );
}
