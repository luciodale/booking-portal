CREATE UNIQUE INDEX `idx_bookings_stripe_session` ON `bookings` (`stripe_session_id`);--> statement-breakpoint
CREATE INDEX `idx_bookings_stripe_pi` ON `bookings` (`stripe_payment_intent_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_exp_bookings_stripe_session` ON `experience_bookings` (`stripe_session_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_users_email` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_users_stripe_account` ON `users` (`stripe_connected_account_id`);