export interface ExperienceCategory {
  id: string;
  label: string;
  icon: string;
}

export const experienceCategories: ExperienceCategory[] = [
  { id: "sailing", label: "Sailing", icon: "sailboat" },
  { id: "food_wine", label: "Food & Wine", icon: "wine" },
  { id: "adventure", label: "Adventure", icon: "compass" },
  { id: "culture", label: "Culture", icon: "landmark" },
  { id: "wellness", label: "Wellness", icon: "heart-pulse" },
  { id: "watersports", label: "Water Sports", icon: "waves" },
  { id: "diving", label: "Diving & Snorkeling", icon: "fish" },
  { id: "fishing", label: "Fishing", icon: "fish" },
  { id: "hiking", label: "Hiking & Trekking", icon: "mountain" },
  { id: "cycling", label: "Cycling", icon: "bike" },
  { id: "horse_riding", label: "Horse Riding", icon: "palmtree" },
  { id: "cooking_class", label: "Cooking Class", icon: "chef-hat" },
  { id: "wine_tasting", label: "Wine Tasting", icon: "grape" },
  { id: "yoga", label: "Yoga & Meditation", icon: "flower-2" },
  { id: "photography", label: "Photography", icon: "camera" },
  { id: "art", label: "Art & Crafts", icon: "palette" },
  { id: "music", label: "Music & Entertainment", icon: "music" },
  { id: "nightlife", label: "Nightlife", icon: "moon" },
  { id: "shopping", label: "Shopping", icon: "shopping-bag" },
  { id: "sightseeing", label: "Sightseeing", icon: "map-pin" },
  { id: "nature", label: "Nature & Wildlife", icon: "tree-pine" },
  { id: "family", label: "Family Activities", icon: "users" },
  { id: "luxury", label: "Luxury Experiences", icon: "crown" },
  { id: "private_tour", label: "Private Tour", icon: "map" },
  { id: "golf", label: "Golf", icon: "flag" },
  { id: "skiing", label: "Skiing & Snowboarding", icon: "snowflake" },
  { id: "spa_retreat", label: "Spa Retreat", icon: "sparkles" },
  { id: "other", label: "Other", icon: "circle-dot" },
];

/** Backward-compatible Record<id, label> derived from the canonical array */
export const experienceCategoryLabels: Record<string, string> =
  Object.fromEntries(experienceCategories.map((c) => [c.id, c.label]));

/** Get the icon name for an experience category */
export function getExperienceCategoryIcon(categoryId: string): string {
  return (
    experienceCategories.find((c) => c.id === categoryId)?.icon ?? "circle-dot"
  );
}
