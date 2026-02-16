import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// ============================================================================
// Users table - unified profiles (guests + property managers, links to Clerk)
// ============================================================================
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  name: text("name"),
  phone: text("phone"),
  avatarUrl: text("avatar_url"),
  preferredLanguage: text("preferred_language").default("en"),
  whatsappNumber: text("whatsapp_number"),
  bio: text("bio"),
  verified: integer("verified", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// ============================================================================
// PMS Integrations table - Property Management System integrations (Smoobu)
// ============================================================================
export const pmsIntegrations = sqliteTable(
  "pms_integrations",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    provider: text("provider").notNull(), // "smoobu"
    apiKey: text("api_key").notNull(),
    pmsUserId: integer("pms_user_id"),
    pmsEmail: text("pms_email"),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("idx_pms_integrations_user").on(table.userId)]
);

// ============================================================================
// Assets table - core entity (hotels from Smoobu)
// ============================================================================
export const assets = sqliteTable(
  "assets",
  {
    id: text("id").primaryKey(),
    smoobuPropertyId: integer("smoobu_property_id").unique(), // null for experiences
    userId: text("user_id")
      .notNull()
      .references(() => users.id),

    // Tier
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

    // Location (from Smoobu for hotels)
    street: text("street"),
    zip: text("zip"),
    city: text("city"),
    country: text("country"),
    latitude: text("latitude"),
    longitude: text("longitude"),
    showFullAddress: integer("show_full_address", { mode: "boolean" })
      .notNull()
      .default(true),

    // Rooms (from Smoobu for hotels)
    maxOccupancy: integer("max_occupancy"),
    bedrooms: integer("bedrooms"),
    bathrooms: integer("bathrooms"),
    doubleBeds: integer("double_beds"),
    singleBeds: integer("single_beds"),
    sofaBeds: integer("sofa_beds"),
    couches: integer("couches"),
    childBeds: integer("child_beds"),
    queenSizeBeds: integer("queen_size_beds"),
    kingSizeBeds: integer("king_size_beds"),
    sqMeters: integer("sq_meters"),

    // Check-in / Check-out defaults (HH:mm)
    checkIn: text("check_in"),
    checkOut: text("check_out"),

    // Features (JSON arrays - auto-parsed by Drizzle)
    amenities: text("amenities", { mode: "json" }).$type<string[]>(),
    views: text("views", { mode: "json" }).$type<string[]>(),
    highlights: text("highlights", { mode: "json" }).$type<string[]>(),

    // Media
    videoUrl: text("video_url"), // For Elite tier video backgrounds
    pdfAssetPath: text("pdf_asset_path"), // Static PDF path e.g. /flyers/property-name.pdf

    // Booking Options
    instantBook: integer("instant_book", { mode: "boolean" })
      .notNull()
      .default(false),

    // Additional Costs
    additionalCosts: text("additional_costs", { mode: "json" }).$type<
      Array<{
        label: string;
        amount: number;
        per: "stay" | "night" | "guest" | "night_per_guest";
        maxNights?: number;
      }>
    >(),

    // Extras (guest-selectable add-ons)
    extras: text("extras", { mode: "json" }).$type<
      Array<{
        name: string;
        icon: string;
        amount: number;
        per: "stay" | "night" | "guest" | "night_per_guest";
        maxNights?: number;
      }>
    >(),

    // Timestamps
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_assets_user").on(table.userId),
    index("idx_assets_tier").on(table.tier),
    index("idx_assets_status").on(table.status),
    index("idx_assets_city").on(table.city),
  ]
);

// ============================================================================
// Images table - R2 image storage
// ============================================================================
export const images = sqliteTable(
  "images",
  {
    id: text("id").primaryKey(),
    assetId: text("asset_id")
      .notNull()
      .references(() => assets.id, { onDelete: "cascade" }),
    r2Key: text("r2_key").notNull(),
    alt: text("alt"),
    isPrimary: integer("is_primary", { mode: "boolean" })
      .notNull()
      .default(false),
    order: integer("order").notNull().default(0),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("idx_images_asset").on(table.assetId)]
);

// ============================================================================
// Broker Logs - tracking Smoobu sync, payments, and other events
// ============================================================================
export const brokerLogs = sqliteTable(
  "broker_logs",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    eventType: text("event_type").notNull(), // "smoobu_booking_success", "smoobu_booking_failure", etc.
    relatedEntityId: text("related_entity_id"), // booking id, asset id, etc.
    message: text("message").notNull(),
    metadata: text("metadata", { mode: "json" }).$type<
      Record<string, unknown>
    >(),
    acknowledged: integer("acknowledged", { mode: "boolean" })
      .notNull()
      .default(false),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_broker_logs_user").on(table.userId),
    index("idx_broker_logs_acknowledged").on(table.acknowledged),
  ]
);

// ============================================================================
// Event Logs - system-wide admin-scoped event logging
// ============================================================================
export const eventLogs = sqliteTable(
  "event_logs",
  {
    id: text("id").primaryKey(),
    level: text("level").$type<"info" | "warning" | "error">().notNull(),
    source: text("source").notNull(),
    message: text("message").notNull(),
    metadata: text("metadata", { mode: "json" }).$type<
      Record<string, unknown>
    >(),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_event_logs_level").on(table.level),
    index("idx_event_logs_source").on(table.source),
    index("idx_event_logs_created_at").on(table.createdAt),
  ]
);

// ============================================================================
// Bookings table
// ============================================================================
export const bookings = sqliteTable(
  "bookings",
  {
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
    baseTotal: integer("base_total").notNull(),
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

    // Smoobu Integration
    smoobuReservationId: integer("smoobu_reservation_id"),

    // Communication
    guestNote: text("guest_note"), // Message to broker

    // Timestamps
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_bookings_asset").on(table.assetId),
    index("idx_bookings_user").on(table.userId),
    index("idx_bookings_status").on(table.status),
    index("idx_bookings_dates").on(table.checkIn, table.checkOut),
  ]
);

// ============================================================================
// Reviews table
// ============================================================================
export const reviews = sqliteTable(
  "reviews",
  {
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

    // Owner response
    ownerResponse: text("owner_response"),
    ownerRespondedAt: text("owner_responded_at"),

    // Moderation
    status: text("status")
      .$type<"pending" | "published" | "hidden">()
      .notNull()
      .default("pending"),

    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_reviews_asset").on(table.assetId),
    index("idx_reviews_user").on(table.userId),
    index("idx_reviews_status").on(table.status),
  ]
);

// ============================================================================
// Experiences table - standalone experiences
// ============================================================================
export const experiences = sqliteTable(
  "experiences",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),

    // Basic Info
    title: text("title").notNull(),
    description: text("description"),
    shortDescription: text("short_description"),

    // Location
    city: text("city"),
    country: text("country"),

    // Details
    category: text("category"),
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

    // Pricing visibility
    showPrice: integer("show_price", { mode: "boolean" })
      .notNull()
      .default(true),

    // Additional Costs
    additionalCosts: text("additional_costs", { mode: "json" }).$type<
      Array<{
        label: string;
        amount: number;
        per: "booking" | "participant";
      }>
    >(),

    // Booking Options
    instantBook: integer("instant_book", { mode: "boolean" })
      .notNull()
      .default(false),

    // Timestamps
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_experiences_user").on(table.userId),
    index("idx_experiences_category").on(table.category),
    index("idx_experiences_status").on(table.status),
  ]
);

// ============================================================================
// Experience Images table - R2 image storage for experiences
// ============================================================================
export const experienceImages = sqliteTable(
  "experience_images",
  {
    id: text("id").primaryKey(),
    experienceId: text("experience_id")
      .notNull()
      .references(() => experiences.id, { onDelete: "cascade" }),
    r2Key: text("r2_key").notNull(),
    alt: text("alt"),
    isPrimary: integer("is_primary", { mode: "boolean" })
      .notNull()
      .default(false),
    order: integer("order").notNull().default(0),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("idx_experience_images_exp").on(table.experienceId)]
);

// ============================================================================
// Asset-Experience junction table - links experiences to properties
// ============================================================================
export const assetExperiences = sqliteTable(
  "asset_experiences",
  {
    id: text("id").primaryKey(),
    assetId: text("asset_id")
      .notNull()
      .references(() => assets.id, { onDelete: "cascade" }),
    experienceId: text("experience_id")
      .notNull()
      .references(() => experiences.id, { onDelete: "cascade" }),

    // Package options
    discountPercent: integer("discount_percent").default(0), // Bundle discount
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_asset_experiences_asset").on(table.assetId),
    index("idx_asset_experiences_exp").on(table.experienceId),
    index("idx_asset_experiences_asset_exp").on(
      table.assetId,
      table.experienceId
    ),
  ]
);

// ============================================================================
// Experience Bookings table
// ============================================================================
export const experienceBookings = sqliteTable(
  "experience_bookings",
  {
    id: text("id").primaryKey(),
    experienceId: text("experience_id")
      .notNull()
      .references(() => experiences.id),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),

    // Booking details
    bookingDate: text("booking_date").notNull(), // YYYY-MM-DD
    participants: integer("participants").notNull(),

    // Pricing
    totalPrice: integer("total_price").notNull(), // cents
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

    // Guest info
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    guestNote: text("guest_note"),

    // Timestamps
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_exp_bookings_experience").on(table.experienceId),
    index("idx_exp_bookings_user").on(table.userId),
    index("idx_exp_bookings_status").on(table.status),
  ]
);

// ============================================================================
// City Tax Defaults - per-city tourist tax defaults for broker convenience
// ============================================================================
export const cityTaxDefaults = sqliteTable(
  "city_tax_defaults",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    city: text("city").notNull(),
    country: text("country").notNull().default("IT"),
    amount: integer("amount").notNull(), // cents, per person per night
    maxNights: integer("max_nights"), // null = no cap
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_city_tax_defaults_user").on(table.userId),
    index("idx_city_tax_defaults_city").on(table.city, table.country),
  ]
);

// ============================================================================
// Type exports
// ============================================================================
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type PmsIntegration = typeof pmsIntegrations.$inferSelect;
export type NewPmsIntegration = typeof pmsIntegrations.$inferInsert;
export type Asset = typeof assets.$inferSelect;
export type NewAsset = typeof assets.$inferInsert;
export type Image = typeof images.$inferSelect;
export type NewImage = typeof images.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
export type Experience = typeof experiences.$inferSelect;
export type NewExperience = typeof experiences.$inferInsert;
export type ExperienceImage = typeof experienceImages.$inferSelect;
export type NewExperienceImage = typeof experienceImages.$inferInsert;
export type AssetExperience = typeof assetExperiences.$inferSelect;
export type NewAssetExperience = typeof assetExperiences.$inferInsert;
export type BrokerLog = typeof brokerLogs.$inferSelect;
export type NewBrokerLog = typeof brokerLogs.$inferInsert;
export type EventLog = typeof eventLogs.$inferSelect;
export type NewEventLog = typeof eventLogs.$inferInsert;
export type ExperienceBooking = typeof experienceBookings.$inferSelect;
export type NewExperienceBooking = typeof experienceBookings.$inferInsert;
export type CityTaxDefault = typeof cityTaxDefaults.$inferSelect;
export type NewCityTaxDefault = typeof cityTaxDefaults.$inferInsert;
