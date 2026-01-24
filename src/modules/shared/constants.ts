/**
 * Shared Constants
 * Centralized definitions for amenities and their icons
 */

import type { LucideIcon } from "lucide-react";
import {
  ArrowUpDown,
  Bath,
  Bed,
  Beef,
  Car,
  ChefHat,
  ConciergeBell,
  Dumbbell,
  Fence,
  Flame,
  Flower2,
  Mountain,
  ShieldCheck,
  Snowflake,
  Sparkles,
  SprayCan,
  Thermometer,
  Waves,
  Wifi,
  Wine,
} from "lucide-react";

/**
 * Standard Amenity Definition
 */
export interface AmenityDefinition {
  /** Unique identifier (used as form value) */
  id: string;
  /** Human-readable label */
  label: string;
  /** Lucide icon component (for React) */
  icon: LucideIcon;
  /** Lucide icon name (for Astro data-lucide) */
  iconName: string;
}

/**
 * Standard Amenities with Icons
 * Single source of truth for amenity definitions used in forms and display
 */
export const STANDARD_AMENITIES: AmenityDefinition[] = [
  { id: "pool", label: "Pool", icon: Waves, iconName: "waves" },
  { id: "spa", label: "Spa", icon: Sparkles, iconName: "sparkles" },
  { id: "sauna", label: "Sauna", icon: Flame, iconName: "flame" },
  {
    id: "fitness",
    label: "Fitness Room",
    icon: Dumbbell,
    iconName: "dumbbell",
  },
  { id: "wine-cellar", label: "Wine Cellar", icon: Wine, iconName: "wine" },
  {
    id: "elevator",
    label: "Elevator",
    icon: ArrowUpDown,
    iconName: "arrow-up-down",
  },
  {
    id: "air-conditioning",
    label: "Air Conditioning",
    icon: Snowflake,
    iconName: "snowflake",
  },
  {
    id: "underfloor-heating",
    label: "Underfloor Heating",
    icon: Thermometer,
    iconName: "thermometer",
  },
  {
    id: "alarm-system",
    label: "Alarm System",
    icon: ShieldCheck,
    iconName: "shield-check",
  },
  { id: "parking", label: "Parking", icon: Car, iconName: "car" },
  { id: "garden", label: "Garden", icon: Flower2, iconName: "flower-2" },
  { id: "terrace", label: "Terrace", icon: Fence, iconName: "fence" },
  { id: "sea-view", label: "Sea View", icon: Waves, iconName: "waves" },
  {
    id: "mountain-view",
    label: "Mountain View",
    icon: Mountain,
    iconName: "mountain",
  },
  { id: "fireplace", label: "Fireplace", icon: Flame, iconName: "flame" },
  { id: "bbq", label: "BBQ", icon: Beef, iconName: "beef" },
  { id: "wifi", label: "WiFi", icon: Wifi, iconName: "wifi" },
  {
    id: "concierge",
    label: "Concierge",
    icon: ConciergeBell,
    iconName: "concierge-bell",
  },
  { id: "chef", label: "Private Chef", icon: ChefHat, iconName: "chef-hat" },
  {
    id: "housekeeping",
    label: "Housekeeping",
    icon: SprayCan,
    iconName: "spray-can",
  },
  // Additional common amenities
  { id: "bedrooms", label: "Bedrooms", icon: Bed, iconName: "bed" },
  { id: "bathrooms", label: "Bathrooms", icon: Bath, iconName: "bath" },
];

/**
 * Map of amenity ID to definition for quick lookup
 */
export const AMENITY_MAP = new Map<string, AmenityDefinition>(
  STANDARD_AMENITIES.map((a) => [a.id, a])
);

/**
 * Get amenity options for form fields
 */
export function getAmenityOptions(): { value: string; label: string }[] {
  return STANDARD_AMENITIES.filter(
    (a) => a.id !== "bedrooms" && a.id !== "bathrooms"
  ).map((a) => ({
    value: a.id,
    label: a.label,
  }));
}

/**
 * Get the icon component for an amenity by its ID or label
 * Falls back to a default icon if not found
 */
export function getAmenityIcon(
  amenityIdOrLabel: string
): LucideIcon | undefined {
  // Try exact ID match first
  const byId = AMENITY_MAP.get(amenityIdOrLabel.toLowerCase());
  if (byId) return byId.icon;

  // Try matching by label (case-insensitive)
  const normalized = amenityIdOrLabel.toLowerCase();
  const byLabel = STANDARD_AMENITIES.find(
    (a) => a.label.toLowerCase() === normalized
  );
  if (byLabel) return byLabel.icon;

  // Try partial match for common variations
  const partial = STANDARD_AMENITIES.find(
    (a) =>
      normalized.includes(a.id) ||
      normalized.includes(a.label.toLowerCase()) ||
      a.label.toLowerCase().includes(normalized)
  );
  return partial?.icon;
}

/**
 * Get the icon name string for an amenity by its ID or label (for Astro)
 * Falls back to a default icon name 'check' if not found
 */
export function getAmenityIconName(amenityIdOrLabel: string): string {
  // Try exact ID match first
  const byId = AMENITY_MAP.get(amenityIdOrLabel.toLowerCase());
  if (byId) return byId.iconName;

  // Try matching by label (case-insensitive)
  const normalized = amenityIdOrLabel.toLowerCase();
  const byLabel = STANDARD_AMENITIES.find(
    (a) => a.label.toLowerCase() === normalized
  );
  if (byLabel) return byLabel.iconName;

  // Try partial match for common variations
  const partial = STANDARD_AMENITIES.find(
    (a) =>
      normalized.includes(a.id) ||
      normalized.includes(a.label.toLowerCase()) ||
      a.label.toLowerCase().includes(normalized)
  );
  return partial?.iconName ?? "check";
}
