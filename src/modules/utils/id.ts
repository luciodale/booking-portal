/**
 * Unique ID Generation Utility
 * Centralizes ID generation using nanoid for consistency
 */

import { nanoid } from "nanoid";

/**
 * Generates a unique ID with an optional prefix
 * @param prefix - Optional prefix to prepend to the ID (e.g., "prop", "img", "bk")
 * @returns A unique string ID in the format "prefix-nanoid" or just "nanoid" if no prefix
 */
export function genUniqueId(prefix?: string): string {
  const id = nanoid();
  return prefix ? `${prefix}-${id}` : id;
}
