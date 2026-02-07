/**
 * CreatePropertyForm - Create property with Smoobu integration
 * Step 1: Select Smoobu property
 * Step 2+: Fill additional details (pre-populated from Smoobu)
 */

import {
  type FeatureFieldName,
  displayToKebab,
  syncFeatureFields,
} from "@/modules/property/domain/sync-features";
import { getFacilityOptions } from "@/modules/shared/constants";
import {
  FormSection,
  ImagesInput,
  type NewImage,
  NumberInput,
  SelectInput,
  TagsInput,
  TextInput,
  TextareaInput,
} from "@/modules/shared/forms";
import { SmoobuPropertySelector } from "@/modules/smoobu/ui/SmoobuPropertySelector";
import type { CreatePropertyInput } from "@/schemas";
import { createPropertySchema } from "@/schemas";
import type { SmoobuApartmentDetails } from "@/schemas/smoobu";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// =============================================================================
// Types
// =============================================================================

/** Form data - property fields + new images */
export interface CreatePropertyFormData extends CreatePropertyInput {
  images: NewImage[];
}

// =============================================================================
// Schema
// =============================================================================

const imageSchema = z.object({
  id: z.string(),
  file: z.custom<File>(),
  previewUrl: z.string(),
  isPrimary: z.boolean(),
});

const formSchema = createPropertySchema.extend({
  images: z.array(imageSchema).min(1, "At least one image required"),
});

// =============================================================================
// Component
// =============================================================================

interface CreatePropertyFormProps {
  onSubmit: (data: CreatePropertyFormData) => Promise<void>;
  isLoading?: boolean;
}

export function CreatePropertyForm({
  onSubmit,
  isLoading = false,
}: CreatePropertyFormProps) {
  const [selectedSmoobuId, setSelectedSmoobuId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { control, handleSubmit, formState, setValue, watch, reset } =
    useForm<CreatePropertyFormData>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        brokerId: "broker-001", // TODO: Get from auth context
        tier: "elite",
        status: "draft",
        amenities: [],
        highlights: [],
        views: [],
        images: [],
      },
    });

  const images = watch("images");
  const tier = watch("tier");
  const amenities = watch("amenities") ?? [];
  const highlights = watch("highlights") ?? [];
  const views = watch("views") ?? [];

  const isElite = tier === "elite";

  // Handle Smoobu property selection - pre-populate form
  const handleSmoobuSelect = (
    apartmentId: number,
    details: SmoobuApartmentDetails
  ) => {
    setSelectedSmoobuId(apartmentId);

    // Pre-populate form with Smoobu data
    setValue("smoobuPropertyId", apartmentId);
    setValue(
      "location",
      `${details.location.city}, ${details.location.country}`
    );
    setValue("street", details.location.street);
    setValue("zip", details.location.zip);
    setValue("city", details.location.city);
    setValue("country", details.location.country);
    setValue("latitude", details.location.latitude);
    setValue("longitude", details.location.longitude);

    // Room details
    setValue("maxOccupancy", details.rooms.maxOccupancy);
    setValue("bedrooms", details.rooms.bedrooms);
    setValue("bathrooms", details.rooms.bathrooms);
    setValue("doubleBeds", details.rooms.doubleBeds);
    setValue("singleBeds", details.rooms.singleBeds);
    setValue("sofaBeds", details.rooms.sofaBeds);
    setValue("couches", details.rooms.couches);
    setValue("childBeds", details.rooms.childBeds);
    setValue("queenSizeBeds", details.rooms.queenSizeBeds);
    setValue("kingSizeBeds", details.rooms.kingSizeBeds);

    // Pre-fill amenities from Smoobu equipments
    if (details.equipments && details.equipments.length > 0) {
      const kebabAmenities = details.equipments.map((eq) =>
        eq.toLowerCase().replace(/\s+/g, "-")
      );
      setValue("amenities", kebabAmenities);
    }

    setShowForm(true);
  };

  // Synced change handler for amenities/highlights/views
  const handleSyncedChange = (
    fieldName: FeatureFieldName,
    newValue: string[]
  ) => {
    const synced = syncFeatureFields(
      { amenities, highlights, views },
      fieldName,
      newValue
    );

    if (synced.amenities !== amenities) {
      setValue("amenities", synced.amenities);
    }
    if (synced.highlights !== highlights) {
      setValue("highlights", synced.highlights);
    }
    if (synced.views !== views) {
      setValue("views", synced.views);
    }
  };

  // Step 1: Smoobu Property Selection
  if (!showForm) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Create Property
          </h2>
          <p className="text-muted-foreground">
            Select a property from Smoobu to import its details.
          </p>
        </div>

        <SmoobuPropertySelector
          onSelect={handleSmoobuSelect}
          isLoading={isLoading}
        />
      </div>
    );
  }

  // Step 2+: Property Form (pre-populated)
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-4xl mx-auto space-y-8"
    >
      {/* Success Banner */}
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
        <p className="text-sm text-foreground">
          ✓ Smoobu property selected (ID: {selectedSmoobuId})
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Complete the form below with additional details for your listing.
        </p>
      </div>

      {/* Property Tier */}
      <FormSection title="Property Type">
        <SelectInput
          name="tier"
          control={control}
          label="Property Tier"
          required
          options={[
            {
              value: "elite",
              label: "Elite - Luxury properties with premium features",
            },
            { value: "standard", label: "Standard - Regular vacation rentals" },
          ]}
        />
      </FormSection>

      {/* Basic Information */}
      <FormSection title="Basic Information">
        <TextInput
          name="title"
          control={control}
          label="Property Title"
          required
          placeholder="Stunning Oceanfront Villa"
          maxLength={200}
        />

        <TextareaInput
          name="description"
          control={control}
          label="Full Description"
          required
          placeholder="Detailed description of the property..."
          rows={6}
        />

        <TextareaInput
          name="shortDescription"
          control={control}
          label="Short Description"
          required
          description="Brief summary for property cards"
          placeholder="Luxury villa with stunning sea views..."
          rows={3}
        />
      </FormSection>

      {/* Location (pre-filled from Smoobu) */}
      <FormSection title="Location">
        <TextInput
          name="location"
          control={control}
          label="Location"
          required
          placeholder="Amalfi Coast, Italy"
        />

        <div className="grid grid-cols-2 gap-4">
          <TextInput
            name="city"
            control={control}
            label="City"
            placeholder="Amalfi"
          />
          <TextInput
            name="country"
            control={control}
            label="Country"
            placeholder="Italy"
          />
        </div>

        <TextInput
          name="street"
          control={control}
          label="Street Address"
          placeholder="Via Cristoforo Colombo 12"
        />

        <div className="grid grid-cols-2 gap-4">
          <TextInput
            name="zip"
            control={control}
            label="ZIP Code"
            placeholder="84011"
          />
          <TextInput
            name="latitude"
            control={control}
            label="Latitude"
            placeholder="40.6331"
          />
        </div>

        <TextInput
          name="longitude"
          control={control}
          label="Longitude"
          placeholder="14.6028"
        />
      </FormSection>

      {/* Property Details (pre-filled from Smoobu) */}
      <FormSection title="Property Details">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <NumberInput
            name="maxOccupancy"
            control={control}
            label="Max Occupancy"
            min={1}
            max={50}
          />
          <NumberInput
            name="bedrooms"
            control={control}
            label="Bedrooms"
            min={0}
            max={20}
          />
          <NumberInput
            name="bathrooms"
            control={control}
            label="Bathrooms"
            min={0}
            max={20}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <NumberInput
            name="doubleBeds"
            control={control}
            label="Double Beds"
            min={0}
          />
          <NumberInput
            name="singleBeds"
            control={control}
            label="Single Beds"
            min={0}
          />
          <NumberInput
            name="queenSizeBeds"
            control={control}
            label="Queen Beds"
            min={0}
          />
          <NumberInput
            name="kingSizeBeds"
            control={control}
            label="King Beds"
            min={0}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <NumberInput
            name="sofaBeds"
            control={control}
            label="Sofa Beds"
            min={0}
          />
          <NumberInput
            name="couches"
            control={control}
            label="Couches"
            min={0}
          />
          <NumberInput
            name="childBeds"
            control={control}
            label="Child Beds"
            min={0}
          />
        </div>

        <NumberInput
          name="sqMeters"
          control={control}
          label="Size (m²)"
          min={10}
        />
      </FormSection>

      {/* Features & Amenities (amenities pre-filled from Smoobu) */}
      <FormSection title="Features & Amenities">
        <p className="text-sm text-muted-foreground mb-4">
          Amenities pre-filled from Smoobu. Items are unique across all
          categories.
        </p>

        <TagsInput
          name="amenities"
          control={control}
          label="Property Amenities"
          description="Pre-filled from Smoobu - you can add more"
          options={getFacilityOptions("amenity")}
          onChangeOverride={(newValue) =>
            handleSyncedChange("amenities", newValue)
          }
          formatDisplay={(v) =>
            v
              .split("-")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" ")
          }
          formatValue={displayToKebab}
        />

        <TagsInput
          name="highlights"
          control={control}
          label="Signature Highlights"
          description="Key features that make this property special"
          options={getFacilityOptions("highlight")}
          onChangeOverride={(newValue) =>
            handleSyncedChange("highlights", newValue)
          }
          formatDisplay={(v) =>
            v
              .split("-")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" ")
          }
          formatValue={displayToKebab}
        />

        <TagsInput
          name="views"
          control={control}
          label="Panoramic Views"
          description="Views available from the property"
          options={getFacilityOptions("view")}
          onChangeOverride={(newValue) => handleSyncedChange("views", newValue)}
          formatDisplay={(v) =>
            v
              .split("-")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" ")
          }
          formatValue={displayToKebab}
        />
      </FormSection>

      {/* Images */}
      <FormSection title="Property Images">
        <p className="text-sm text-muted-foreground mb-4">
          Upload high-quality images of your property. The first image will be
          the primary display image.
        </p>
        <ImagesInput
          images={images}
          onChange={(newImages) => setValue("images", newImages)}
          error={formState.errors.images?.message}
        />
      </FormSection>

      {/* Elite-Only: Additional Media */}
      {isElite && (
        <FormSection title="Additional Media (Elite)">
          <TextInput
            name="videoUrl"
            control={control}
            label="Video URL"
            description="Optional video URL for elite property showcase"
            placeholder="https://vimeo.com/..."
          />

          <TextInput
            name="pdfAssetPath"
            control={control}
            label="PDF Flyer Path"
            description="Path to manually uploaded PDF flyer"
            placeholder="/flyers/mallorca-villa.pdf"
          />
        </FormSection>
      )}

      {/* Submit */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => {
            setShowForm(false);
            reset();
          }}
        >
          Back to Selection
        </button>

        <button
          type="submit"
          disabled={isLoading || formState.isSubmitting}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading || formState.isSubmitting
            ? "Creating..."
            : "Create Property"}
        </button>
      </div>

      {formState.errors && Object.keys(formState.errors).length > 0 && (
        <div className="bg-error/10 border border-error/20 rounded-lg p-4">
          <p className="text-sm text-error font-medium mb-2">
            Please fix the errors above before submitting:
          </p>
          <ul className="text-xs text-error space-y-1 list-disc list-inside">
            {Object.entries(formState.errors).map(([key, error]) => (
              <li key={key}>
                {key}: {error?.message?.toString()}
              </li>
            ))}
          </ul>
        </div>
      )}
    </form>
  );
}
