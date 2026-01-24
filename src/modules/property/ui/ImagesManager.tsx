/**
 * ImagesManager - Standalone image CRUD component
 * Direct API calls for upload/delete/setPrimary - no form integration
 */

import type { Image } from "@/db/schema";
import { generateImageUrl } from "@/modules/storage/r2-helpers";
import { cn } from "@/modules/utils/cn";
import { ImagePlus, Loader2, Star, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

interface ImagesManagerProps {
  propertyId: string;
  images: Image[];
  onRefresh: () => void;
}

export function ImagesManager({
  propertyId,
  images,
  onRefresh,
}: ImagesManagerProps) {
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingPrimaryId, setSettingPrimaryId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const primaryImage = images.find((img) => img.isPrimary);
  const galleryImages = images.filter((img) => !img.isPrimary);

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return "Invalid file type. Accepted: JPG, PNG, WebP";
    }
    if (file.size > MAX_FILE_SIZE) {
      const maxMB = Math.round(MAX_FILE_SIZE / 1024 / 1024);
      return `File too large. Maximum: ${maxMB}MB`;
    }
    return null;
  };

  const handleUpload = async (files: FileList | null, isPrimary: boolean) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("assetId", propertyId);
      formData.append("images", file);
      if (isPrimary) {
        formData.append("isPrimary", "0");
      }

      const response = await fetch("/api/backoffice/upload-images", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(data.error || "Upload failed");
      }

      // If setting as primary, also call setPrimary endpoint
      if (isPrimary) {
        const uploadData = (await response.json()) as {
          data?: { images?: Array<{ id: string }> };
        };
        const uploadedId = uploadData.data?.images?.[0]?.id;
        if (uploadedId) {
          await handleSetPrimary(uploadedId);
          return; // onRefresh called in handleSetPrimary
        }
      }

      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async (imageId: string) => {
    setDeletingId(imageId);
    setError(null);

    try {
      const response = await fetch(`/api/backoffice/images/${imageId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(data.error || "Delete failed");
      }

      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    setSettingPrimaryId(imageId);
    setError(null);

    try {
      const response = await fetch(
        `/api/backoffice/images/${imageId}/primary`,
        {
          method: "PUT",
        }
      );

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(data.error || "Failed to set primary");
      }

      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set primary");
    } finally {
      setSettingPrimaryId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">
          Property Images
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Upload high-quality images. The main image will be used as the cover
          photo.
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-3 rounded-lg bg-error/10 border border-error/20">
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      {/* Main/Primary Image Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">
            Main Image
          </span>
          <span className="text-xs text-muted-foreground">(Cover photo)</span>
        </div>

        {primaryImage ? (
          <div className="relative group rounded-xl overflow-hidden border-2 border-primary/30 bg-card">
            <img
              src={generateImageUrl(primaryImage.r2Key)}
              alt={primaryImage.alt || "Main property"}
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <label className="cursor-pointer p-3 rounded-full bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-sm">
                <Upload className="w-5 h-5 text-white" />
                <input
                  type="file"
                  accept={ACCEPTED_TYPES.join(",")}
                  className="sr-only"
                  disabled={uploading}
                  onChange={(e) => handleUpload(e.target.files, true)}
                />
              </label>
              <button
                type="button"
                onClick={() => handleDelete(primaryImage.id)}
                disabled={deletingId === primaryImage.id}
                className="p-3 rounded-full bg-white/20 hover:bg-error/60 transition-colors backdrop-blur-sm"
              >
                {deletingId === primaryImage.id ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <Trash2 className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
            <div className="absolute top-3 left-3">
              <span className="px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center gap-1.5">
                <Star className="w-3 h-3 fill-current" />
                Primary
              </span>
            </div>
            {uploading && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
          </div>
        ) : (
          <label
            className={cn(
              "flex flex-col items-center justify-center h-64 rounded-xl border-2 border-dashed transition-colors cursor-pointer",
              uploading
                ? "border-border bg-secondary/50 cursor-not-allowed"
                : "border-border hover:border-primary/50 hover:bg-card"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_TYPES.join(",")}
              className="sr-only"
              disabled={uploading}
              onChange={(e) => handleUpload(e.target.files, true)}
            />
            {uploading ? (
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

      {/* Gallery Images Section */}
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
                src={generateImageUrl(image.r2Key)}
                alt={image.alt || "Gallery"}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSetPrimary(image.id)}
                  disabled={settingPrimaryId === image.id}
                  className="p-2 rounded-full bg-white/20 hover:bg-primary/60 transition-colors backdrop-blur-sm"
                  title="Set as primary"
                >
                  {settingPrimaryId === image.id ? (
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  ) : (
                    <Star className="w-4 h-4 text-white" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(image.id)}
                  disabled={deletingId === image.id}
                  className="p-2 rounded-full bg-white/20 hover:bg-error/60 transition-colors backdrop-blur-sm"
                  title="Delete"
                >
                  {deletingId === image.id ? (
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 text-white" />
                  )}
                </button>
              </div>
            </div>
          ))}

          {/* Add New Image Button */}
          <label
            className={cn(
              "flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors cursor-pointer aspect-4/3",
              uploading
                ? "border-border bg-secondary/50 cursor-not-allowed"
                : "border-border hover:border-primary/50 hover:bg-card"
            )}
          >
            <input
              type="file"
              accept={ACCEPTED_TYPES.join(",")}
              className="sr-only"
              disabled={uploading}
              onChange={(e) => handleUpload(e.target.files, false)}
            />
            {uploading ? (
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
