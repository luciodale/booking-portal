/**
 * Elite Property Form
 * Main form for creating and editing elite properties
 */

import {
  type CreatePropertyInput,
  createPropertySchema,
} from "@/modules/property/domain/schema";
import { getAmenityOptions } from "@/modules/shared/constants";
import {
  NumberField,
  type PropertyImage,
  PropertyImagesField,
  SelectField,
  StaticAssetPathField,
  TagsField,
  TextField,
  TextareaField,
} from "@/modules/ui/form";
import { nullToUndefined } from "@/modules/utils/form-utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

/** Form data extends CreatePropertyInput with images */
interface PropertyFormData extends CreatePropertyInput {
  images?: PropertyImage[];
}

/** Form schema - extends property schema to include images */
const propertyFormSchema = createPropertySchema.and(
  z.object({
    images: z
      .array(
        z.object({
          id: z.string(),
          url: z.string(),
          file: z.custom<File>().optional(), // File object for new uploads
          isPrimary: z.boolean(),
          isExisting: z.boolean().optional(),
        })
      )
      .optional(),
  })
);

interface ElitePropertyFormProps {
  defaultValues?: Partial<PropertyFormData>;
  existingImages?: PropertyImage[];
  onSubmit: (data: PropertyFormData) => Promise<void>;
  isLoading?: boolean;
  onDeleteImage?: (imageId: string) => Promise<void>;
  onSetPrimaryImage?: (imageId: string) => Promise<void>;
}

export function ElitePropertyForm({
  defaultValues,
  existingImages = [],
  onSubmit,
  isLoading = false,
  onDeleteImage,
  onSetPrimaryImage,
}: ElitePropertyFormProps) {
  const { control, handleSubmit, formState } = useForm<PropertyFormData>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      brokerId: "broker-001", // TODO: Get from auth context
      type: "apartment",
      tier: "elite",
      status: "draft",
      currency: "eur",
      amenities: [],
      images: existingImages,
      ...nullToUndefined(defaultValues),
    },
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-4xl mx-auto space-y-8"
    >
      {/* Basic Information */}
      <section className="bg-card border border-border p-6 rounded-xl">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Basic Information
        </h2>

        <TextField
          name="title"
          control={control}
          label="Property Title"
          required
          placeholder="Stunning Oceanfront Villa"
          maxLength={200}
        />

        <TextareaField
          name="description"
          control={control}
          label="Full Description"
          required
          placeholder="Detailed description of the property..."
          rows={6}
          maxLength={5000}
        />

        <TextareaField
          name="shortDescription"
          control={control}
          label="Short Description"
          required
          description="Brief summary for property cards"
          placeholder="Luxury villa with stunning sea views..."
          rows={3}
          maxLength={500}
        />
      </section>

      {/* Location */}
      <section className="bg-card border border-border p-6 rounded-xl">
        <h2 className="text-xl font-semibold text-foreground mb-4">Location</h2>

        <TextField
          name="location"
          control={control}
          label="Location"
          required
          placeholder="Amalfi Coast, Italy"
        />

        <div className="grid grid-cols-2 gap-4">
          <TextField
            name="city"
            control={control}
            label="City"
            placeholder="Amalfi"
          />

          <TextField
            name="country"
            control={control}
            label="Country"
            placeholder="Italy"
          />
        </div>

        <TextField
          name="address"
          control={control}
          label="Full Address"
          placeholder="Via Cristoforo Colombo 12, 84011 Amalfi SA"
        />
      </section>

      {/* Property Details */}
      <section className="bg-card border border-border p-6 rounded-xl">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Property Details
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <NumberField
            name="maxGuests"
            control={control}
            label="Max Guests"
            required
            min={1}
            max={50}
          />

          <NumberField
            name="bedrooms"
            control={control}
            label="Bedrooms"
            min={0}
            max={20}
          />

          <NumberField
            name="bathrooms"
            control={control}
            label="Bathrooms"
            min={0}
            max={20}
          />

          <NumberField
            name="sqMeters"
            control={control}
            label="Size (m²)"
            min={10}
          />
        </div>
      </section>

      {/* Amenities */}
      <section className="bg-card border border-border p-6 rounded-xl">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Amenities
        </h2>

        <TagsField
          name="amenities"
          control={control}
          label="Property Amenities"
          required
          description="Select all amenities available"
          options={getAmenityOptions()}
        />
      </section>

      {/* Pricing */}
      <section className="bg-card border border-border p-6 rounded-xl">
        <h2 className="text-xl font-semibold text-foreground mb-4">Pricing</h2>

        <div className="grid grid-cols-2 gap-4">
          <NumberField
            name="basePrice"
            control={control}
            label="Base Price (cents)"
            required
            description="Price in cents per night (e.g., 250000 = €2,500/night)"
            min={100}
          />

          <NumberField
            name="cleaningFee"
            control={control}
            label="Cleaning Fee (cents)"
            description="One-time cleaning fee in cents"
            min={0}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <NumberField
            name="minNights"
            control={control}
            label="Minimum Nights"
            min={1}
          />

          <NumberField
            name="maxNights"
            control={control}
            label="Maximum Nights"
            min={1}
          />
        </div>

        <SelectField
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
      </section>

      {/* Images */}
      <section className="bg-card border border-border p-6 rounded-xl">
        <PropertyImagesField
          name="images"
          control={control}
          label="Property Images"
          description="Upload high-quality images. The main image will be used as the cover photo."
          required
          existingImages={existingImages}
          onDelete={onDeleteImage}
          onSetPrimary={onSetPrimaryImage}
        />
      </section>

      {/* Media Links */}
      <section className="bg-card border border-border p-6 rounded-xl">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Additional Media
        </h2>

        <TextField
          name="videoUrl"
          control={control}
          label="Video URL"
          type="url"
          description="Optional video URL for elite properties"
          placeholder="https://vimeo.com/..."
        />

        <StaticAssetPathField
          name="pdfAssetPath"
          control={control}
          label="PDF Flyer Path"
          description="Path to manually uploaded PDF flyer"
          placeholder="/flyers/mallorca-villa.pdf"
        />
      </section>

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
          {isLoading || formState.isSubmitting ? "Saving..." : "Save Property"}
        </button>
      </div>

      {formState.errors &&
        Object.keys(formState.errors).length > 0 &&
        console.log("Form errors:", formState.errors) === undefined && (
          <div className="bg-error/10 border border-error/20 rounded-lg p-4">
            <p className="text-sm text-error font-medium">
              Please fix the errors above before submitting.
            </p>
          </div>
        )}
    </form>
  );
}
