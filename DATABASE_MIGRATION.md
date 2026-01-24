# Database Migration Guide

## Schema Changes

The Elite Property Management backoffice introduces two new fields to the `assets` table:

1. **`pdfAssetPath`** - Text field for storing relative paths to static PDF files (e.g., `/flyers/property-name.pdf`)
2. **`layout`** - JSON field for storing elite-specific layout details (floors, special rooms, outdoor features)

These changes are already in [`src/db/schema.ts`](file:///Users/luciodale/ghq/github.com/luciodale/booking-portal/src/db/schema.ts).

## Generating Migration

To generate a Drizzle migration for these schema changes:

```bash
bun run db:generate add_elite_property_fields
```

This will:
- Analyze the schema changes
- Generate SQL migration file in `drizzle/` directory
- Create both the migration SQL and metadata

## Applying Migration

### Local Database (Development)

```bash
bun run db:migrate:local
```

This applies all pending migrations to your local D1 database.

### Remote Database (Production)

```bash
bun run db:migrate:remote
```

**⚠️ Important:** Test migrations locally first before applying to production.

## Verification

After applying the migration, verify the changes:

1. **Open Drizzle Studio:**
   ```bash
   bun run db:studio
   ```

2. **Check the `assets` table** - should show:
   - `pdf_asset_path` column (text, nullable)
   - `layout` column (text, nullable, stores JSON)

3. **Test in the app** - create a new elite property and verify:
   - PDF path can be saved
   - Layout details can be stored

## Rollback (if needed)

If you need to rollback the migration:

1. Delete the most recent migration file from `drizzle/` directory
2. Run migrations again to restore previous state
3. Or manually write a down migration

## Notes

- The new fields are **nullable** by default (won't break existing data)
- Existing properties will have `null` for these fields
- Mock data has been updated to include these fields
- No data migration needed (fields start as null)
