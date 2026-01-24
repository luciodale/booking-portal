# Testing Guide

## Overview

Testing infrastructure is set up with:
- **Vitest** for Worker API tests
- **Playwright** for UI end-to-end tests

## Running Tests

```bash
# Run all tests
bun test

# Run only Worker API tests
bun test:worker

# Run only UI tests
bun test:ui

# Run UI tests in headed mode (see browser)
bun test:ui:headed

# Debug UI tests
bun test:ui:debug
```

## Test Structure

### Worker API Tests (`vitest`)

Located in: `src/pages/api/backoffice/__tests__/`

Tests use Cloudflare's Vitest integration with D1 and R2 bindings.

**Current Status:** Placeholder tests are in place. Full implementation requires:
1. Mocking Astro's APIContext
2. Setting up test D1 database
3. Configuring R2 test bucket

### UI Tests (`playwright`)

Located in: `tests/`

Tests cover:
- Property list page navigation
- Property creation form
- Property editing
- Pricing calendar interactions (skipped until test data setup)

**Current Status:** Basic UI flow tests are working. Calendar tests are skipped until proper test data seeding.

## Test Data Setup

To enable all tests:

1. **Create test database migration**
   ```bash
   bun run db:migrate:local
   ```

2. **Seed test data** (TODO: create seed script)
   - Add sample properties
   - Add sample pricing rules
   - Add sample images

3. **Update skipped tests**
   - Remove `.skip()` from calendar tests
   - Update test IDs to match seeded data

## Notes

- UI tests automatically start the dev server
- Worker tests use local D1 database
- Some tests are intentionally skipped pending test data setup
- Tests serve as documentation of expected functionality
