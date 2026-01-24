/**
 * Shared Constants
 * Centralized definitions for amenities and their icons
 */

import type { LucideIcon } from "lucide-react";
import {
  ArrowUpDown,
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
  Sun,
  Thermometer,
  Waves,
  Wifi,
  Wine,
} from "lucide-react";

/**
 * Standard Amenity Definition
 */
export interface TFacilities {
  /** Unique identifier (used as form value) */
  id: string;
  /** Lucide icon component (for React) */
  icon: LucideIcon;
  /** Lucide icon name (for Astro data-lucide) */
  iconName: string;
}

export const HIGHLIGHT_OPTIONS: TFacilities[] = [
  { id: "private-pool", icon: Waves, iconName: "waves" },
  { id: "private-beach", icon: Waves, iconName: "waves" },
  { id: "private-chef", icon: ChefHat, iconName: "chef-hat" },
  { id: "spa", icon: Sparkles, iconName: "sparkles" },
  { id: "sauna", icon: Flame, iconName: "flame" },
  { id: "fitness-room", icon: Dumbbell, iconName: "dumbbell" },
  { id: "wine-cellar", icon: Wine, iconName: "wine" },
];

export const VIEW_OPTIONS: TFacilities[] = [
  { id: "sea-view", icon: Waves, iconName: "waves" },
  { id: "mountain-view", icon: Mountain, iconName: "mountain" },
  { id: "lake-view", icon: Waves, iconName: "waves" },
  { id: "city-view", icon: Waves, iconName: "waves" },
  { id: "garden-view", icon: Flower2, iconName: "flower-2" },
  { id: "sunset-view", icon: Sun, iconName: "sun" },
  { id: "sunrise-view", icon: Waves, iconName: "waves" },
];

/**
 * Standard Amenities with Icons
 * Single source of truth for amenity definitions used in forms and display
 */
export const STANDARD_AMENITIES: TFacilities[] = [
  { id: "pool", icon: Waves, iconName: "waves" },
  { id: "spa", icon: Sparkles, iconName: "sparkles" },
  { id: "sauna", icon: Flame, iconName: "flame" },
  {
    id: "fitness-room",
    icon: Dumbbell,
    iconName: "dumbbell",
  },
  {
    id: "elevator",
    icon: ArrowUpDown,
    iconName: "arrow-up-down",
  },
  {
    id: "air-conditioning",
    icon: Snowflake,
    iconName: "snowflake",
  },
  {
    id: "underfloor-heating",
    icon: Thermometer,
    iconName: "thermometer",
  },
  {
    id: "alarm-system",
    icon: ShieldCheck,
    iconName: "shield-check",
  },
  { id: "parking", icon: Car, iconName: "car" },
  { id: "garden", icon: Flower2, iconName: "flower-2" },
  { id: "terrace", icon: Fence, iconName: "fence" },
  { id: "fireplace", icon: Flame, iconName: "flame" },
  { id: "bbq", icon: Beef, iconName: "beef" },
  { id: "wifi", icon: Wifi, iconName: "wifi" },
  {
    id: "concierge",
    icon: ConciergeBell,
    iconName: "concierge-bell",
  },
  {
    id: "housekeeping",
    icon: SprayCan,
    iconName: "spray-can",
  },
];

/**
 * Map of amenity ID to definition for quick lookup
 */
const AMENITY_MAP = new Map<string, TFacilities>(
  STANDARD_AMENITIES.map((a) => [a.id, a])
);

const VIEW_MAP = new Map<string, TFacilities>(
  VIEW_OPTIONS.map((v) => [v.id, v])
);

const HIGHLIGHT_MAP = new Map<string, TFacilities>(
  HIGHLIGHT_OPTIONS.map((h) => [h.id, h])
);

type TFacilityGroup = "amenity" | "highlight" | "view";

/**
 * Get amenity options for form fields
 */
export function getFacilityOptions(group: TFacilityGroup) {
  switch (group) {
    case "amenity":
      return STANDARD_AMENITIES.map((a) => ({
        value: a.id,
      }));
    case "highlight":
      return HIGHLIGHT_OPTIONS.map((h) => ({
        value: h.id,
      }));
    case "view":
      return VIEW_OPTIONS.map((v) => ({
        value: v.id,
      }));
  }
}

/**
 * Get the icon name string for an amenity by its ID or label (for Astro)
 * Falls back to a default icon name 'check' if not found
 */
export function getFacilityIconName(facilityId: string, group: TFacilityGroup) {
  if (group === "amenity") {
    return AMENITY_MAP.get(facilityId)?.iconName ?? "check";
  }
  if (group === "highlight") {
    return HIGHLIGHT_MAP.get(facilityId)?.iconName ?? "check";
  }
  if (group === "view") {
    return VIEW_MAP.get(facilityId)?.iconName ?? "check";
  }
  return "check";
}
