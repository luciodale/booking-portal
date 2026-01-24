/**
 * Form Utilities
 * Helper functions for form data transformation
 */

/**
 * Transforms null values to undefined for react-hook-form compatibility
 * Database queries often return null, but react-hook-form expects undefined
 *
 * @param values - Object with potentially null values
 * @returns Object with null values converted to undefined
 */
export function nullToUndefined<T extends Record<string, unknown>>(
  values: T | null | undefined
): Partial<T> {
  if (!values) return {};

  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => [
      key,
      value === null ? undefined : value,
    ])
  ) as Partial<T>;
}
