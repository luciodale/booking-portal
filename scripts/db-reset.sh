#!/bin/bash
set -e

# Drops all D1 tables, regenerates a single migration from the Drizzle schema, and applies it.
# Usage: ./scripts/db-reset.sh <local|remote>

DB_NAME="booking-portal-db"

if [[ "$1" == "remote" ]]; then
  FLAGS="--remote"
  TARGET="REMOTE"
elif [[ "$1" == "local" ]]; then
  FLAGS="--local"
  TARGET="LOCAL"
else
  echo "Usage: ./scripts/db-reset.sh <local|remote>"
  exit 1
fi

if [[ "$TARGET" == "REMOTE" ]]; then
  cat <<EOF
=====================================================================
DANGER: about to wipe and rebuild the REMOTE D1 database "$DB_NAME".
This destroys every row in every table and reapplies migrations from
the local Drizzle schema. There is no automatic backup.

To proceed, type the word DESTROY (uppercase) and press enter.
Anything else aborts.
=====================================================================
EOF
  read -r CONFIRM
  if [[ "$CONFIRM" != "DESTROY" ]]; then
    echo "Aborted."
    exit 1
  fi
fi

echo "Resetting $TARGET database..."

echo "Dropping all tables..."
npx wrangler d1 execute "$DB_NAME" $FLAGS --command "
PRAGMA foreign_keys=OFF;
DROP TABLE IF EXISTS broker_fee_overrides;
DROP TABLE IF EXISTS platform_settings;
DROP TABLE IF EXISTS city_tax_defaults;
DROP TABLE IF EXISTS experience_bookings;
DROP TABLE IF EXISTS asset_experiences;
DROP TABLE IF EXISTS experience_images;
DROP TABLE IF EXISTS experiences;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS event_logs;
DROP TABLE IF EXISTS broker_logs;
DROP TABLE IF EXISTS images;
DROP TABLE IF EXISTS assets;
DROP TABLE IF EXISTS pms_integrations;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS d1_migrations;
PRAGMA foreign_keys=ON;
"

echo "Regenerating migration..."
rm -rf drizzle/migrations/*
bunx drizzle-kit generate --name init

echo "Applying migration..."
npx wrangler d1 migrations apply "$DB_NAME" $FLAGS

echo "Done!"
