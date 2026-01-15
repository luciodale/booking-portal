import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Assets table - core entity supporting apartments, boats, tours
export const assets = sqliteTable('assets', {
  id: text('id').primaryKey(),
  brokerId: text('broker_id')
    .notNull()
    .references(() => brokers.id),
  type: text('type')
    .$type<'apartment' | 'boat' | 'tour'>()
    .notNull()
    .default('apartment'),
  tier: text('tier')
    .$type<'elite' | 'standard'>()
    .notNull()
    .default('standard'),
  title: text('title').notNull(),
  description: text('description'),
  location: text('location').notNull(),
  basePrice: integer('base_price').notNull(), // Price in cents
  currency: text('currency').notNull().default('usd'),
  instantBook: integer('instant_book', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Brokers table
export const brokers = sqliteTable('brokers', {
  id: text('id').primaryKey(),
  clerkUserId: text('clerk_user_id').notNull().unique(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  whatsappNumber: text('whatsapp_number'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Pricing Rules table - replaces external tools like Smoobu
export const pricingRules = sqliteTable('pricing_rules', {
  id: text('id').primaryKey(),
  assetId: text('asset_id')
    .notNull()
    .references(() => assets.id),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  multiplier: integer('multiplier').notNull().default(100), // Stored as percentage (100 = 1x, 150 = 1.5x)
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Bookings table
export const bookings = sqliteTable('bookings', {
  id: text('id').primaryKey(),
  assetId: text('asset_id')
    .notNull()
    .references(() => assets.id),
  userId: text('user_id').notNull(), // Clerk user ID
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  totalPrice: integer('total_price').notNull(), // Price in cents
  currency: text('currency').notNull().default('usd'),
  status: text('status')
    .$type<'pending' | 'confirmed' | 'cancelled'>()
    .notNull()
    .default('pending'),
  stripeSessionId: text('stripe_session_id'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Indexes
export const assetsBrokerIdx = index('idx_assets_broker').on(assets.brokerId);
export const assetsTypeIdx = index('idx_assets_type').on(assets.type);
export const assetsTierIdx = index('idx_assets_tier').on(assets.tier);
export const pricingRulesAssetIdx = index('idx_pricing_rules_asset').on(
  pricingRules.assetId
);
export const bookingsAssetIdx = index('idx_bookings_asset').on(bookings.assetId);
export const bookingsUserIdx = index('idx_bookings_user').on(bookings.userId);
export const bookingsStatusIdx = index('idx_bookings_status').on(bookings.status);

// Type exports
export type Asset = typeof assets.$inferSelect;
export type NewAsset = typeof assets.$inferInsert;
export type Broker = typeof brokers.$inferSelect;
export type NewBroker = typeof brokers.$inferInsert;
export type PricingRule = typeof pricingRules.$inferSelect;
export type NewPricingRule = typeof pricingRules.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;

