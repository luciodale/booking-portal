/**
 * PropertyEditView - Section-level edit interface
 * Each section saves all its fields together via a single save button
 */

import { propertyQueryKeys } from "@/features/broker/property/constants/queryKeys";
import { useCityTaxDefault } from "@/features/broker/property/hooks/useCityTaxDefault";
import { useUpsertCityTax } from "@/features/broker/property/hooks/useUpsertCityTax";
import { useProperty } from "@/features/broker/property/queries/useProperty";
import { useUpdateProperty } from "@/features/broker/property/queries/useUpdateProperty";
import { getFacilityOptions } from "@/modules/constants";
import {
  AdditionalCostsEditor,
  validateAdditionalCosts,
} from "@/modules/ui/react/AdditionalCostsEditor";
import { ExtrasEditor, validateExtras } from "@/modules/ui/react/ExtrasEditor";
import type {
  PropertyAdditionalCost,
  PropertyExtra,
} from "@/features/public/booking/domain/pricingTypes";
import type { UpdatePropertyInput } from "@/schemas/property";
import { useQueryClient } from "@tanstack/react-query";
import {
  EditableFeatureGroupField,
  EditableSectionField,
} from "./EditableField";
import { ImagesManager } from "./ImagesManager";
import { LocationSectionEdit } from "./LocationSectionEdit";

interface PropertyEditViewProps {
  propertyId: string;
}

export function PropertyEditView({ propertyId }: PropertyEditViewProps) {
  const queryClient = useQueryClient();
  const { data: property, isLoading, error } = useProperty(propertyId);
  const updateProperty = useUpdateProperty();

  const refreshProperty = () => {
    queryClient.invalidateQueries({
      queryKey: propertyQueryKeys.detail(propertyId),
    });
  };

  const saveField = async <K extends keyof UpdatePropertyInput>(
    field: K,
    value: UpdatePropertyInput[K]
  ) => {
    await updateProperty.mutateAsync({
      id: propertyId,
      data: { [field]: value },
    });
  };

  const saveFields = async (data: Partial<UpdatePropertyInput>) => {
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
        <EditableSectionField
          title="Basic Information"
          values={{
            title: property.title,
            description: property.description ?? "",
            shortDescription: property.shortDescription ?? "",
          }}
          onSave={(data) => saveFields(data)}
          renderFields={({ values, onChange, disabled }) => (
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="edit-title"
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  Property Title
                </label>
                <input
                  id="edit-title"
                  type="text"
                  value={values.title}
                  onChange={(e) =>
                    onChange({ ...values, title: e.target.value })
                  }
                  disabled={disabled}
                  placeholder="Stunning Oceanfront Villa"
                  maxLength={200}
                  className="input"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-description"
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  Full Description
                </label>
                <textarea
                  id="edit-description"
                  value={values.description}
                  onChange={(e) =>
                    onChange({ ...values, description: e.target.value })
                  }
                  disabled={disabled}
                  placeholder="Detailed description of the property..."
                  rows={6}
                  maxLength={5000}
                  className="input resize-none"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-shortDescription"
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  Short Description
                </label>
                <p className="text-sm text-muted-foreground mb-2">
                  Brief summary for property cards
                </p>
                <textarea
                  id="edit-shortDescription"
                  value={values.shortDescription}
                  onChange={(e) =>
                    onChange({ ...values, shortDescription: e.target.value })
                  }
                  disabled={disabled}
                  placeholder="Luxury villa with stunning sea views..."
                  rows={3}
                  maxLength={500}
                  className="input resize-none"
                />
              </div>
            </div>
          )}
        />
      </section>

      {/* Location */}
      <section className="bg-card border border-border p-6 rounded-xl">
        <LocationSectionEdit property={property} saveFields={saveFields} />
      </section>

      {/* Property Details */}
      <section className="bg-card border border-border p-6 rounded-xl">
        <EditableSectionField
          title="Property Details"
          values={{
            maxOccupancy: property.maxOccupancy ?? undefined,
            bedrooms: property.bedrooms ?? undefined,
            bathrooms: property.bathrooms ?? undefined,
            sqMeters: property.sqMeters ?? undefined,
          }}
          onSave={(data) => saveFields(data)}
          renderFields={({ values, onChange, disabled }) => (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <label
                  htmlFor="edit-maxOccupancy"
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  Max Occupancy
                </label>
                <input
                  id="edit-maxOccupancy"
                  type="number"
                  value={values.maxOccupancy ?? ""}
                  onChange={(e) =>
                    onChange({
                      ...values,
                      maxOccupancy:
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

      {/* Pricing Information */}
      <section className="bg-card border border-border p-6 rounded-xl">
        <h2 className="text-xl font-semibold text-foreground mb-4">Pricing</h2>
        <div className="bg-secondary/50 rounded-lg p-4">
          <p className="text-muted-foreground">
            Property pricing is managed through <strong>Smoobu</strong>. Dynamic
            pricing, availability, and booking rates are synchronized from your
            Smoobu account.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            To update pricing, please use your Smoobu dashboard.
          </p>
        </div>
      </section>

      {/* Additional Costs */}
      <section className="bg-card border border-border p-6 rounded-xl">
        <EditableSectionField
          title="Additional Costs"
          description="Optional fees charged on top of the nightly rate (amounts in cents)."
          values={{ additionalCosts: (property.additionalCosts ?? []) as PropertyAdditionalCost[] }}
          onSave={(data) => saveField("additionalCosts", data.additionalCosts)}
          validate={(data) => validateAdditionalCosts(data.additionalCosts)}
          renderFields={({ values, onChange, disabled, showErrors }) => (
            <AdditionalCostsEditor
              costs={values.additionalCosts}
              perOptions={[
                { value: "stay", label: "Per Stay" },
                { value: "night", label: "Per Night" },
                { value: "guest", label: "Per Guest" },
                { value: "night_per_guest", label: "Per Night Per Guest" },
              ]}
              showMaxNights
              onChange={(costs) =>
                onChange({ additionalCosts: costs as PropertyAdditionalCost[] })
              }
              disabled={disabled}
              showErrors={showErrors}
            />
          )}
        />
      </section>

      {/* Extras */}
      <section className="bg-card border border-border p-6 rounded-xl">
        <EditableSectionField
          title="Extras"
          description="Optional add-ons guests can select during booking (amounts in cents)."
          values={{ extras: (property.extras ?? []) as PropertyExtra[] }}
          onSave={(data) => saveField("extras", data.extras)}
          validate={(data) => validateExtras(data.extras)}
          renderFields={({ values, onChange, disabled, showErrors }) => (
            <ExtrasEditor
              extras={values.extras}
              onChange={(extras) => onChange({ extras })}
              disabled={disabled}
              showErrors={showErrors}
            />
          )}
        />
      </section>

      {/* City Tax */}
      {property.city && property.country && (
        <CityTaxSection city={property.city} country={property.country} />
      )}

      {/* Images */}
      <section className="bg-card border border-border p-6 rounded-xl">
        <ImagesManager
          propertyId={propertyId}
          images={property.images ?? []}
          onRefresh={refreshProperty}
        />
      </section>

      {/* Booking Options */}
      <section className="bg-card border border-border p-6 rounded-xl">
        <EditableSectionField
          title="Booking Options"
          values={{
            checkIn: property.checkIn ?? "",
            checkOut: property.checkOut ?? "",
            instantBook: property.instantBook ? "yes" : "no",
          }}
          onSave={(data) =>
            saveFields({
              checkIn: data.checkIn || null,
              checkOut: data.checkOut || null,
              instantBook: data.instantBook === "yes",
            })
          }
          renderFields={({ values, onChange, disabled }) => (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="edit-checkIn"
                    className="block text-sm font-medium text-foreground mb-1"
                  >
                    Check-in Time
                  </label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Default check-in time (HH:mm)
                  </p>
                  <input
                    id="edit-checkIn"
                    type="text"
                    value={values.checkIn}
                    onChange={(e) =>
                      onChange({ ...values, checkIn: e.target.value })
                    }
                    disabled={disabled}
                    placeholder="16:00"
                    className="input"
                  />
                </div>
                <div>
                  <label
                    htmlFor="edit-checkOut"
                    className="block text-sm font-medium text-foreground mb-1"
                  >
                    Check-out Time
                  </label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Default check-out time (HH:mm)
                  </p>
                  <input
                    id="edit-checkOut"
                    type="text"
                    value={values.checkOut}
                    onChange={(e) =>
                      onChange({ ...values, checkOut: e.target.value })
                    }
                    disabled={disabled}
                    placeholder="10:00"
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="edit-instantBook"
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  Instant Book
                </label>
                <select
                  id="edit-instantBook"
                  value={values.instantBook}
                  onChange={(e) =>
                    onChange({ ...values, instantBook: e.target.value })
                  }
                  disabled={disabled}
                  className="input"
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
            </div>
          )}
        />
      </section>

      {/* Property Status */}
      <section className="bg-card border border-border p-6 rounded-xl">
        <EditableSectionField
          title="Property Status"
          values={{
            status: property.status,
            tier: property.tier,
          }}
          onSave={(data) =>
            saveFields({
              status: data.status as "draft" | "published" | "archived",
              tier: data.tier as "elite" | "standard",
            })
          }
          renderFields={({ values, onChange, disabled }) => (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="edit-status"
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  Status
                </label>
                <select
                  id="edit-status"
                  value={values.status}
                  onChange={(e) =>
                    onChange({ ...values, status: e.target.value })
                  }
                  disabled={disabled}
                  className="input"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="edit-tier"
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  Tier
                </label>
                <select
                  id="edit-tier"
                  value={values.tier}
                  onChange={(e) =>
                    onChange({ ...values, tier: e.target.value })
                  }
                  disabled={disabled}
                  className="input"
                >
                  <option value="elite">Elite</option>
                  <option value="standard">Standard</option>
                </select>
              </div>
            </div>
          )}
        />
      </section>
    </div>
  );
}

function CityTaxSection({ city, country }: { city: string; country: string }) {
  const cityTaxQuery = useCityTaxDefault(city, country);
  const upsertCityTax = useUpsertCityTax();

  const currentAmount = cityTaxQuery.data?.amount ?? undefined;
  const currentMaxNights = cityTaxQuery.data?.maxNights ?? undefined;

  return (
    <section className="bg-card border border-border p-6 rounded-xl">
      <EditableSectionField
        title="City Tax"
        description={`Tourist tax for ${city}, ${country} (cents per person per night).`}
        values={{
          amount: currentAmount,
          maxNights: currentMaxNights,
        }}
        onSave={async (data) => {
          if (data.amount == null) return;
          await upsertCityTax.mutateAsync({
            city,
            country,
            amount: data.amount,
            maxNights: data.maxNights ?? null,
          });
        }}
        renderFields={({ values, onChange, disabled }) => (
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="edit-cityTaxAmount"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Amount (cents/person/night)
              </label>
              <input
                id="edit-cityTaxAmount"
                type="number"
                value={values.amount ?? ""}
                onChange={(e) =>
                  onChange({
                    ...values,
                    amount:
                      e.target.value === ""
                        ? undefined
                        : Number(e.target.value),
                  })
                }
                disabled={disabled}
                min={0}
                className="input"
              />
            </div>
            <div>
              <label
                htmlFor="edit-cityTaxMaxNights"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Max Nights (optional)
              </label>
              <input
                id="edit-cityTaxMaxNights"
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
        )}
      />
    </section>
  );
}
