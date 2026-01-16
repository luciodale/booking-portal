import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// ============================================================================
// Users table - local guest profiles (links to Clerk)
// ============================================================================
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  clerkUserId: text("clerk_user_id").notNull().unique(),
  email: text("email").notNull(),
  name: text("name"),
  phone: text("phone"),
  avatarUrl: text("avatar_url"),
  preferredCurrency: text("preferred_currency").default("eur"),
  preferredLanguage: text("preferred_language").default("en"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// ============================================================================
// Brokers table - property managers
// ============================================================================
export const brokers = sqliteTable("brokers", {
  id: text("id").primaryKey(),
  clerkUserId: text("clerk_user_id").notNull().unique(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  whatsappNumber: text("whatsapp_number"),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  verified: integer("verified", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// ============================================================================
// Assets table - core entity (apartments, boats, tours)
// ============================================================================
export const assets = sqliteTable("assets", {
  id: text("id").primaryKey(),
  brokerId: text("broker_id")
    .notNull()
    .references(() => brokers.id),

  // Type & Tier
  type: text("type")
    .$type<"apartment" | "boat" | "tour">()
    .notNull()
    .default("apartment"),
  tier: text("tier")
    .$type<"elite" | "standard">()
    .notNull()
    .default("standard"),
  status: text("status")
    .$type<"draft" | "published" | "archived">()
    .notNull()
    .default("draft"),

  // Basic Info
  title: text("title").notNull(),
  description: text("description"),
  shortDescription: text("short_description"), // For cards

  // Location
  location: text("location").notNull(),
  address: text("address"),
  city: text("city"),
  country: text("country"),
  latitude: text("latitude"),
  longitude: text("longitude"),

  // Capacity & Size (apartments/boats)
  maxGuests: integer("max_guests").default(2),
  bedrooms: integer("bedrooms"),
  bathrooms: integer("bathrooms"),
  sqMeters: integer("sq_meters"),

  // Features (JSON arrays - auto-parsed by Drizzle)
  amenities: text("amenities", { mode: "json" }).$type<string[]>(),
  views: text("views", { mode: "json" }).$type<string[]>(),
  highlights: text("highlights", { mode: "json" }).$type<string[]>(),

  // Media
  videoUrl: text("video_url"), // For Elite tier video backgrounds

  // Pricing
  basePrice: integer("base_price").notNull(), // Price in cents per night
  currency: text("currency").notNull().default("eur"),
  cleaningFee: integer("cleaning_fee").default(0),

  // Booking Options
  instantBook: integer("instant_book", { mode: "boolean" })
    .notNull()
    .default(false),
  minNights: integer("min_nights").default(1),
  maxNights: integer("max_nights").default(30),

  // Display
  featured: integer("featured", { mode: "boolean" }).notNull().default(false),
  sortOrder: integer("sort_order").default(0),

  // Timestamps
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// ============================================================================
// Images table - R2 image storage
// ============================================================================
export const images = sqliteTable("images", {
  id: text("id").primaryKey(),
  assetId: text("asset_id")
    .notNull()
    .references(() => assets.id, { onDelete: "cascade" }),
  r2Path: text("r2_path").notNull(),
  r2Key: text("r2_key").notNull(),
  alt: text("alt"),
  isPrimary: integer("is_primary", { mode: "boolean" })
    .notNull()
    .default(false),
  order: integer("order").notNull().default(0),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// ============================================================================
// Pricing Rules - dynamic pricing engine
// ============================================================================
export const pricingRules = sqliteTable("pricing_rules", {
  id: text("id").primaryKey(),
  assetId: text("asset_id")
    .notNull()
    .references(() => assets.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // "Summer Peak", "Holiday Rate"
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  multiplier: integer("multiplier").notNull().default(100), // 100 = 1x, 150 = 1.5x
  minNights: integer("min_nights"), // Override asset minNights
  priority: integer("priority").notNull().default(0), // Higher = takes precedence
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// ============================================================================
// Availabilities - calendar management
// ============================================================================
export const availabilities = sqliteTable("availabilities", {
  id: text("id").primaryKey(),
  assetId: text("asset_id")
    .notNull()
    .references(() => assets.id, { onDelete: "cascade" }),
  date: text("date").notNull(), // YYYY-MM-DD
  status: text("status")
    .$type<"available" | "blocked" | "booked">()
    .notNull()
    .default("available"),
  source: text("source").$type<"manual" | "ical" | "booking">(), // Where the block came from
  note: text("note"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// ============================================================================
// Bookings table
// ============================================================================
export const bookings = sqliteTable("bookings", {
  id: text("id").primaryKey(),
  assetId: text("asset_id")
    .notNull()
    .references(() => assets.id),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),

  // Dates
  checkIn: text("check_in").notNull(),
  checkOut: text("check_out").notNull(),
  nights: integer("nights").notNull(),

  // Guests
  guests: integer("guests").notNull().default(1),

  // Pricing breakdown
  baseTotal: integer("base_total").notNull(), // Base price * nights
  cleaningFee: integer("cleaning_fee").notNull().default(0),
  serviceFee: integer("service_fee").notNull().default(0),
  totalPrice: integer("total_price").notNull(), // Final price in cents
  currency: text("currency").notNull().default("eur"),

  // Status
  status: text("status")
    .$type<"pending" | "confirmed" | "cancelled" | "completed">()
    .notNull()
    .default("pending"),

  // Payment
  stripeSessionId: text("stripe_session_id"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  paidAt: text("paid_at"),

  // Communication
  guestNote: text("guest_note"), // Message to broker

  // Timestamps
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// ============================================================================
// Reviews table
// ============================================================================
export const reviews = sqliteTable("reviews", {
  id: text("id").primaryKey(),
  bookingId: text("booking_id")
    .notNull()
    .references(() => bookings.id),
  assetId: text("asset_id")
    .notNull()
    .references(() => assets.id),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),

  // Rating
  rating: integer("rating").notNull(), // 1-5

  // Content
  title: text("title"),
  content: text("content"),

  // Broker response
  brokerResponse: text("broker_response"),
  brokerRespondedAt: text("broker_responded_at"),

  // Moderation
  status: text("status")
    .$type<"pending" | "published" | "hidden">()
    .notNull()
    .default("pending"),

  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// ============================================================================
// Favorites table - saved listings
// ============================================================================
export const favorites = sqliteTable("favorites", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  assetId: text("asset_id")
    .notNull()
    .references(() => assets.id, { onDelete: "cascade" }),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// ============================================================================
// Experiences table - standalone experiences
// ============================================================================
export const experiences = sqliteTable("experiences", {
  id: text("id").primaryKey(),
  brokerId: text("broker_id")
    .notNull()
    .references(() => brokers.id),

  // Basic Info
  title: text("title").notNull(),
  description: text("description"),
  shortDescription: text("short_description"),

  // Location
  location: text("location").notNull(),
  city: text("city"),
  country: text("country"),

  // Details
  category: text("category").$type<
    "sailing" | "food_wine" | "adventure" | "culture" | "wellness" | "other"
  >(),
  duration: text("duration"), // e.g., "8 hours"
  maxParticipants: integer("max_participants"),

  // Pricing
  basePrice: integer("base_price").notNull(), // Price in cents per person
  currency: text("currency").notNull().default("eur"),

  // Media
  imageUrl: text("image_url"),

  // Status
  status: text("status")
    .$type<"draft" | "published" | "archived">()
    .notNull()
    .default("draft"),
  featured: integer("featured", { mode: "boolean" }).notNull().default(false),

  // Timestamps
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// ============================================================================
// Asset-Experience junction table - links experiences to properties
// ============================================================================
export const assetExperiences = sqliteTable("asset_experiences", {
  id: text("id").primaryKey(),
  assetId: text("asset_id")
    .notNull()
    .references(() => assets.id, { onDelete: "cascade" }),
  experienceId: text("experience_id")
    .notNull()
    .references(() => experiences.id, { onDelete: "cascade" }),

  // Package options
  discountPercent: integer("discount_percent").default(0), // Bundle discount
  featured: integer("featured", { mode: "boolean" }).notNull().default(false), // Show prominently on property page
  sortOrder: integer("sort_order").default(0),

  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// ============================================================================
// Indexes
// ============================================================================
export const usersClerkIdx = index("idx_users_clerk").on(users.clerkUserId);

export const brokersClerkIdx = index("idx_brokers_clerk").on(
  brokers.clerkUserId
);

export const assetsBrokerIdx = index("idx_assets_broker").on(assets.brokerId);
export const assetsTypeIdx = index("idx_assets_type").on(assets.type);
export const assetsTierIdx = index("idx_assets_tier").on(assets.tier);
export const assetsStatusIdx = index("idx_assets_status").on(assets.status);
export const assetsFeaturedIdx = index("idx_assets_featured").on(
  assets.featured
);
export const assetsLocationIdx = index("idx_assets_city").on(assets.city);

export const imagesAssetIdx = index("idx_images_asset").on(images.assetId);

export const pricingRulesAssetIdx = index("idx_pricing_rules_asset").on(
  pricingRules.assetId
);
export const pricingRulesDateIdx = index("idx_pricing_rules_dates").on(
  pricingRules.startDate,
  pricingRules.endDate
);

export const availabilitiesAssetIdx = index("idx_availabilities_asset").on(
  availabilities.assetId
);
export const availabilitiesDateIdx = index("idx_availabilities_date").on(
  availabilities.date
);
export const availabilitiesAssetDateIdx = index(
  "idx_availabilities_asset_date"
).on(availabilities.assetId, availabilities.date);

export const bookingsAssetIdx = index("idx_bookings_asset").on(
  bookings.assetId
);
export const bookingsUserIdx = index("idx_bookings_user").on(bookings.userId);
export const bookingsStatusIdx = index("idx_bookings_status").on(
  bookings.status
);
export const bookingsDatesIdx = index("idx_bookings_dates").on(
  bookings.checkIn,
  bookings.checkOut
);

export const reviewsAssetIdx = index("idx_reviews_asset").on(reviews.assetId);
export const reviewsUserIdx = index("idx_reviews_user").on(reviews.userId);
export const reviewsStatusIdx = index("idx_reviews_status").on(reviews.status);

export const favoritesUserIdx = index("idx_favorites_user").on(
  favorites.userId
);
export const favoritesAssetIdx = index("idx_favorites_asset").on(
  favorites.assetId
);
export const favoritesUserAssetIdx = index("idx_favorites_user_asset").on(
  favorites.userId,
  favorites.assetId
);

export const experiencesBrokerIdx = index("idx_experiences_broker").on(
  experiences.brokerId
);
export const experiencesCategoryIdx = index("idx_experiences_category").on(
  experiences.category
);
export const experiencesStatusIdx = index("idx_experiences_status").on(
  experiences.status
);

export const assetExperiencesAssetIdx = index("idx_asset_experiences_asset").on(
  assetExperiences.assetId
);
export const assetExperiencesExpIdx = index("idx_asset_experiences_exp").on(
  assetExperiences.experienceId
);
export const assetExperiencesAssetExpIdx = index(
  "idx_asset_experiences_asset_exp"
).on(assetExperiences.assetId, assetExperiences.experienceId);

// ============================================================================
// Type exports
// ============================================================================
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Broker = typeof brokers.$inferSelect;
export type NewBroker = typeof brokers.$inferInsert;
export type Asset = typeof assets.$inferSelect;
export type NewAsset = typeof assets.$inferInsert;
export type Image = typeof images.$inferSelect;
export type NewImage = typeof images.$inferInsert;
export type PricingRule = typeof pricingRules.$inferSelect;
export type NewPricingRule = typeof pricingRules.$inferInsert;
export type Availability = typeof availabilities.$inferSelect;
export type NewAvailability = typeof availabilities.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
export type Favorite = typeof favorites.$inferSelect;
export type NewFavorite = typeof favorites.$inferInsert;
export type Experience = typeof experiences.$inferSelect;
export type NewExperience = typeof experiences.$inferInsert;
export type AssetExperience = typeof assetExperiences.$inferSelect;
export type NewAssetExperience = typeof assetExperiences.$inferInsert;
