# Operations runbook

Owner: backend on call. Last reviewed: 2026-05-10.

## Environments

- Local dev: `.dev.vars` consumed by `bun run dev` and `bunx wrangler dev`.
- Remote staging / prod: secrets via `wrangler secret put`.

Public client variables (consumed by the bundle) live in `.env`. Prefix with
`PUBLIC_`. Everything else must be a secret, never committed.

Required secrets:

```
wrangler secret put CLERK_SECRET_KEY
wrangler secret put CLERK_JWT_KEY
wrangler secret put CLERK_WEBHOOK_SECRET
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put STRIPE_WEBHOOK_SECRET
```

Optional:

```
wrangler secret put PUBLIC_R2_BASE_URL  # if not using the r2.dev fallback
```

## Deploy

`bun run deploy` runs `wrangler deploy` against the worker described by
`wrangler.json`. CI runs `bun run check + type-check + bun test + astro build`
on every PR; do not bypass it.

Recommended manual deploy sequence:

1. Merge to main.
2. Wait for green CI.
3. From local: `bun install --frozen-lockfile && bun run build && bun run deploy`.
4. Tag the release: `git tag -a vYYYYMMDD.N -m "..."`.

## Rollback

Worker level: redeploy a known good commit.

```
git checkout <good-sha>
bun install --frozen-lockfile
bun run build
bun run deploy
```

D1 schema rollback: Drizzle has no down migrations. If a migration was
destructive, restore from PITR or a manual export and re-replay good
migrations.

## Migrations

Source of truth lives in `src/db/schema.ts`. Drizzle generates SQL into
`drizzle/migrations/`. Apply via:

```
bun run db:migrate:local
bun run db:migrate:remote
```

### Local D1 catch up after the 2026-05 squash

A previous commit squashed migrations 0001 and 0002 into 0000. Migrations 0003
and 0004 add the remaining delta plus the CHECK triggers, so a fresh remote
D1 with 0000 + 0001 + 0002 already applied will pick them up cleanly.

If your **local** D1 already has the squashed 0000 (so the cin column and the
new indexes are present but `d1_migrations` only lists `0000_init.sql`),
re-running the migration apply step will fail on `duplicate column name: cin`.
Fix once with:

```
bunx wrangler d1 execute booking-portal-db --local --command "INSERT INTO d1_migrations (name, applied_at) VALUES ('0001_add-cin-rename-tier.sql', CURRENT_TIMESTAMP), ('0002_add-unique-indexes.sql', CURRENT_TIMESTAMP);"
bun run db:migrate:local
```

After that the wrangler journal matches reality and 0003 + 0004 apply.

Rules:

- Never edit a migration after it has been applied anywhere.
- Always write additive, idempotent SQL where possible. Use triggers for
  CHECK like constraints (see `0004_check_triggers.sql`) so existing data
  is not rebuilt.
- Squashing applied history breaks `d1_migrations`. If a squash happened by
  accident, write a forward fix (e.g. `0003_reconcile_squash.sql`) and never
  reset.

## D1 backups

D1 supports time travel restore from any point in the last 30 days on paid
plans. Verify the project is on a plan that includes this.

To trigger a manual export:

```
wrangler d1 export booking-portal-db --remote --output backup-$(date +%F).sql
```

Schedule a CI job (TODO) to run this nightly and upload the resulting SQL to
R2 with a retention rule.

Restore drill (run quarterly):

1. Spin up a scratch D1: `wrangler d1 create booking-portal-restore-test`.
2. Replay last nightly export against it.
3. Verify table counts and `SELECT COUNT(*) FROM bookings WHERE status='confirmed'` matches expectations.
4. Tear down.

## Stripe webhook saga

Bookings now transition `pending_pms` -> `confirmed` only after Smoobu has
acknowledged the reservation. A row left in `pending_pms` for more than a
few minutes means the Smoobu sync is stuck.

Recovery options for a stuck row:

- If Smoobu is recovering and Stripe is still retrying, do nothing; the
  next retry will sync.
- If Stripe has given up, an operator can manually call
  `createSmoobuBooking` from a one off script with the metadata captured
  in the `bookings` row, then flip the status. A first class resync
  endpoint is a TODO.

## Cancellation order

Smoobu first, then Stripe refund, then DB status flip. Any failure stops
the chain. A failure between Smoobu cancel and Stripe refund leaves the
booking in `cancelled` status without refund and needs an operator. The
endpoint returns 502 in that case.

## Incident checklist

When alerts fire:

1. Check Cloudflare Workers logs (observability sampled at 25%).
2. Pull recent `event_logs` rows with `level='error'` for the affected
   `source`. Each row carries a `correlationId` matching the JSON log line.
3. If Stripe or Smoobu is down, treat retries as the recovery mechanism.
4. If D1 corruption is suspected, snapshot first (`wrangler d1 export`)
   before any destructive change.

## Rate limits

Default thresholds (defined in `wrangler.json` under `unsafe.bindings`):

- `RL_PUBLIC`: 60 req/min/key — public reads.
- `RL_SMOOBU`: 30 req/min/key — Smoobu proxy.
- `RL_CHECKOUT`: 5 req/min/key — POST /api/checkout.
- `RL_UPLOAD`: 20 per 5min/key — backoffice image uploads.

Key is the authenticated user id when available, otherwise the
`CF-Connecting-IP` header. Webhooks are signed and not rate limited.

Tuning: edit the `limit` and `period` in `wrangler.json` and redeploy.
