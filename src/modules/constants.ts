/**
 * Shared Constants
 * Centralized definitions for amenities, highlights, views, and their icons
 */

import type { LucideIcon } from "lucide-react";
import {
  AlarmSmoke,
  ArrowUpDown,
  Baby,
  Beef,
  Car,
  ChefHat,
  Coffee,
  ConciergeBell,
  Dumbbell,
  Eye,
  Fence,
  Flame,
  Flower2,
  Grape,
  Heart,
  Lamp,
  Landmark,
  Lock,
  Mountain,
  ShieldCheck,
  Snowflake,
  Sparkles,
  SprayCan,
  Sun,
  Thermometer,
  TreePine,
  Tv,
  Umbrella,
  UtensilsCrossed,
  Waves,
  Wifi,
  Wine,
} from "lucide-react";

// ============================================================================
// Feature type — the DB/runtime shape for amenities/highlights/views
// ============================================================================

export interface Feature {
  name: string;
  icon: string;
}

// ============================================================================
// Facility definition (internal — icons + React component)
// ============================================================================

export interface TFacilities {
  id: string;
  icon: LucideIcon;
  iconName: string;
}

// ============================================================================
// Standard Amenities
// ============================================================================

export const STANDARD_AMENITIES: TFacilities[] = [
  { id: "pool", icon: Waves, iconName: "waves" },
  { id: "spa", icon: Sparkles, iconName: "sparkles" },
  { id: "sauna", icon: Flame, iconName: "flame" },
  { id: "fitness-room", icon: Dumbbell, iconName: "dumbbell" },
  { id: "elevator", icon: ArrowUpDown, iconName: "arrow-up-down" },
  { id: "air-conditioning", icon: Snowflake, iconName: "snowflake" },
  { id: "underfloor-heating", icon: Thermometer, iconName: "thermometer" },
  { id: "alarm-system", icon: ShieldCheck, iconName: "shield-check" },
  { id: "parking", icon: Car, iconName: "car" },
  { id: "garden", icon: Flower2, iconName: "flower-2" },
  { id: "terrace", icon: Fence, iconName: "fence" },
  { id: "fireplace", icon: Flame, iconName: "flame" },
  { id: "bbq", icon: Beef, iconName: "beef" },
  { id: "wifi", icon: Wifi, iconName: "wifi" },
  { id: "concierge", icon: ConciergeBell, iconName: "concierge-bell" },
  { id: "housekeeping", icon: SprayCan, iconName: "spray-can" },
  { id: "dishwasher", icon: UtensilsCrossed, iconName: "utensils-crossed" },
  { id: "washing-machine", icon: AlarmSmoke, iconName: "alarm-smoke" },
  { id: "dryer", icon: Sun, iconName: "sun" },
  { id: "oven", icon: Flame, iconName: "flame" },
  { id: "microwave", icon: Lamp, iconName: "lamp" },
  { id: "coffee-machine", icon: Coffee, iconName: "coffee" },
  { id: "iron", icon: ShieldCheck, iconName: "shield-check" },
  { id: "hair-dryer", icon: Waves, iconName: "waves" },
  { id: "tv", icon: Tv, iconName: "tv" },
  { id: "safe", icon: Lock, iconName: "lock" },
  { id: "pet-friendly", icon: Heart, iconName: "heart" },
  { id: "baby-crib", icon: Baby, iconName: "baby" },
  { id: "hot-tub", icon: Waves, iconName: "waves" },
  { id: "heated-pool", icon: Thermometer, iconName: "thermometer" },
  { id: "balcony", icon: Fence, iconName: "fence" },
  { id: "rooftop", icon: Mountain, iconName: "mountain" },
  { id: "mini-bar", icon: Wine, iconName: "wine" },
  { id: "kitchen", icon: UtensilsCrossed, iconName: "utensils-crossed" },
];

// ============================================================================
// Highlight Options
// ============================================================================

export const HIGHLIGHT_OPTIONS: TFacilities[] = [
  { id: "private-pool", icon: Waves, iconName: "waves" },
  { id: "private-beach", icon: Umbrella, iconName: "umbrella" },
  { id: "private-chef", icon: ChefHat, iconName: "chef-hat" },
  { id: "spa", icon: Sparkles, iconName: "sparkles" },
  { id: "sauna", icon: Flame, iconName: "flame" },
  { id: "fitness-room", icon: Dumbbell, iconName: "dumbbell" },
  { id: "wine-cellar", icon: Wine, iconName: "wine" },
  { id: "infinity-pool", icon: Waves, iconName: "waves" },
  { id: "rooftop-terrace", icon: Fence, iconName: "fence" },
  { id: "private-jacuzzi", icon: Waves, iconName: "waves" },
  { id: "butler-service", icon: ConciergeBell, iconName: "concierge-bell" },
  { id: "home-cinema", icon: Tv, iconName: "tv" },
];

// ============================================================================
// View Options
// ============================================================================

export const VIEW_OPTIONS: TFacilities[] = [
  { id: "sea-view", icon: Waves, iconName: "waves" },
  { id: "mountain-view", icon: Mountain, iconName: "mountain" },
  { id: "lake-view", icon: Waves, iconName: "waves" },
  { id: "city-view", icon: Landmark, iconName: "landmark" },
  { id: "garden-view", icon: Flower2, iconName: "flower-2" },
  { id: "sunset-view", icon: Sun, iconName: "sun" },
  { id: "sunrise-view", icon: Sun, iconName: "sun" },
  { id: "ocean-view", icon: Waves, iconName: "waves" },
  { id: "valley-view", icon: Mountain, iconName: "mountain" },
  { id: "vineyard-view", icon: Grape, iconName: "grape" },
  { id: "pool-view", icon: Waves, iconName: "waves" },
  { id: "forest-view", icon: TreePine, iconName: "tree-pine" },
  { id: "panoramic-view", icon: Eye, iconName: "eye" },
];

// ============================================================================
// Lookup maps
// ============================================================================

const AMENITY_MAP = new Map<string, TFacilities>(
  STANDARD_AMENITIES.map((a) => [a.id, a])
);

const VIEW_MAP = new Map<string, TFacilities>(
  VIEW_OPTIONS.map((v) => [v.id, v])
);

const HIGHLIGHT_MAP = new Map<string, TFacilities>(
  HIGHLIGHT_OPTIONS.map((h) => [h.id, h])
);

export type TFacilityGroup = "amenity" | "highlight" | "view";

// ============================================================================
// Helpers
// ============================================================================

/**
 * Get the default icon name for a known facility ID, or null if custom.
 */
export function getDefaultIcon(
  facilityId: string,
  group: TFacilityGroup
): string | null {
  switch (group) {
    case "amenity":
      return AMENITY_MAP.get(facilityId)?.iconName ?? null;
    case "highlight":
      return HIGHLIGHT_MAP.get(facilityId)?.iconName ?? null;
    case "view":
      return VIEW_MAP.get(facilityId)?.iconName ?? null;
  }
}

/**
 * Check if a facility ID is in the predefined list for a given group.
 */
export function isDefaultFacility(
  facilityId: string,
  group: TFacilityGroup
): boolean {
  switch (group) {
    case "amenity":
      return AMENITY_MAP.has(facilityId);
    case "highlight":
      return HIGHLIGHT_MAP.has(facilityId);
    case "view":
      return VIEW_MAP.has(facilityId);
  }
}

/**
 * Get facility options for form fields — each option includes its icon name.
 */
export function getFacilityOptions(
  group: TFacilityGroup
): Array<{ value: string; icon: string }> {
  switch (group) {
    case "amenity":
      return STANDARD_AMENITIES.map((a) => ({ value: a.id, icon: a.iconName }));
    case "highlight":
      return HIGHLIGHT_OPTIONS.map((h) => ({ value: h.id, icon: h.iconName }));
    case "view":
      return VIEW_OPTIONS.map((v) => ({ value: v.id, icon: v.iconName }));
  }
}

/**
 * Get the icon name string for a facility by its ID (for Astro data-lucide).
 * Falls back to 'check' if not found.
 */
export function getFacilityIconName(
  facilityId: string,
  group: TFacilityGroup
): string {
  return getDefaultIcon(facilityId, group) ?? "check";
}
