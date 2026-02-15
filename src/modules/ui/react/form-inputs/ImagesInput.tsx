/**
 * ImagesInput - Image upload with primary selection and preview
 */

import { processImage } from "@/modules/images/processImage";
import { genUniqueId } from "@/modules/utils/id";
import { ImagePlus, Loader2, Star, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";

// =============================================================================
// Types
// =============================================================================

/** Image for new upload (file + preview) */
export interface NewImage {
  id: string;
  file: File;
  previewUrl: string;
  isPrimary: boolean;
}

// =============================================================================
// Constants
// =============================================================================

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

// =============================================================================
// Component
// =============================================================================

interface ImagesInputProps {
  images: NewImage[];
  onChange: (images: NewImage[]) => void;
  error?: string;
}

export function ImagesInput({ images, onChange, error }: ImagesInputProps) {
  const [validationError, setValidationError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
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

  const handleFileSelect = async (
    files: FileList | null,
    isPrimary: boolean
  ) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    const fileValidationError = validateFile(file);
    if (fileValidationError) {
      setValidationError(fileValidationError);
      return;
    }

    setValidationError(null);
    setProcessing(true);

    try {
      const processed = await processImage(file);
      const previewUrl = URL.createObjectURL(processed);
      const newImage: NewImage = {
        id: genUniqueId("img"),
        file: processed,
        previewUrl,
        isPrimary,
      };

      const updated = isPrimary
        ? images.map((img) => ({ ...img, isPrimary: false }))
        : images;

      onChange([...updated, newImage]);
    } catch {
      setValidationError("Failed to process image. Please try another file.");
    } finally {
      setProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
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

      {(validationError || error) && (
        <div className="p-3 rounded-lg bg-error/10 border border-error/20">
          <p className="text-sm text-error">{validationError || error}</p>
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
              disabled={processing}
              onChange={(e) => handleFileSelect(e.target.files, true)}
            />
            {processing ? (
              <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
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
                  {Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB
                </span>
              </>
            )}
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
              disabled={processing}
              onChange={(e) => handleFileSelect(e.target.files, false)}
            />
            {processing ? (
              <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mb-2">
                  <ImagePlus className="w-5 h-5 text-muted-foreground" />
                </div>
                <span className="text-xs text-muted-foreground">Add Image</span>
              </>
            )}
          </label>
        </div>
      </div>
    </div>
  );
}
