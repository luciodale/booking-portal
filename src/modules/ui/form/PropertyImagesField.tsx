/**
 * PropertyImagesField Component
 * Elegant two-section image upload: Main Image + Gallery
 * Uses form value as source of truth - no separate local state
 */

import { cn } from "@/modules/utils/cn";
import { genUniqueId } from "@/modules/utils/id";
import { ImagePlus, Star, Trash2, Upload } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import {
  type Control,
  Controller,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { FormError } from "./FormError";

/** Image data structure - used for both new uploads and existing images */
export interface PropertyImage {
  id: string;
  url: string;
  file?: File; // Only present for new uploads
  isPrimary: boolean;
  isExisting?: boolean; // True for images already saved in DB
}

interface PropertyImagesFieldProps<TFieldValues extends FieldValues> {
  name: FieldPath<TFieldValues>;
  control: Control<TFieldValues>;
  label?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  existingImages?: PropertyImage[];
  onDelete?: (imageId: string) => Promise<void>;
  onSetPrimary?: (imageId: string) => Promise<void>;
  maxSize?: number; // bytes
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export function PropertyImagesField<TFieldValues extends FieldValues>({
  name,
  control,
  label = "Property Images",
  description,
  required = false,
  disabled = false,
  existingImages = [],
  onDelete,
  onSetPrimary,
  maxSize = MAX_FILE_SIZE,
}: PropertyImagesFieldProps<TFieldValues>) {
  const [uploading, setUploading] = useState<"main" | "gallery" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mainInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback(
    (file: File): string | null => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        return `Invalid file type: ${file.name}. Accepted: JPG, PNG, WebP`;
      }
      if (file.size > maxSize) {
        return `File too large: ${file.name}. Maximum: ${Math.round(maxSize / 1024 / 1024)}MB`;
      }
      return null;
    },
    [maxSize]
  );

  const handleFileSelect = useCallback(
    (
      files: FileList | null,
      isPrimary: boolean,
      currentImages: PropertyImage[],
      onChange: (value: PropertyImage[]) => void
    ) => {
      if (!files || files.length === 0) return;

      setError(null);
      const file = files[0];

      // Validate
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setUploading(isPrimary ? "main" : "gallery");

      // Create blob URL for preview
      const previewUrl = URL.createObjectURL(file);
      const newImage: PropertyImage = {
        id: genUniqueId("img"),
        url: previewUrl,
        file,
        isPrimary,
        isExisting: false,
      };

      // If setting as primary, remove isPrimary from others
      const updated = isPrimary
        ? currentImages.map((img) => ({ ...img, isPrimary: false }))
        : currentImages;

      const newImages = [...updated, newImage];
      onChange(newImages);

      setUploading(null);

      // Reset file input
      if (isPrimary && mainInputRef.current) {
        mainInputRef.current.value = "";
      } else if (galleryInputRef.current) {
        galleryInputRef.current.value = "";
      }
    },
    [validateFile]
  );

  const handleSetPrimary = useCallback(
    async (
      imageId: string,
      currentImages: PropertyImage[],
      onChange: (value: PropertyImage[]) => void
    ) => {
      const image = currentImages.find((img) => img.id === imageId);

      // For existing images, call server
      if (image?.isExisting && onSetPrimary) {
        await onSetPrimary(imageId);
      }

      const updated = currentImages.map((img) => ({
        ...img,
        isPrimary: img.id === imageId,
      }));
      onChange(updated);
    },
    [onSetPrimary]
  );

  const handleDelete = useCallback(
    async (
      imageId: string,
      currentImages: PropertyImage[],
      onChange: (value: PropertyImage[]) => void
    ) => {
      const imageToDelete = currentImages.find((img) => img.id === imageId);
      if (!imageToDelete) return;

      // If it's an existing image, call server delete
      if (imageToDelete.isExisting && onDelete) {
        await onDelete(imageId);
      }

      // Revoke object URL if it's a local preview
      if (imageToDelete.file && imageToDelete.url.startsWith("blob:")) {
        URL.revokeObjectURL(imageToDelete.url);
      }

      const filtered = currentImages.filter((img) => img.id !== imageId);

      // If we deleted the primary and there are other images, make first one primary
      if (imageToDelete.isPrimary && filtered.length > 0) {
        filtered[0] = { ...filtered[0], isPrimary: true };
      }

      onChange(filtered);
    },
    [onDelete]
  );

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={existingImages as TFieldValues[typeof name]}
      render={({ field, fieldState }) => {
        // Use field.value as source of truth, fallback to existingImages
        const images: PropertyImage[] =
          (field.value as PropertyImage[] | undefined) ?? existingImages;
        const primaryImage = images.find((img) => img.isPrimary);
        const galleryImages = images.filter((img) => !img.isPrimary);

        return (
          <div className="space-y-6">
            {label && (
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {label}
                  {required && <span className="text-primary ml-1">*</span>}
                </h3>
                {description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {description}
                  </p>
                )}
              </div>
            )}

            {/* Main/Primary Image Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  Main Image
                </span>
                <span className="text-xs text-muted-foreground">
                  (Cover photo)
                </span>
              </div>

              {primaryImage ? (
                <div className="relative group rounded-xl overflow-hidden border-2 border-primary/30 bg-card">
                  <img
                    src={primaryImage.url}
                    alt="Main property"
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <label className="cursor-pointer p-3 rounded-full bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-sm">
                      <Upload className="w-5 h-5 text-white" />
                      <input
                        ref={mainInputRef}
                        type="file"
                        accept={ACCEPTED_TYPES.join(",")}
                        className="sr-only"
                        disabled={disabled || uploading !== null}
                        onChange={(e) =>
                          handleFileSelect(
                            e.target.files,
                            true,
                            images,
                            field.onChange
                          )
                        }
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(primaryImage.id, images, field.onChange)
                      }
                      disabled={disabled}
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
                  {uploading === "main" && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <div className="text-white text-sm">Processing...</div>
                    </div>
                  )}
                </div>
              ) : (
                <label
                  className={cn(
                    "flex flex-col items-center justify-center h-64 rounded-xl border-2 border-dashed transition-colors cursor-pointer",
                    disabled || uploading !== null
                      ? "border-border bg-secondary/50 cursor-not-allowed"
                      : "border-border hover:border-primary/50 hover:bg-card"
                  )}
                >
                  <input
                    ref={mainInputRef}
                    type="file"
                    accept={ACCEPTED_TYPES.join(",")}
                    className="sr-only"
                    disabled={disabled || uploading !== null}
                    onChange={(e) =>
                      handleFileSelect(
                        e.target.files,
                        true,
                        images,
                        field.onChange
                      )
                    }
                  />
                  {uploading === "main" ? (
                    <div className="text-muted-foreground">Processing...</div>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <ImagePlus className="w-8 h-8 text-primary" />
                      </div>
                      <span className="text-foreground font-medium mb-1">
                        Upload Main Image
                      </span>
                      <span className="text-sm text-muted-foreground">
                        JPG, PNG or WebP up to{" "}
                        {Math.round(maxSize / 1024 / 1024)}MB
                      </span>
                    </>
                  )}
                </label>
              )}
            </div>

            {/* Gallery Images Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ImagePlus className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  Gallery Images
                </span>
                <span className="text-xs text-muted-foreground">
                  ({galleryImages.length} image
                  {galleryImages.length !== 1 ? "s" : ""})
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {galleryImages.map((image) => (
                  <div
                    key={image.id}
                    className="relative group rounded-xl overflow-hidden border border-border bg-card aspect-[4/3]"
                  >
                    <img
                      src={image.url}
                      alt="Gallery"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleSetPrimary(image.id, images, field.onChange)
                        }
                        disabled={disabled}
                        className="p-2 rounded-full bg-white/20 hover:bg-primary/60 transition-colors backdrop-blur-sm"
                        title="Set as primary"
                      >
                        <Star className="w-4 h-4 text-white" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(image.id, images, field.onChange)
                        }
                        disabled={disabled}
                        className="p-2 rounded-full bg-white/20 hover:bg-error/60 transition-colors backdrop-blur-sm"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add New Image Button */}
                <label
                  className={cn(
                    "flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors cursor-pointer aspect-[4/3]",
                    disabled || uploading !== null
                      ? "border-border bg-secondary/50 cursor-not-allowed"
                      : "border-border hover:border-primary/50 hover:bg-card"
                  )}
                >
                  <input
                    ref={galleryInputRef}
                    type="file"
                    accept={ACCEPTED_TYPES.join(",")}
                    className="sr-only"
                    disabled={disabled || uploading !== null}
                    onChange={(e) =>
                      handleFileSelect(
                        e.target.files,
                        false,
                        images,
                        field.onChange
                      )
                    }
                  />
                  {uploading === "gallery" ? (
                    <div className="text-sm text-muted-foreground">
                      Processing...
                    </div>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mb-2">
                        <ImagePlus className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Add Image
                      </span>
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-3 rounded-lg bg-error/10 border border-error/20">
                <p className="text-sm text-error">{error}</p>
              </div>
            )}

            <FormError message={fieldState.error?.message} />
          </div>
        );
      }}
    />
  );
}
