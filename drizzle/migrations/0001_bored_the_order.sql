CREATE TABLE `experience_bookings` (
	`id` text PRIMARY KEY NOT NULL,
	`experience_id` text NOT NULL,
	`user_id` text NOT NULL,
	`booking_date` text NOT NULL,
	`participants` integer NOT NULL,
	`total_price` integer NOT NULL,
	`currency` text DEFAULT 'eur' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`stripe_session_id` text,
	`stripe_payment_intent_id` text,
	`paid_at` text,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`guest_note` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`experience_id`) REFERENCES `experiences`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_exp_bookings_experience` ON `experience_bookings` (`experience_id`);--> statement-breakpoint
CREATE INDEX `idx_exp_bookings_user` ON `experience_bookings` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_exp_bookings_status` ON `experience_bookings` (`status`);--> statement-breakpoint
DROP TABLE `favorites`;--> statement-breakpoint
ALTER TABLE `experiences` ADD `instant_book` integer DEFAULT false NOT NULL;