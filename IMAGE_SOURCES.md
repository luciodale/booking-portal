# Image Sources - Single Source of Truth

## 📁 Source Directories (NEVER DELETE!)

### Properties
```
properties/
├── mallorca/     # 18 images
├── chalet/       # 9 images
└── barcelona/    # 3 images
```

### Experiences
```
experiences/
├── exp-1/main.webp
├── exp-2/main.webp
├── exp-3/main.webp
├── exp-4/main.webp
├── exp-5/main.webp
└── exp-6/main.webp
```

## 🔄 How Images Flow

1. **Source**: `properties/` and `experiences/` folders (your only source of truth)
2. **Seed Data**: `seeds/data.ts` references these paths
3. **Manifest**: `scripts/collect-images.ts` generates `.image-manifest.json`
4. **Upload**: `scripts/r2-seed-local.ts` or `scripts/r2-seed-remote.ts` uploads to R2
5. **Serve**: Images served from R2 bucket (dev: `/api/images`, prod: R2 public URL)

## ✅ Safe to Delete (Temporary Files)

These are generated during seeding and can be safely deleted:

- `.seed.sql` - Generated SQL for database seeding
- `.image-manifest.json` - Temporary image inventory
- `.check-data.sql` - Database check queries
- `.remote-teardown.sql` - Cleanup SQL statements
- `.wrangler/` - Local dev database/storage (regenerated on demand)

## 🚫 What Scripts Never Touch

All scripts are safe - they **never delete** source images:

- `all-teardown-local.ts` - Only deletes `.wrangler/` directory
- `r2-teardown-remote.ts` - Only deletes R2 objects (remote storage)
- `d1-teardown-remote.ts` - Only deletes database rows
- All other scripts - Only read from source directories

## 📝 Adding New Images

1. Add image files to `properties/{property-name}/` or `experiences/{exp-id}/`
2. Update `seeds/data.ts` to reference the new images
3. Run `bun run db:reset-all:local` to regenerate everything

## 🔍 Image Serving

**Development:**
- R2 proxy: `http://localhost:4321/api/images/{r2Key}`
- Example: `/api/images/properties/mallorca/main.webp`

**Production:**
- Direct R2: `https://pub-9d13f1d66a7642979229f65d101a51c6.r2.dev/{r2Key}`
- Example: `https://pub-9d13f1d66a7642979229f65d101a51c6.r2.dev/properties/mallorca/main.webp`

## 📊 Current Inventory

- **Property Images**: 30 files
- **Experience Images**: 6 files
- **Total**: 36 images (~4.6MB)

