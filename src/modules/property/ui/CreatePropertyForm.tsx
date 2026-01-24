/**
 * CreatePropertyForm - Create-only form with tier-aware fields
 * Elite properties show additional fields: videoUrl, pdfAssetPath
 */

import type { CreatePropertyInput } from "@/modules/property/domain/schema";
import { createPropertySchema } from "@/modules/property/domain/schema";
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
import { zodResolver } from "@hookform/resolvers/zod";
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
  const { control, handleSubmit, formState, setValue, watch } =
    useForm<CreatePropertyFormData>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        brokerId: "broker-001", // TODO: Get from auth context
        tier: "elite",
        status: "draft",
        currency: "eur",
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

  // Synced change handler - applies pure sync logic and updates form
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

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-4xl mx-auto space-y-8"
    >
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
        <p className="text-sm text-muted-foreground -mt-2">
          {isElite
            ? "Elite properties include video and PDF flyer options."
            : "Standard properties have streamlined fields for quick setup."}
        </p>
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

      {/* Location */}
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
          name="address"
          control={control}
          label="Full Address"
          placeholder="Via Cristoforo Colombo 12, 84011 Amalfi SA"
        />
      </FormSection>

      {/* Property Details */}
      <FormSection title="Property Details">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <NumberInput
            name="maxGuests"
            control={control}
            label="Max Guests"
            required
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
          <NumberInput
            name="sqMeters"
            control={control}
            label="Size (m²)"
            min={10}
          />
        </div>
      </FormSection>

      {/* Features & Amenities (synced group) */}
      <FormSection title="Features & Amenities">
        <p className="text-sm text-muted-foreground mb-4">
          Items are unique across all categories - adding to one removes from
          others
        </p>

        <TagsInput
          name="amenities"
          control={control}
          label="Property Amenities"
          required
          description="Select all amenities available"
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

      {/* Pricing */}
      <FormSection title="Pricing">
        <div className="grid grid-cols-2 gap-4">
          <NumberInput
            name="basePrice"
            control={control}
            label="Base Price (cents)"
            required
            description="Price in cents per night (e.g., 250000 = €2,500/night)"
            min={100}
          />
          <NumberInput
            name="cleaningFee"
            control={control}
            label="Cleaning Fee (cents)"
            description="One-time cleaning fee in cents"
            min={0}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <NumberInput
            name="minNights"
            control={control}
            label="Minimum Nights"
            min={1}
          />
          <NumberInput
            name="maxNights"
            control={control}
            label="Maximum Nights"
            min={1}
          />
        </div>

        <SelectInput
          name="currency"
          control={control}
          label="Currency"
          required
          options={[
            { value: "eur", label: "EUR (€)" },
            { value: "usd", label: "USD ($)" },
            { value: "gbp", label: "GBP (£)" },
          ]}
        />
      </FormSection>

      {/* Images */}
      <FormSection title="Property Images">
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
          onClick={() => window.history.back()}
        >
          Cancel
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
          <p className="text-sm text-error font-medium">
            Please fix the errors above before submitting.
          </p>
        </div>
      )}
    </form>
  );
}
