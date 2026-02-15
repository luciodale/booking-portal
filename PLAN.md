# Implementation Plan

## Overview

Three workstreams:
1. **`instantBook` flag controls calendar + pricing visibility** (properties & experiences)
2. **Drop `favorites` table** (unused)
3. **Parallelize R2 seed uploads + add more seed data**

---

## 1. Schema Changes

### 1a. Add `instantBook` to `experiences` table
- **File:** `src/db/schema.ts`
- Add `instantBook: integer("instant_book", { mode: "boolean" }).notNull().default(false)` to `experiences` table
- Update `NewExperience` / `Experience` types (auto-inferred, nothing to do)

### 1b. Drop `favorites` table
- **File:** `src/db/schema.ts`
- Remove the entire `favorites` table definition + its type exports (`Favorite`, `NewFavorite`)
- Remove the heart/favorite button markup from `PropertyCard.astro`

### 1c. New Drizzle migration
- Run `bunx drizzle-kit generate` to produce a migration that:
  - Adds `instant_book` column to `experiences`
  - Drops `favorites` table

---

## 2. Frontend: `instantBook` === false → Hide Calendar & Pricing, Show "Contact Property"

### 2a. Property detail pages (`src/pages/property/[id].astro`, `src/pages/elite/[id].astro`)
- Pass `instantBook` boolean to `<BookingWidget>`

### 2b. `BookingWidget.tsx`
- Accept new prop `instantBook: boolean`
- When `instantBook === false`: render a "Contact property for availability and pricing" card with a WhatsApp / inquiry CTA (reuse existing "Contact Host" button, make it link to the broker's WhatsApp)
- When `instantBook === true`: render calendar + pricing + booking form (current behavior)
- Remove the old `!smoobuPropertyId` fallback (it conflated PMS integration with booking mode)

### 2c. Experience detail page (`src/pages/experiences/[id].astro`)
- Add a booking/contact sidebar or section:
  - If `instantBook === true`: show date picker + "Book Now" CTA (new — currently no booking on experiences)
  - If `instantBook === false`: show "Contact for availability" CTA
- **Note:** Experience booking checkout is a *new flow* — needs a separate endpoint or extension of the existing checkout. For now, we can start with the UI and wire up the checkout in a follow-up, unless you want the full checkout wired in this pass.

### 2d. `PropertyCard.astro`
- Remove favorite (heart) button entirely
- Optionally show a small "Instant Book" badge when `instantBook === true`

---

## 3. Seed Data: More Properties + More Experiences

### 3a. Expand `seeds/data.ts`
- Add **5–7 more properties** (mix of elite/standard, mix of `instantBook: true/false`) reusing existing images across properties (same R2 keys, different asset IDs) to avoid needing new image files
- Add **4–6 more experiences** with `instantBook` flag set (mix of true/false)
- Add `instantBook` field to `SeedExperience` type

### 3b. Update `generate-sql.ts`
- Include `instant_book` in the experience INSERT statement

### 3c. Update `collect-images.ts` (if needed)
- Ensure new property image entries generate correct manifest entries

---

## 4. Parallelize R2 Remote Uploads

### File: `scripts/_helpers/r2.ts`

**Current problem:** `seedImages()` uses a sequential `for` loop. Each image spawns `bunx wrangler r2 object put` synchronously via `Bun.spawnSync`. With 36+ images, this takes minutes.

**Fix:** Replace `Bun.spawnSync` with `Bun.spawn` (async) and process images in batches of 5 concurrently.

```
seedImages():
  - chunk allImages into batches of MAX_CONCURRENCY (change from 3 → 5)
  - for each batch: Promise.all(batch.map(processImageAsync))
  - processImageAsync: same as processImage but uses Bun.spawn instead of Bun.spawnSync
  - uploadToR2Async: write temp file, spawn wrangler async, await exit, cleanup
```

This gives ~5x speedup without overwhelming R2 or wrangler CLI.

---

## Execution Order

1. Schema changes (1a, 1b) + migration (1c)
2. Seed data expansion (3a, 3b, 3c)
3. R2 parallelization (4)
4. Frontend changes (2a–2d)

---

## Unresolved Questions

- **Experience booking checkout:** wire up a full Stripe checkout for experiences in this pass, or just the UI with "coming soon" / contact CTA?
- **WhatsApp link for "Contact Host":** use the broker's `whatsappNumber` from the `users` table? Need to pass it through to the widget.
- **New seed images:** reuse existing property images (same R2 keys, zero new uploads) for the new properties, or do you want unique placeholder images?
