/**
 * ExperienceForm - Create/Edit form for experiences
 */

import {
  FormSection,
  ImagesInput,
  type NewImage,
  NumberInput,
  SelectInput,
  TextInput,
  TextareaInput,
} from "@/modules/shared/forms";
import type { CreateExperienceInput } from "@/schemas";
import { createExperienceSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

// =============================================================================
// Types
// =============================================================================

/** Form data - experience fields + new images */
export interface CreateExperienceFormData extends CreateExperienceInput {
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

const formSchema = createExperienceSchema.extend({
  images: z.array(imageSchema).min(1, "At least one image required"),
});

// =============================================================================
// Component
// =============================================================================

interface ExperienceFormProps {
  onSubmit: (data: CreateExperienceFormData) => Promise<void>;
  isLoading?: boolean;
}

export function ExperienceForm({
  onSubmit,
  isLoading = false,
}: ExperienceFormProps) {
  const { control, handleSubmit, formState, setValue, watch } =
    useForm<CreateExperienceFormData>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        brokerId: "broker-001", // TODO: Get from auth context
        category: "",
        status: "draft",
        currency: "eur",
        images: [],
      },
    });

  const images = watch("images");

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
          label="Experience Title"
          required
          placeholder="Private Yacht Day"
          maxLength={200}
        />

        <TextareaInput
          name="description"
          control={control}
          label="Full Description"
          required
          placeholder="Detailed description of the experience..."
          rows={6}
        />

        <TextareaInput
          name="shortDescription"
          control={control}
          label="Short Description"
          required
          description="Brief summary for experience cards"
          placeholder="Luxury yacht charter along the coastline..."
          rows={3}
        />
      </FormSection>

      {/* Category & Details */}
      <FormSection title="Category & Details">
        <TextInput
          name="category"
          control={control}
          label="Category"
          required
          placeholder="e.g., sailing, food & wine, adventure"
        />

        <div className="grid grid-cols-2 gap-4">
          <TextInput
            name="duration"
            control={control}
            label="Duration"
            required
            description="e.g., '8 hours', '2 days'"
            placeholder="8 hours"
          />

          <NumberInput
            name="maxParticipants"
            control={control}
            label="Max Participants"
            description="Maximum number of people"
            min={1}
            max={100}
          />
        </div>
      </FormSection>

      {/* Location */}
      <FormSection title="Location">
        <TextInput
          name="location"
          control={control}
          label="Location"
          required
          placeholder="Sardinia, Italy"
        />

        <div className="grid grid-cols-2 gap-4">
          <TextInput
            name="city"
            control={control}
            label="City"
            placeholder="Sardinia"
          />
          <TextInput
            name="country"
            control={control}
            label="Country"
            placeholder="Italy"
          />
        </div>
      </FormSection>

      {/* Pricing */}
      <FormSection title="Pricing">
        <div className="grid grid-cols-2 gap-4">
          <NumberInput
            name="basePrice"
            control={control}
            label="Price per Person (cents)"
            required
            description="Price in cents (e.g., 25000 = €250/person)"
            min={100}
          />

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
        </div>
      </FormSection>

      {/* Images */}
      <FormSection title="Experience Images">
        <ImagesInput
          images={images}
          onChange={(newImages) => setValue("images", newImages)}
          error={formState.errors.images?.message}
        />
      </FormSection>

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
            : "Create Experience"}
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
