# Booking Portal

Astro SSR application deployed on Cloudflare Workers. Handles property/experience bookings with Stripe payments, Smoobu PMS integration, and Clerk authentication.

## Prerequisites

| Tool | Install |
|------|---------|
| [Bun](https://bun.sh) | `curl -fsSL https://bun.sh/install \| bash` |
| [Wrangler](https://developers.cloudflare.com/workers/wrangler/) | Included as devDependency |
| [Stripe CLI](https://stripe.com/docs/stripe-cli) | `brew install stripe/stripe-cli/stripe` |

Authenticate the Stripe CLI once:

```bash
stripe login
```

## Environment Variables

Copy the example file and fill in your credentials:

```bash
cp .dev.vars.example .dev.vars
```

Required variables in `.dev.vars`:

```
PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_JWT_KEY=...
CLERK_WEBHOOK_SECRET=whsec_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

The `STRIPE_WEBHOOK_SECRET` must match the signing secret printed by `stripe listen`. On first run, copy the `whsec_...` value from the Stripe CLI output into `.dev.vars`.

Additionally, create a `.env` file (or update the existing one) with public keys:

```
PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
```

## Database Setup

The project uses Cloudflare D1 (SQLite) via Drizzle ORM. Migrations live in `drizzle/migrations/`.

```bash
# Apply migrations to local D1
bun run db:migrate:local

# Seed local database and R2 bucket
bun run db:seed-all:local

# Or do a full reset (teardown + migrate + seed)
bun run db:reset-all:local
```

## Running Locally

```bash
bun install
bun run dev
```

This starts three processes concurrently:

| Process | Port | Purpose |
|---------|------|---------|
| Astro dev server | `localhost:4321` | Application |
| Mock Smoobu API | `localhost:4200` | Simulates PMS (rates, availability, reservations) |
| Stripe CLI listener | &mdash; | Forwards Stripe webhooks to `localhost:4321/api/stripe-webhook` |

Stripe runs against the **test/sandbox** environment. Use [Stripe test cards](https://docs.stripe.com/testing#cards) (e.g. `4242 4242 4242 4242`) for payments.

Smoobu is fully mocked locally via `scripts/mock-smoobu.ts` (9 pre-configured apartments, 150 EUR/night, 3-night minimum).

### Clerk Webhooks (local)

Clerk webhooks (e.g. `user.created`) don't reach `localhost` by default. To receive them locally:

1. Start a tunnel: `cloudflared tunnel --url http://localhost:4321`
2. In the Clerk Dashboard, create a **second** webhook endpoint (don't touch production):
   - URL: `https://<subdomain>.trycloudflare.com/api/clerk-webhook`
   - Events: `user.created`
3. Copy the new endpoint's signing secret into `.dev.vars` as `CLERK_WEBHOOK_SECRET`
4. Restart `bun run dev`

The `trycloudflare.com` URL changes each session — update the Clerk webhook URL accordingly.

## Scripts

### Development

| Command | Description |
|---------|-------------|
| `bun run dev` | Start all dev services |
| `bun run preview` | Build + preview with Wrangler (production-like) |
| `bun run mock:smoobu` | Start mock Smoobu server standalone |

### Database

| Command | Description |
|---------|-------------|
| `bun run db:migrate:local` | Apply migrations locally |
| `bun run db:migrate:remote` | Apply migrations to production |
| `bun run db:seed-all:local` | Seed D1 + R2 locally |
| `bun run db:reset-all:local` | Full reset: teardown + migrate + seed |
| `bun run db:generate -- <name>` | Generate a new migration |
| `bun run db:studio` | Open Drizzle Studio |

### Quality

| Command | Description |
|---------|-------------|
| `bun run type-check` | TypeScript validation |
| `bun run lint` | Biome linter |
| `bun run lint:fix` | Auto-fix lint issues |
| `bun run format` | Format code |
| `bun run test` | Unit tests |
| `bun run test:watch` | Unit tests in watch mode |

### Build & Deploy

| Command | Description |
|---------|-------------|
| `bun run build` | Type check + test + Astro build |
| `bun run deploy` | Deploy to Cloudflare Workers |

## Project Structure

```
src/
  db/              Schema (Drizzle) and helpers
  features/        Feature modules
    admin/           Platform settings
    broker/          Broker dashboard (connect, PMS, properties)
    public/          Public-facing (browse, booking, reviews)
  modules/         Shared (auth, images, logging, UI)
  pages/           Astro routes and API endpoints
  layouts/         Layout components
  i18n/            Internationalization (EN, IT)

scripts/           Mock servers, seed/teardown scripts
drizzle/           SQL migration files
```

## Stripe Connect

Brokers onboard via Stripe-hosted Connect onboarding (Account Links). The checkout flow uses destination charges with a configurable platform application fee (`platform_settings.application_fee_percent`).

To test Connect end-to-end:
1. Complete the Connect onboarding in the backoffice (`/backoffice/connect`)
2. Use Stripe test identity data (SSN `000-00-0000`, bank account `000123456789`, routing `110000000`)
3. Once onboarding is complete, property bookings will route payments to the connected account
