/**
 * Feature Sync Logic
 * Pure functions for syncing amenities/highlights/views to prevent duplicates
 */

import type { Feature } from "@/modules/constants";

type FeatureFields = {
  amenities: Feature[];
  highlights: Feature[];
  views: Feature[];
};

export type FeatureFieldName = keyof FeatureFields;

/**
 * Syncs feature fields to ensure no duplicates across amenities/highlights/views.
 * When an item is added to one field, it's removed from the others (matched by name).
 *
 * @param current - Current values of all three fields
 * @param changedField - Which field was changed
 * @param newValue - The new value for the changed field
 * @returns Updated values for all three fields
 */
export function syncFeatureFields(
  current: FeatureFields,
  changedField: FeatureFieldName,
  newValue: Feature[]
): FeatureFields {
  const currentNames = new Set(current[changedField].map((f) => f.name));
  const addedNames = new Set(
    newValue.filter((f) => !currentNames.has(f.name)).map((f) => f.name)
  );

  const result: FeatureFields = {
    ...current,
    [changedField]: newValue,
  };

  if (addedNames.size > 0) {
    const otherFields = (["amenities", "highlights", "views"] as const).filter(
      (f) => f !== changedField
    );

    for (const field of otherFields) {
      result[field] = current[field].filter((f) => !addedNames.has(f.name));
    }
  }

  return result;
}

/**
 * Returns true if a custom tag name collides with a default option ID.
 * Custom tags that match a default must be added via the default toggle instead.
 */
export function isDefaultCollision(
  customName: string,
  defaultIds: ReadonlySet<string>
): boolean {
  const kebab = displayToKebab(customName);
  return defaultIds.has(kebab);
}

/**
 * Converts kebab-case tag to display format with capitalized words.
 * Example: "private-pool" -> "Private Pool"
 */
export function kebabToDisplay(tag: string): string {
  return tag
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Converts display format to kebab-case tag (lowercase with dashes).
 * Example: "Private Pool" -> "private-pool"
 */
export function displayToKebab(input: string): string {
  return input.trim().toLowerCase().replace(/\s+/g, "-");
}
