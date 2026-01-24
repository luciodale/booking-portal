/**
 * CreatePropertyForm - Create-only form
 * Full form + images submitted together on save
 */

import type { CreatePropertyInput } from "@/modules/property/domain/schema";
import { createPropertySchema } from "@/modules/property/domain/schema";
import { getFacilityOptions } from "@/modules/shared/constants";
import { Select } from "@/modules/ui/Select";
import { cn } from "@/modules/utils/cn";
import { genUniqueId } from "@/modules/utils/id";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, Star, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { type Control, Controller, useForm } from "react-hook-form";
import { z } from "zod";

import {
  type FeatureFieldName,
  displayToKebab,
  kebabToDisplay,
  syncFeatureFields,
} from "@/modules/property/domain/sync-features";

// =============================================================================
// Types
// =============================================================================

/** Image for new upload (file + preview) */
interface NewImage {
  id: string;
  file: File;
  previewUrl: string;
  isPrimary: boolean;
}

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
// Constants
// =============================================================================

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

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
        type: "apartment",
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
  const amenities = watch("amenities") ?? [];
  const highlights = watch("highlights") ?? [];
  const views = watch("views") ?? [];

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

    // Update all fields that changed
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
        />

        <TagsInput
          name="views"
          control={control}
          label="Panoramic Views"
          description="Views available from the property"
          options={getFacilityOptions("view")}
          onChangeOverride={(newValue) => handleSyncedChange("views", newValue)}
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
        />
        {formState.errors.images && (
          <p className="text-sm text-error mt-2">
            {formState.errors.images.message}
          </p>
        )}
      </FormSection>

      {/* Media Links */}
      <FormSection title="Additional Media">
        <TextInput
          name="videoUrl"
          control={control}
          label="Video URL"
          description="Optional video URL for elite properties"
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

// =============================================================================
// Sub-components
// =============================================================================

function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-card border border-border p-6 rounded-xl">
      <h2 className="text-xl font-semibold text-foreground mb-4">{title}</h2>
      {children}
    </section>
  );
}

// Simple controlled inputs
function TextInput({
  name,
  control,
  label,
  required,
  description,
  placeholder,
  maxLength,
}: {
  name: string;
  control: Control<CreatePropertyFormData>;
  label: string;
  required?: boolean;
  description?: string;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <Controller
      name={name as keyof CreatePropertyFormData}
      control={control}
      render={({ field, fieldState }) => (
        <div className="mb-4">
          <label
            htmlFor={name}
            className="block text-sm font-medium text-foreground mb-1"
          >
            {label}
            {required && <span className="text-error ml-1">*</span>}
          </label>
          {description && (
            <p className="text-sm text-muted-foreground mb-2">{description}</p>
          )}
          <input
            {...field}
            id={name}
            type="text"
            placeholder={placeholder}
            maxLength={maxLength}
            value={(field.value as string) || ""}
            className={cn("input", fieldState.error && "border-error")}
          />
          {fieldState.error && (
            <p className="text-sm text-error mt-1">
              {fieldState.error.message}
            </p>
          )}
        </div>
      )}
    />
  );
}

function TextareaInput({
  name,
  control,
  label,
  required,
  description,
  placeholder,
  rows = 4,
}: {
  name: string;
  control: Control<CreatePropertyFormData>;
  label: string;
  required?: boolean;
  description?: string;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <Controller
      name={name as keyof CreatePropertyFormData}
      control={control}
      render={({ field, fieldState }) => (
        <div className="mb-4">
          <label
            htmlFor={name}
            className="block text-sm font-medium text-foreground mb-1"
          >
            {label}
            {required && <span className="text-error ml-1">*</span>}
          </label>
          {description && (
            <p className="text-sm text-muted-foreground mb-2">{description}</p>
          )}
          <textarea
            {...field}
            id={name}
            placeholder={placeholder}
            rows={rows}
            value={(field.value as string) || ""}
            className={cn(
              "input resize-none",
              fieldState.error && "border-error"
            )}
          />
          {fieldState.error && (
            <p className="text-sm text-error mt-1">
              {fieldState.error.message}
            </p>
          )}
        </div>
      )}
    />
  );
}

function NumberInput({
  name,
  control,
  label,
  required,
  description,
  placeholder,
  min,
  max,
}: {
  name: string;
  control: Control<CreatePropertyFormData>;
  label: string;
  required?: boolean;
  description?: string;
  placeholder?: string;
  min?: number;
  max?: number;
}) {
  return (
    <Controller
      name={name as keyof CreatePropertyFormData}
      control={control}
      render={({ field, fieldState }) => (
        <div className="mb-4">
          <label
            htmlFor={name}
            className="block text-sm font-medium text-foreground mb-1"
          >
            {label}
            {required && <span className="text-error ml-1">*</span>}
          </label>
          {description && (
            <p className="text-sm text-muted-foreground mb-2">{description}</p>
          )}
          <input
            {...field}
            id={name}
            type="number"
            placeholder={placeholder}
            min={min}
            max={max}
            value={(field.value as number) ?? ""}
            onChange={(e) => {
              const val =
                e.target.value === "" ? undefined : Number(e.target.value);
              field.onChange(val);
            }}
            className={cn("input", fieldState.error && "border-error")}
          />
          {fieldState.error && (
            <p className="text-sm text-error mt-1">
              {fieldState.error.message}
            </p>
          )}
        </div>
      )}
    />
  );
}

function SelectInput({
  name,
  control,
  label,
  required,
  options,
}: {
  name: string;
  control: Control<CreatePropertyFormData>;
  label: string;
  required?: boolean;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <Controller
      name={name as keyof CreatePropertyFormData}
      control={control}
      render={({ field, fieldState }) => (
        <div className="mb-4">
          <label
            htmlFor={name}
            className="block text-sm font-medium text-foreground mb-1"
          >
            {label}
            {required && <span className="text-error ml-1">*</span>}
          </label>
          <Select
            value={(field.value as string) || ""}
            onChange={field.onChange}
            options={options}
            error={!!fieldState.error}
          />
          {fieldState.error && (
            <p className="text-sm text-error mt-1">
              {fieldState.error.message}
            </p>
          )}
        </div>
      )}
    />
  );
}

function TagsInput({
  name,
  control,
  label,
  required,
  description,
  options,
  onChangeOverride,
}: {
  name: string;
  control: Control<CreatePropertyFormData>;
  label: string;
  required?: boolean;
  description?: string;
  options: Array<{ value: string }>;
  onChangeOverride?: (newValue: string[]) => void;
}) {
  const [customInput, setCustomInput] = useState("");
  const optionValues = new Set(options.map((o) => o.value));

  return (
    <Controller
      name={name as keyof CreatePropertyFormData}
      control={control}
      render={({ field, fieldState }) => {
        const selectedValues: string[] = (field.value as string[]) || [];
        const customTags = selectedValues.filter((v) => !optionValues.has(v));

        const handleChange = (newValues: string[]) => {
          if (onChangeOverride) {
            onChangeOverride(newValues);
          } else {
            field.onChange(newValues);
          }
        };

        const toggleValue = (value: string) => {
          const newValues = selectedValues.includes(value)
            ? selectedValues.filter((v) => v !== value)
            : [...selectedValues, value];
          handleChange(newValues);
        };

        const addCustomTag = () => {
          const kebabTag = displayToKebab(customInput);
          if (!kebabTag || selectedValues.includes(kebabTag)) return;
          handleChange([...selectedValues, kebabTag]);
          setCustomInput("");
        };

        return (
          <div className="mb-4">
            <span className="block text-sm font-medium text-foreground mb-1">
              {label}
              {required && <span className="text-error ml-1">*</span>}
            </span>
            {description && (
              <p className="text-sm text-muted-foreground mb-2">
                {description}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              {options.map((option) => {
                const isSelected = selectedValues.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleValue(option.value)}
                    className={cn(
                      "px-3 py-1.5 text-sm rounded-full border transition-colors cursor-pointer",
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-foreground border-border hover:border-primary/50"
                    )}
                  >
                    {kebabToDisplay(option.value)}
                  </button>
                );
              })}

              {customTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleValue(tag)}
                  className="px-3 py-1.5 text-sm rounded-full border bg-primary text-primary-foreground border-primary flex items-center gap-1"
                >
                  {kebabToDisplay(tag)}
                  <span className="text-xs">×</span>
                </button>
              ))}
            </div>

            <div className="flex gap-2 mt-3">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomTag();
                  }
                }}
                placeholder="Add custom amenity..."
                className="input flex-1 text-sm"
              />
              <button
                type="button"
                onClick={addCustomTag}
                disabled={!customInput.trim()}
                className="btn-secondary text-sm disabled:opacity-50"
              >
                Add
              </button>
            </div>

            {fieldState.error && (
              <p className="text-sm text-error mt-1">
                {fieldState.error.message}
              </p>
            )}
          </div>
        );
      }}
    />
  );
}

function ImagesInput({
  images,
  onChange,
}: {
  images: NewImage[];
  onChange: (images: NewImage[]) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const primaryImage = images.find((img) => img.isPrimary);
  const galleryImages = images.filter((img) => !img.isPrimary);

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return "Invalid file type. Accepted: JPG, PNG, WebP";
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File too large. Maximum: ${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB`;
    }
    return null;
  };

  const handleFileSelect = (files: FileList | null, isPrimary: boolean) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    const previewUrl = URL.createObjectURL(file);
    const newImage: NewImage = {
      id: genUniqueId("img"),
      file,
      previewUrl,
      isPrimary,
    };

    // If setting as primary, remove isPrimary from others
    const updated = isPrimary
      ? images.map((img) => ({ ...img, isPrimary: false }))
      : images;

    onChange([...updated, newImage]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDelete = (imageId: string) => {
    const imageToDelete = images.find((img) => img.id === imageId);
    if (imageToDelete) {
      URL.revokeObjectURL(imageToDelete.previewUrl);
    }

    const filtered = images.filter((img) => img.id !== imageId);

    // If we deleted the primary and there are other images, make first one primary
    if (imageToDelete?.isPrimary && filtered.length > 0) {
      filtered[0] = { ...filtered[0], isPrimary: true };
    }

    onChange(filtered);
  };

  const handleSetPrimary = (imageId: string) => {
    const updated = images.map((img) => ({
      ...img,
      isPrimary: img.id === imageId,
    }));
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Upload high-quality images. The main image will be used as the cover
        photo.
      </p>

      {error && (
        <div className="p-3 rounded-lg bg-error/10 border border-error/20">
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      {/* Main Image */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">
            Main Image
          </span>
        </div>

        {primaryImage ? (
          <div className="relative group rounded-xl overflow-hidden border-2 border-primary/30 bg-card">
            <img
              src={primaryImage.previewUrl}
              alt="Main property"
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <label className="cursor-pointer p-3 rounded-full bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-sm">
                <Upload className="w-5 h-5 text-white" />
                <input
                  type="file"
                  accept={ACCEPTED_TYPES.join(",")}
                  className="sr-only"
                  onChange={(e) => handleFileSelect(e.target.files, true)}
                />
              </label>
              <button
                type="button"
                onClick={() => handleDelete(primaryImage.id)}
                className="p-3 rounded-full bg-white/20 hover:bg-error/60 transition-colors backdrop-blur-sm"
              >
                <Trash2 className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="absolute top-3 left-3">
              <span className="px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center gap-1.5">
                <Star className="w-3 h-3 fill-current" />
                Primary
              </span>
            </div>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center h-64 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-card transition-colors cursor-pointer">
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_TYPES.join(",")}
              className="sr-only"
              onChange={(e) => handleFileSelect(e.target.files, true)}
            />
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <ImagePlus className="w-8 h-8 text-primary" />
            </div>
            <span className="text-foreground font-medium mb-1">
              Upload Main Image
            </span>
            <span className="text-sm text-muted-foreground">
              JPG, PNG or WebP up to {Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB
            </span>
          </label>
        )}
      </div>

      {/* Gallery Images */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <ImagePlus className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">
            Gallery Images
          </span>
          <span className="text-xs text-muted-foreground">
            ({galleryImages.length} image{galleryImages.length !== 1 ? "s" : ""}
            )
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {galleryImages.map((image) => (
            <div
              key={image.id}
              className="relative group rounded-xl overflow-hidden border border-border bg-card aspect-4/3"
            >
              <img
                src={image.previewUrl}
                alt="Gallery"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSetPrimary(image.id)}
                  className="p-2 rounded-full bg-white/20 hover:bg-primary/60 transition-colors backdrop-blur-sm"
                  title="Set as primary"
                >
                  <Star className="w-4 h-4 text-white" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(image.id)}
                  className="p-2 rounded-full bg-white/20 hover:bg-error/60 transition-colors backdrop-blur-sm"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          ))}

          {/* Add New */}
          <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-card transition-colors cursor-pointer aspect-4/3">
            <input
              type="file"
              accept={ACCEPTED_TYPES.join(",")}
              className="sr-only"
              onChange={(e) => handleFileSelect(e.target.files, false)}
            />
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mb-2">
              <ImagePlus className="w-5 h-5 text-muted-foreground" />
            </div>
            <span className="text-xs text-muted-foreground">Add Image</span>
          </label>
        </div>
      </div>
    </div>
  );
}
