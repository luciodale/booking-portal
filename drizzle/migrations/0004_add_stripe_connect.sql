ALTER TABLE `users` ADD `stripe_connected_account_id` text;
--> statement-breakpoint
CREATE TABLE `platform_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`value` text NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX `platform_settings_key_unique` ON `platform_settings` (`key`);
