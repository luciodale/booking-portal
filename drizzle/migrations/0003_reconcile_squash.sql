-- Forward fix to reconcile remote D1 with src/db/schema.ts after the local
-- squash in 49ed7a4. Only additive, idempotent statements. Remote retains all
-- data from prior 0000 + 0001 + 0002 application.
-- Net new index introduced after 0002:
CREATE INDEX IF NOT EXISTS `idx_bookings_overlap` ON `bookings` (`asset_id`,`status`,`check_in`,`check_out`);
