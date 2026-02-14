#!/usr/bin/env bun
/**
 * Generate SQL Script
 * Generates SQL statements from seed data for D1 database
 */

import { join } from "node:path";
import {
  type SeedAsset,
  type SeedBroker,
  type SeedExperience,
  type SeedImage,
  assets,
  brokers,
  experiences,
  images,
} from "../seeds/data";

const ROOT_DIR = join(import.meta.dir, "..");

function escapeString(str: string | null): string {
  if (str === null) return "NULL";
  return `'${str.replace(/'/g, "''")}'`;
}

function boolToInt(val: boolean): number {
  return val ? 1 : 0;
}

function jsonArray(arr: string[]): string {
  return escapeString(JSON.stringify(arr));
}

function generateBrokerInsert(broker: SeedBroker): string {
  return `INSERT INTO brokers (id, clerk_user_id, name, email, whatsapp_number, bio, avatar_url, verified)
VALUES (${escapeString(broker.id)}, ${escapeString(broker.clerkUserId)}, ${escapeString(broker.name)}, ${escapeString(broker.email)}, ${escapeString(broker.whatsappNumber)}, ${escapeString(broker.bio)}, ${escapeString(broker.avatarUrl)}, ${boolToInt(broker.verified)});`;
}

function generateAssetInsert(asset: SeedAsset): string {
  return `INSERT INTO assets (id, broker_id, tier, status, title, description, short_description, location, street, zip, city, country, latitude, longitude, max_occupancy, bedrooms, bathrooms, sq_meters, amenities, views, highlights, video_url, pdf_asset_path, instant_book, featured, sort_order)
VALUES (${escapeString(asset.id)}, ${escapeString(asset.brokerId)}, ${escapeString(asset.tier)}, ${escapeString(asset.status)}, ${escapeString(asset.title)}, ${escapeString(asset.description)}, ${escapeString(asset.shortDescription)}, ${escapeString(asset.location)}, ${escapeString(asset.street)}, ${escapeString(asset.zip)}, ${escapeString(asset.city)}, ${escapeString(asset.country)}, ${escapeString(asset.latitude)}, ${escapeString(asset.longitude)}, ${asset.maxOccupancy}, ${asset.bedrooms}, ${asset.bathrooms}, ${asset.sqMeters}, ${jsonArray(asset.amenities)}, ${jsonArray(asset.views)}, ${jsonArray(asset.highlights)}, ${escapeString(asset.videoUrl)}, ${escapeString(asset.pdfAssetPath)}, ${boolToInt(asset.instantBook)}, ${boolToInt(asset.featured)}, ${asset.sortOrder});`;
}

function generateImageInsert(image: SeedImage): string {
  return `INSERT INTO images (id, asset_id, r2_key, alt, is_primary, "order")
VALUES (${escapeString(image.id)}, ${escapeString(image.assetId)}, ${escapeString(image.r2Key)}, ${escapeString(image.alt)}, ${boolToInt(image.isPrimary)}, ${image.order});`;
}

function generateExperienceInsert(exp: SeedExperience): string {
  return `INSERT INTO experiences (id, broker_id, title, description, short_description, location, city, country, category, duration, max_participants, base_price, currency, image_url, status, featured)
VALUES (${escapeString(exp.id)}, ${escapeString(exp.brokerId)}, ${escapeString(exp.title)}, ${escapeString(exp.description)}, ${escapeString(exp.shortDescription)}, ${escapeString(exp.location)}, ${escapeString(exp.city)}, ${escapeString(exp.country)}, ${escapeString(exp.category)}, ${escapeString(exp.duration)}, ${exp.maxParticipants}, ${exp.basePrice}, ${escapeString(exp.currency)}, ${escapeString(exp.imageUrl)}, ${escapeString(exp.status)}, ${boolToInt(exp.featured)});`;
}

function generateDeleteStatements(): string {
  // Only delete from tables we seed (children first)
  // Other tables (reviews, favorites, bookings, etc.) are not seeded
  return `-- Clean existing data
DELETE FROM images;
DELETE FROM experiences;
DELETE FROM assets;
DELETE FROM brokers;
`;
}

function generateSQL(): string {
  const lines: string[] = [];

  lines.push("-- Seed Data SQL");
  lines.push(`-- Generated at: ${new Date().toISOString()}`);
  lines.push("");

  // Delete existing data
  lines.push(generateDeleteStatements());
  lines.push("");

  // Insert brokers
  lines.push("-- Brokers");
  for (const broker of brokers) {
    lines.push(generateBrokerInsert(broker));
  }
  lines.push("");

  // Insert assets
  lines.push("-- Assets");
  for (const asset of assets) {
    lines.push(generateAssetInsert(asset));
  }
  lines.push("");

  // Insert images
  lines.push("-- Images");
  for (const image of images) {
    lines.push(generateImageInsert(image));
  }
  lines.push("");

  // Insert experiences
  lines.push("-- Experiences");
  for (const exp of experiences) {
    lines.push(generateExperienceInsert(exp));
  }

  return lines.join("\n");
}

async function main() {
  console.log("🔧 Generating SQL from seed data...\n");

  const sql = generateSQL();
  const outputPath = join(ROOT_DIR, ".seed.sql");

  await Bun.write(outputPath, sql);

  console.log("📊 Generated:");
  console.log(`  Brokers: ${brokers.length}`);
  console.log(`  Assets: ${assets.length}`);
  console.log(`  Images: ${images.length}`);
  console.log(`  Experiences: ${experiences.length}`);
  console.log("\n✅ SQL written to .seed.sql");

  // Also output to stdout for piping
  if (process.argv.includes("--stdout")) {
    console.log("\n--- SQL Output ---\n");
    console.log(sql);
  }
}

main().catch(console.error);
