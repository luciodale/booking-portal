/**
 * ImageUploadField Component
 * Multi-image upload with preview and ordering
 */

import { cn } from "@/modules/utils/cn";
import { genUniqueId } from "@/modules/utils/id";
import { useState } from "react";
import { Controller, type FieldValues } from "react-hook-form";
import { FormError } from "./FormError";
import type { FileUploadFieldProps } from "./types";

interface UploadedImage {
  id: string;
  url: string;
  file?: File;
  isPrimary: boolean;
}

export function ImageUploadField<TFieldValues extends FieldValues>({
  name,
  control,
  label,
  description,
  required = false,
  disabled = false,
  multiple = true,
  accept = "image/png,image/jpeg,image/jpg",
  maxSize = 10 * 1024 * 1024, // 10MB
  onUpload,
  className = "",
}: FileUploadFieldProps<TFieldValues>) {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    onChange: (value: UploadedImage[]) => void
  ) => {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) return;

    // Validate file sizes
    const invalidFiles = files.filter((file) => file.size > maxSize);
    if (invalidFiles.length > 0) {
      alert(`Some files exceed the ${maxSize / 1024 / 1024}MB limit`);
      return;
    }

    // Create preview URLs
    const newImages: UploadedImage[] = files.map((file, index) => ({
      id: genUniqueId("temp"),
      url: URL.createObjectURL(file),
      file,
      isPrimary: images.length === 0 && index === 0, // First image is primary by default
    }));

    const updatedImages = [...images, ...newImages];
    setImages(updatedImages);

    // Upload if handler provided
    if (onUpload) {
      try {
        setUploading(true);
        await onUpload(files);
        onChange(updatedImages);
      } catch (error) {
        console.error("Upload failed:", error);
        alert("Failed to upload images");
      } finally {
        setUploading(false);
      }
    } else {
      onChange(updatedImages);
    }
  };

  const setPrimary = (
    id: string,
    onChange: (value: UploadedImage[]) => void
  ) => {
    const updatedImages = images.map((img) => ({
      ...img,
      isPrimary: img.id === id,
    }));
    setImages(updatedImages);
    onChange(updatedImages);
  };

  const removeImage = (
    id: string,
    onChange: (value: UploadedImage[]) => void
  ) => {
    const updatedImages = images.filter((img) => img.id !== id);
    // If removed primary, make first image primary
    if (
      updatedImages.length > 0 &&
      !updatedImages.some((img) => img.isPrimary)
    ) {
      updatedImages[0].isPrimary = true;
    }
    setImages(updatedImages);
    onChange(updatedImages);
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <div className={cn("mb-4", className)}>
          {label && (
            <label
              htmlFor={name}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}

          {description && (
            <p className="text-sm text-gray-500 mb-2">{description}</p>
          )}

          <input
            id={name}
            type="file"
            accept={accept}
            multiple={multiple}
            disabled={disabled || uploading}
            onChange={(e) => handleFileChange(e, field.onChange)}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />

          {uploading && (
            <p className="mt-2 text-sm text-gray-600">Uploading...</p>
          )}

          {images.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((image) => (
                <div key={image.id} className="relative group">
                  <img
                    src={image.url}
                    alt="Preview"
                    className={cn(
                      "w-full h-32 object-cover rounded-lg",
                      image.isPrimary && "ring-2 ring-blue-500"
                    )}
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    {!image.isPrimary && (
                      <button
                        type="button"
                        onClick={() => setPrimary(image.id, field.onChange)}
                        className="px-2 py-1 text-xs bg-white rounded shadow hover:bg-gray-100"
                      >
                        Set Primary
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(image.id, field.onChange)}
                      className="px-2 py-1 text-xs bg-red-500 text-white rounded shadow hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                  {image.isPrimary && (
                    <span className="absolute bottom-2 left-2 px-2 py-1 text-xs bg-blue-500 text-white rounded">
                      Primary
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          <FormError message={fieldState.error?.message} />
        </div>
      )}
    />
  );
}
