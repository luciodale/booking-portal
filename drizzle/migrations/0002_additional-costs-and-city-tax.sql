CREATE TABLE `city_tax_defaults` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`city` text NOT NULL,
	`country` text DEFAULT 'IT' NOT NULL,
	`amount` integer NOT NULL,
	`max_nights` integer,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_city_tax_defaults_user` ON `city_tax_defaults` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_city_tax_defaults_city` ON `city_tax_defaults` (`city`,`country`);--> statement-breakpoint
ALTER TABLE `assets` ADD `additional_costs` text;--> statement-breakpoint
ALTER TABLE `experiences` ADD `additional_costs` text;