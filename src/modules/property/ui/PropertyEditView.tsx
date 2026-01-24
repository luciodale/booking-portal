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
  EditableSectionField,
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
        <EditableSectionField
          title="Property Details"
          values={{
            maxGuests: property.maxGuests ?? undefined,
            bedrooms: property.bedrooms ?? undefined,
            bathrooms: property.bathrooms ?? undefined,
            sqMeters: property.sqMeters ?? undefined,
          }}
          onSave={(data) => saveFields(data)}
          renderFields={({ values, onChange, disabled }) => (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <label
                  htmlFor="edit-maxGuests"
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  Max Guests
                </label>
                <input
                  id="edit-maxGuests"
                  type="number"
                  value={values.maxGuests ?? ""}
                  onChange={(e) =>
                    onChange({
                      ...values,
                      maxGuests:
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value),
                    })
                  }
                  disabled={disabled}
                  min={1}
                  max={50}
                  className="input"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-bedrooms"
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  Bedrooms
                </label>
                <input
                  id="edit-bedrooms"
                  type="number"
                  value={values.bedrooms ?? ""}
                  onChange={(e) =>
                    onChange({
                      ...values,
                      bedrooms:
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value),
                    })
                  }
                  disabled={disabled}
                  min={0}
                  max={20}
                  className="input"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-bathrooms"
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  Bathrooms
                </label>
                <input
                  id="edit-bathrooms"
                  type="number"
                  value={values.bathrooms ?? ""}
                  onChange={(e) =>
                    onChange({
                      ...values,
                      bathrooms:
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value),
                    })
                  }
                  disabled={disabled}
                  min={0}
                  max={20}
                  className="input"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-sqMeters"
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  Size (m²)
                </label>
                <input
                  id="edit-sqMeters"
                  type="number"
                  value={values.sqMeters ?? ""}
                  onChange={(e) =>
                    onChange({
                      ...values,
                      sqMeters:
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value),
                    })
                  }
                  disabled={disabled}
                  min={10}
                  className="input"
                />
              </div>
            </div>
          )}
        />
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
        <EditableSectionField
          title="Pricing"
          headerAction={
            <Link
              to="/properties/$id/pricing"
              params={{ id: propertyId }}
              className="text-sm text-primary hover:text-primary-hover transition-colors font-medium"
            >
              Manage Dynamic Pricing →
            </Link>
          }
          values={{
            basePrice: property.basePrice,
            cleaningFee: property.cleaningFee ?? undefined,
            minNights: property.minNights ?? undefined,
            maxNights: property.maxNights ?? undefined,
            currency: property.currency,
          }}
          onSave={(data) => saveFields(data)}
          renderFields={({ values, onChange, disabled }) => (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="edit-basePrice"
                    className="block text-sm font-medium text-foreground mb-1"
                  >
                    Base Price (cents)
                  </label>
                  <input
                    id="edit-basePrice"
                    type="number"
                    value={values.basePrice}
                    onChange={(e) =>
                      onChange({
                        ...values,
                        basePrice: Number(e.target.value) || 0,
                      })
                    }
                    disabled={disabled}
                    min={100}
                    className="input"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Price in cents per night (e.g., 250000 = €2,500/night)
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="edit-cleaningFee"
                    className="block text-sm font-medium text-foreground mb-1"
                  >
                    Cleaning Fee (cents)
                  </label>
                  <input
                    id="edit-cleaningFee"
                    type="number"
                    value={values.cleaningFee ?? ""}
                    onChange={(e) =>
                      onChange({
                        ...values,
                        cleaningFee:
                          e.target.value === ""
                            ? undefined
                            : Number(e.target.value),
                      })
                    }
                    disabled={disabled}
                    min={0}
                    className="input"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    One-time cleaning fee in cents
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="edit-minNights"
                    className="block text-sm font-medium text-foreground mb-1"
                  >
                    Minimum Nights
                  </label>
                  <input
                    id="edit-minNights"
                    type="number"
                    value={values.minNights ?? ""}
                    onChange={(e) =>
                      onChange({
                        ...values,
                        minNights:
                          e.target.value === ""
                            ? undefined
                            : Number(e.target.value),
                      })
                    }
                    disabled={disabled}
                    min={1}
                    className="input"
                  />
                </div>

                <div>
                  <label
                    htmlFor="edit-maxNights"
                    className="block text-sm font-medium text-foreground mb-1"
                  >
                    Maximum Nights
                  </label>
                  <input
                    id="edit-maxNights"
                    type="number"
                    value={values.maxNights ?? ""}
                    onChange={(e) =>
                      onChange({
                        ...values,
                        maxNights:
                          e.target.value === ""
                            ? undefined
                            : Number(e.target.value),
                      })
                    }
                    disabled={disabled}
                    min={1}
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="edit-currency"
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  Currency
                </label>
                <select
                  id="edit-currency"
                  value={values.currency ?? "eur"}
                  onChange={(e) =>
                    onChange({
                      ...values,
                      currency: e.target.value as "eur" | "usd" | "gbp",
                    })
                  }
                  disabled={disabled}
                  className="input"
                >
                  <option value="eur">EUR (€)</option>
                  <option value="usd">USD ($)</option>
                  <option value="gbp">GBP (£)</option>
                </select>
              </div>
            </div>
          )}
        />
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
