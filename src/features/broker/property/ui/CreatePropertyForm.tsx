/**
 * CreatePropertyForm - Create property from integration
 * Accepts Smoobu data and shows per-field "link" buttons to fill individual fields.
 */

import {
  type FeatureFieldName,
  displayToKebab,
  syncFeatureFields,
} from "@/features/broker/property/domain/sync-features";
import { getFacilityOptions } from "@/modules/constants";
import {
  FormSection,
  ImagesInput,
  type NewImage,
  NumberInput,
  SelectInput,
  TagsInput,
  TextInput,
  TextareaInput,
} from "@/modules/ui/react/form-inputs";
import type { CreatePropertyInput } from "@/schemas";
import { createPropertySchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link2 } from "lucide-react";
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
// SmoobuLinkButton — small icon button to fill a single field from Smoobu data
// =============================================================================

function SmoobuLinkButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Fill from Smoobu"
      className="inline-flex items-center justify-center w-6 h-6 rounded-md text-primary hover:bg-primary/10 transition-colors ml-1.5 align-middle"
    >
      <Link2 className="w-3.5 h-3.5" />
    </button>
  );
}

// =============================================================================
// Component
// =============================================================================

interface CreatePropertyFormProps {
  onSubmit: (data: CreatePropertyFormData) => Promise<void>;
  isLoading?: boolean;
  integrationPropertyId: number;
  tier: "elite" | "standard";
  /** Smoobu field data available for per-field linking */
  smoobuData?: Partial<CreatePropertyInput> | null;
}

export function CreatePropertyForm({
  onSubmit,
  isLoading = false,
  integrationPropertyId,
  tier,
  smoobuData,
}: CreatePropertyFormProps) {
  const { control, handleSubmit, formState, setValue, watch, reset } =
    useForm<CreatePropertyFormData>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        brokerId: "broker-001",
        smoobuPropertyId: integrationPropertyId,
        tier,
        status: "draft",
        amenities: [],
        highlights: [],
        views: [],
        images: [],
      },
    });

  const images = watch("images");
  const amenities = watch("amenities") ?? [];
  const highlights = watch("highlights") ?? [];
  const views = watch("views") ?? [];

  const isElite = tier === "elite";

  /** Fill a single field from Smoobu data */
  function linkField<K extends keyof CreatePropertyFormData>(field: K) {
    if (!smoobuData) return;
    const value = smoobuData[field as keyof CreatePropertyInput];
    if (value !== undefined) {
      setValue(field, value as never, { shouldDirty: true });
    }
  }

  /** Show link button only if Smoobu has data for this field */
  function renderLink(field: keyof CreatePropertyInput) {
    if (!smoobuData || smoobuData[field] === undefined) return null;
    return <SmoobuLinkButton onClick={() => linkField(field as keyof CreatePropertyFormData)} />;
  }

  // Synced change handler for amenities/highlights/views
  function handleSyncedChange(fieldName: FeatureFieldName, newValue: string[]) {
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
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-4xl mx-auto space-y-8"
    >
      {/* Basic Information */}
      <FormSection title="Basic Information">
        <TextInput
          name="title"
          control={control}
          label="Property Title"
          required
          placeholder="Stunning Oceanfront Villa"
          maxLength={200}
          labelSuffix={renderLink("title")}
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
          labelSuffix={renderLink("location")}
        />

        <div className="grid grid-cols-2 gap-4">
          <TextInput
            name="city"
            control={control}
            label="City"
            placeholder="Amalfi"
            labelSuffix={renderLink("city")}
          />
          <TextInput
            name="country"
            control={control}
            label="Country"
            placeholder="Italy"
            labelSuffix={renderLink("country")}
          />
        </div>

        <TextInput
          name="street"
          control={control}
          label="Street Address"
          placeholder="Via Cristoforo Colombo 12"
          labelSuffix={renderLink("street")}
        />

        <div className="grid grid-cols-2 gap-4">
          <TextInput
            name="zip"
            control={control}
            label="ZIP Code"
            placeholder="84011"
            labelSuffix={renderLink("zip")}
          />
          <TextInput
            name="latitude"
            control={control}
            label="Latitude"
            placeholder="40.6331"
            labelSuffix={renderLink("latitude")}
          />
        </div>

        <TextInput
          name="longitude"
          control={control}
          label="Longitude"
          placeholder="14.6028"
          labelSuffix={renderLink("longitude")}
        />
      </FormSection>

      {/* Property Details */}
      <FormSection title="Property Details">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <NumberInput
            name="maxOccupancy"
            control={control}
            label="Max Occupancy"
            min={1}
            max={50}
            labelSuffix={renderLink("maxOccupancy")}
          />
          <NumberInput
            name="bedrooms"
            control={control}
            label="Bedrooms"
            min={0}
            max={20}
            labelSuffix={renderLink("bedrooms")}
          />
          <NumberInput
            name="bathrooms"
            control={control}
            label="Bathrooms"
            min={0}
            max={20}
            labelSuffix={renderLink("bathrooms")}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <NumberInput
            name="doubleBeds"
            control={control}
            label="Double Beds"
            min={0}
            labelSuffix={renderLink("doubleBeds")}
          />
          <NumberInput
            name="singleBeds"
            control={control}
            label="Single Beds"
            min={0}
            labelSuffix={renderLink("singleBeds")}
          />
          <NumberInput
            name="queenSizeBeds"
            control={control}
            label="Queen Beds"
            min={0}
            labelSuffix={renderLink("queenSizeBeds")}
          />
          <NumberInput
            name="kingSizeBeds"
            control={control}
            label="King Beds"
            min={0}
            labelSuffix={renderLink("kingSizeBeds")}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <NumberInput
            name="sofaBeds"
            control={control}
            label="Sofa Beds"
            min={0}
            labelSuffix={renderLink("sofaBeds")}
          />
          <NumberInput
            name="couches"
            control={control}
            label="Couches"
            min={0}
            labelSuffix={renderLink("couches")}
          />
          <NumberInput
            name="childBeds"
            control={control}
            label="Child Beds"
            min={0}
            labelSuffix={renderLink("childBeds")}
          />
        </div>

        <NumberInput
          name="sqMeters"
          control={control}
          label="Size (m\u00B2)"
          min={10}
        />
      </FormSection>

      {/* Features & Amenities */}
      <FormSection title="Features & Amenities">
        <TagsInput
          name="amenities"
          control={control}
          label="Property Amenities"
          description="Add amenities — items are unique across all categories"
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
          labelSuffix={renderLink("amenities")}
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
          onClick={() => reset()}
        >
          Reset
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
