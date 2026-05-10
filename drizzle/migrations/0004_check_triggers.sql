-- Enforce enum and bounded value invariants via BEFORE INSERT/UPDATE triggers.
-- Triggers avoid the SQLite table rebuild that ALTER TABLE ... CHECK would
-- otherwise require, so this migration is safe on tables with data.

-- assets.tier
CREATE TRIGGER IF NOT EXISTS chk_assets_tier_ins
BEFORE INSERT ON `assets`
WHEN NEW.`tier` NOT IN ('elite', 'premium')
BEGIN
  SELECT RAISE(ABORT, 'invalid tier');
END;
--> statement-breakpoint
CREATE TRIGGER IF NOT EXISTS chk_assets_tier_upd
BEFORE UPDATE OF `tier` ON `assets`
WHEN NEW.`tier` NOT IN ('elite', 'premium')
BEGIN
  SELECT RAISE(ABORT, 'invalid tier');
END;
--> statement-breakpoint

-- assets.status
CREATE TRIGGER IF NOT EXISTS chk_assets_status_ins
BEFORE INSERT ON `assets`
WHEN NEW.`status` NOT IN ('draft', 'published', 'archived')
BEGIN
  SELECT RAISE(ABORT, 'invalid asset status');
END;
--> statement-breakpoint
CREATE TRIGGER IF NOT EXISTS chk_assets_status_upd
BEFORE UPDATE OF `status` ON `assets`
WHEN NEW.`status` NOT IN ('draft', 'published', 'archived')
BEGIN
  SELECT RAISE(ABORT, 'invalid asset status');
END;
--> statement-breakpoint

-- bookings.status (includes pending_pms post payment, pre Smoobu sync)
CREATE TRIGGER IF NOT EXISTS chk_bookings_status_ins
BEFORE INSERT ON `bookings`
WHEN NEW.`status` NOT IN ('pending', 'pending_pms', 'confirmed', 'cancelled', 'completed')
BEGIN
  SELECT RAISE(ABORT, 'invalid booking status');
END;
--> statement-breakpoint
CREATE TRIGGER IF NOT EXISTS chk_bookings_status_upd
BEFORE UPDATE OF `status` ON `bookings`
WHEN NEW.`status` NOT IN ('pending', 'pending_pms', 'confirmed', 'cancelled', 'completed')
BEGIN
  SELECT RAISE(ABORT, 'invalid booking status');
END;
--> statement-breakpoint

-- bookings.currency (EUR only for now)
CREATE TRIGGER IF NOT EXISTS chk_bookings_currency_ins
BEFORE INSERT ON `bookings`
WHEN NEW.`currency` NOT IN ('eur')
BEGIN
  SELECT RAISE(ABORT, 'invalid currency');
END;
--> statement-breakpoint
CREATE TRIGGER IF NOT EXISTS chk_bookings_currency_upd
BEFORE UPDATE OF `currency` ON `bookings`
WHEN NEW.`currency` NOT IN ('eur')
BEGIN
  SELECT RAISE(ABORT, 'invalid currency');
END;
--> statement-breakpoint

-- experience_bookings.status
CREATE TRIGGER IF NOT EXISTS chk_exp_bookings_status_ins
BEFORE INSERT ON `experience_bookings`
WHEN NEW.`status` NOT IN ('pending', 'confirmed', 'cancelled', 'completed')
BEGIN
  SELECT RAISE(ABORT, 'invalid experience booking status');
END;
--> statement-breakpoint
CREATE TRIGGER IF NOT EXISTS chk_exp_bookings_status_upd
BEFORE UPDATE OF `status` ON `experience_bookings`
WHEN NEW.`status` NOT IN ('pending', 'confirmed', 'cancelled', 'completed')
BEGIN
  SELECT RAISE(ABORT, 'invalid experience booking status');
END;
--> statement-breakpoint

-- experiences.status
CREATE TRIGGER IF NOT EXISTS chk_experiences_status_ins
BEFORE INSERT ON `experiences`
WHEN NEW.`status` NOT IN ('draft', 'published', 'archived')
BEGIN
  SELECT RAISE(ABORT, 'invalid experience status');
END;
--> statement-breakpoint
CREATE TRIGGER IF NOT EXISTS chk_experiences_status_upd
BEFORE UPDATE OF `status` ON `experiences`
WHEN NEW.`status` NOT IN ('draft', 'published', 'archived')
BEGIN
  SELECT RAISE(ABORT, 'invalid experience status');
END;
--> statement-breakpoint

-- reviews.status + rating range
CREATE TRIGGER IF NOT EXISTS chk_reviews_status_ins
BEFORE INSERT ON `reviews`
WHEN NEW.`status` NOT IN ('pending', 'published', 'hidden')
   OR NEW.`rating` < 1 OR NEW.`rating` > 5
BEGIN
  SELECT RAISE(ABORT, 'invalid review');
END;
--> statement-breakpoint
CREATE TRIGGER IF NOT EXISTS chk_reviews_status_upd
BEFORE UPDATE OF `status`, `rating` ON `reviews`
WHEN NEW.`status` NOT IN ('pending', 'published', 'hidden')
   OR NEW.`rating` < 1 OR NEW.`rating` > 5
BEGIN
  SELECT RAISE(ABORT, 'invalid review');
END;
--> statement-breakpoint

-- event_logs.level
CREATE TRIGGER IF NOT EXISTS chk_event_logs_level_ins
BEFORE INSERT ON `event_logs`
WHEN NEW.`level` NOT IN ('info', 'warning', 'error')
BEGIN
  SELECT RAISE(ABORT, 'invalid event log level');
END;
--> statement-breakpoint

-- broker_fee_overrides.fee_percent range
CREATE TRIGGER IF NOT EXISTS chk_broker_fee_range_ins
BEFORE INSERT ON `broker_fee_overrides`
WHEN NEW.`fee_percent` < 0 OR NEW.`fee_percent` > 100
BEGIN
  SELECT RAISE(ABORT, 'fee_percent out of range');
END;
--> statement-breakpoint
CREATE TRIGGER IF NOT EXISTS chk_broker_fee_range_upd
BEFORE UPDATE OF `fee_percent` ON `broker_fee_overrides`
WHEN NEW.`fee_percent` < 0 OR NEW.`fee_percent` > 100
BEGIN
  SELECT RAISE(ABORT, 'fee_percent out of range');
END;
