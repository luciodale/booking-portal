/**
 * Feature Sync Logic
 * Pure functions for syncing amenities/highlights/views to prevent duplicates
 */

type FeatureFields = {
  amenities: string[];
  highlights: string[];
  views: string[];
};

export type FeatureFieldName = keyof FeatureFields;

/**
 * Syncs feature fields to ensure no duplicates across amenities/highlights/views.
 * When an item is added to one field, it's removed from the others.
 *
 * @param current - Current values of all three fields
 * @param changedField - Which field was changed
 * @param newValue - The new value for the changed field
 * @returns Updated values for all three fields
 */
export function syncFeatureFields(
  current: FeatureFields,
  changedField: FeatureFieldName,
  newValue: string[]
): FeatureFields {
  // Find newly added items
  const addedItems = newValue.filter((v) => !current[changedField].includes(v));

  // Start with updated changed field
  const result: FeatureFields = {
    ...current,
    [changedField]: newValue,
  };

  // Remove newly added items from other fields
  if (addedItems.length > 0) {
    const otherFields = (["amenities", "highlights", "views"] as const).filter(
      (f) => f !== changedField
    );

    for (const field of otherFields) {
      result[field] = current[field].filter((v) => !addedItems.includes(v));
    }
  }

  return result;
}

/**
 * Converts kebab-case tag to display format with capitalized words.
 * Example: "private-pool" → "Private Pool"
 *
 * @param tag - Kebab-case tag string
 * @returns Display-formatted string
 */
export function kebabToDisplay(tag: string): string {
  return tag
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Converts display format to kebab-case tag (lowercase with dashes).
 * Example: "Private Pool" → "private-pool"
 *
 * @param input - Display-formatted string
 * @returns Kebab-case tag string
 */
export function displayToKebab(input: string): string {
  return input.trim().toLowerCase().replace(/\s+/g, "-");
}
