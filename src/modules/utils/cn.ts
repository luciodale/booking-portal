import { twMerge } from "tailwind-merge";

/**
 * Utility function for conditionally merging Tailwind CSS classes.
 * Uses tailwind-merge to properly handle conflicting class names.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return twMerge(classes.filter(Boolean).join(" "));
}
