/**
 * CreateExperienceForm - Form for creating a new experience
 */

import { experienceCategoryLabels } from "@/features/broker/experience/constants/categoryLabels";
import { AdditionalCostsEditor } from "@/modules/ui/react/AdditionalCostsEditor";
import { FormSection } from "@/modules/ui/react/form-inputs/FormSection";
import { NumberInput } from "@/modules/ui/react/form-inputs/NumberInput";
import { SelectInput } from "@/modules/ui/react/form-inputs/SelectInput";
import { TextInput } from "@/modules/ui/react/form-inputs/TextInput";
import { TextareaInput } from "@/modules/ui/react/form-inputs/TextareaInput";
import type { CreateExperienceInput } from "@/schemas/experience";
import { createExperienceSchema } from "@/schemas/experience";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

interface CreateExperienceFormProps {
  onSubmit: (data: CreateExperienceInput) => Promise<void>;
  isLoading?: boolean;
}

export function CreateExperienceForm({
  onSubmit,
  isLoading = false,
}: CreateExperienceFormProps) {
  const { control, handleSubmit, formState, reset, watch, setValue } =
    useForm<CreateExperienceInput>({
      resolver: zodResolver(createExperienceSchema),
      defaultValues: {
        status: "draft",
        currency: "eur",
        featured: false,
        instantBook: false,
        additionalCosts: [],
      },
    });

  const additionalCosts = watch("additionalCosts") ?? [];
  const instantBook = watch("instantBook") ?? false;

  const categoryOptions = Object.entries(experienceCategoryLabels).map(
    ([value, label]) => ({
      value,
      label,
    })
  );

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-4xl mx-auto space-y-8"
    >
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
          placeholder="Describe the experience in detail..."
          rows={6}
        />

        <TextareaInput
          name="shortDescription"
          control={control}
          label="Short Description"
          required
          description="Brief summary for experience cards"
          placeholder="Luxury yacht charter along the coast."
          rows={3}
        />
      </FormSection>

      <FormSection title="Details">
        <SelectInput
          name="category"
          control={control}
          label="Category"
          required
          options={categoryOptions}
        />

        <TextInput
          name="duration"
          control={control}
          label="Duration"
          required
          placeholder="8 hours"
        />

        <NumberInput
          name="maxParticipants"
          control={control}
          label="Max Participants"
          min={1}
          max={100}
        />
      </FormSection>

      <FormSection title="Location">
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

      <FormSection title="Pricing">
        <NumberInput
          name="basePrice"
          control={control}
          label="Base Price (cents)"
          required
          description="Price per person in cents (e.g., 25000 = 250.00 EUR)"
          min={100}
        />

        <SelectInput
          name="currency"
          control={control}
          label="Currency"
          options={[
            { value: "eur", label: "EUR" },
            { value: "usd", label: "USD" },
            { value: "gbp", label: "GBP" },
          ]}
        />
      </FormSection>

      <FormSection title="Additional Costs">
        <p className="text-sm text-muted-foreground">
          Optional fees charged on top of the base price (amounts in cents).
        </p>
        <AdditionalCostsEditor
          costs={additionalCosts}
          perOptions={[
            { value: "booking", label: "Per Booking" },
            { value: "participant", label: "Per Participant" },
          ]}
          onChange={(costs) => setValue("additionalCosts", costs, { shouldDirty: true })}
          disabled={isLoading}
        />
      </FormSection>

      <FormSection title="Booking Options">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={instantBook}
            onChange={(e) => setValue("instantBook", e.target.checked, { shouldDirty: true })}
            disabled={isLoading}
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
          />
          <div>
            <span className="text-sm font-medium text-foreground">
              Instant Book
            </span>
            <p className="text-sm text-muted-foreground">
              Allow guests to book without requiring host approval.
            </p>
          </div>
        </label>
      </FormSection>

      <div className="flex justify-end gap-4">
        <button type="button" className="btn-secondary" onClick={() => reset()}>
          Reset
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
          <p className="text-sm text-error font-medium mb-2">
            Please fix the errors above:
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
