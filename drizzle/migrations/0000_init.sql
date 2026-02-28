CREATE TABLE `asset_experiences` (
	`id` text PRIMARY KEY NOT NULL,
	`asset_id` text NOT NULL,
	`experience_id` text NOT NULL,
	`discount_percent` integer DEFAULT 0,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`asset_id`) REFERENCES `assets`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`experience_id`) REFERENCES `experiences`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_asset_experiences_asset` ON `asset_experiences` (`asset_id`);--> statement-breakpoint
CREATE INDEX `idx_asset_experiences_exp` ON `asset_experiences` (`experience_id`);--> statement-breakpoint
CREATE INDEX `idx_asset_experiences_asset_exp` ON `asset_experiences` (`asset_id`,`experience_id`);--> statement-breakpoint
CREATE TABLE `assets` (
	`id` text PRIMARY KEY NOT NULL,
	`smoobu_property_id` integer,
	`user_id` text NOT NULL,
	`tier` text DEFAULT 'standard' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`short_description` text,
	`street` text,
	`zip` text,
	`city` text,
	`country` text,
	`latitude` text,
	`longitude` text,
	`show_full_address` integer DEFAULT true NOT NULL,
	`max_occupancy` integer,
	`bedrooms` integer,
	`bathrooms` integer,
	`double_beds` integer,
	`single_beds` integer,
	`sofa_beds` integer,
	`couches` integer,
	`child_beds` integer,
	`queen_size_beds` integer,
	`king_size_beds` integer,
	`sq_meters` integer,
	`check_in` text,
	`check_out` text,
	`amenities` text,
	`views` text,
	`highlights` text,
	`instant_book` integer DEFAULT false NOT NULL,
	`additional_costs` text,
	`extras` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `assets_smoobu_property_id_unique` ON `assets` (`smoobu_property_id`);--> statement-breakpoint
CREATE INDEX `idx_assets_user` ON `assets` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_assets_tier` ON `assets` (`tier`);--> statement-breakpoint
CREATE INDEX `idx_assets_status` ON `assets` (`status`);--> statement-breakpoint
CREATE INDEX `idx_assets_city` ON `assets` (`city`);--> statement-breakpoint
CREATE TABLE `bookings` (
	`id` text PRIMARY KEY NOT NULL,
	`asset_id` text NOT NULL,
	`user_id` text NOT NULL,
	`check_in` text NOT NULL,
	`check_out` text NOT NULL,
	`nights` integer NOT NULL,
	`guests` integer DEFAULT 1 NOT NULL,
	`base_total` integer NOT NULL,
	`cleaning_fee` integer DEFAULT 0 NOT NULL,
	`service_fee` integer DEFAULT 0 NOT NULL,
	`total_price` integer NOT NULL,
	`currency` text DEFAULT 'eur' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`stripe_session_id` text,
	`stripe_payment_intent_id` text,
	`paid_at` text,
	`smoobu_reservation_id` integer,
	`guest_note` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`asset_id`) REFERENCES `assets`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_bookings_asset` ON `bookings` (`asset_id`);--> statement-breakpoint
CREATE INDEX `idx_bookings_user` ON `bookings` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_bookings_status` ON `bookings` (`status`);--> statement-breakpoint
CREATE INDEX `idx_bookings_dates` ON `bookings` (`check_in`,`check_out`);--> statement-breakpoint
CREATE TABLE `broker_fee_overrides` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`fee_percent` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `broker_fee_overrides_user_id_unique` ON `broker_fee_overrides` (`user_id`);--> statement-breakpoint
CREATE TABLE `broker_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`event_type` text NOT NULL,
	`related_entity_id` text,
	`message` text NOT NULL,
	`metadata` text,
	`acknowledged` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_broker_logs_user` ON `broker_logs` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_broker_logs_acknowledged` ON `broker_logs` (`acknowledged`);--> statement-breakpoint
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
CREATE TABLE `event_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`level` text NOT NULL,
	`source` text NOT NULL,
	`message` text NOT NULL,
	`metadata` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE INDEX `idx_event_logs_level` ON `event_logs` (`level`);--> statement-breakpoint
CREATE INDEX `idx_event_logs_source` ON `event_logs` (`source`);--> statement-breakpoint
CREATE INDEX `idx_event_logs_created_at` ON `event_logs` (`created_at`);--> statement-breakpoint
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
CREATE TABLE `experience_images` (
	`id` text PRIMARY KEY NOT NULL,
	`experience_id` text NOT NULL,
	`r2_key` text NOT NULL,
	`alt` text,
	`is_primary` integer DEFAULT false NOT NULL,
	`order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`experience_id`) REFERENCES `experiences`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_experience_images_exp` ON `experience_images` (`experience_id`);--> statement-breakpoint
CREATE TABLE `experiences` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`short_description` text,
	`city` text,
	`country` text,
	`category` text,
	`category_icon` text,
	`duration` text,
	`max_participants` integer,
	`base_price` integer NOT NULL,
	`currency` text DEFAULT 'eur' NOT NULL,
	`image_url` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`show_price` integer DEFAULT true NOT NULL,
	`additional_costs` text,
	`instant_book` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_experiences_user` ON `experiences` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_experiences_category` ON `experiences` (`category`);--> statement-breakpoint
CREATE INDEX `idx_experiences_status` ON `experiences` (`status`);--> statement-breakpoint
CREATE TABLE `images` (
	`id` text PRIMARY KEY NOT NULL,
	`asset_id` text NOT NULL,
	`r2_key` text NOT NULL,
	`alt` text,
	`is_primary` integer DEFAULT false NOT NULL,
	`order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`asset_id`) REFERENCES `assets`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_images_asset` ON `images` (`asset_id`);--> statement-breakpoint
CREATE TABLE `platform_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`value` text NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX `platform_settings_key_unique` ON `platform_settings` (`key`);--> statement-breakpoint
CREATE TABLE `pms_integrations` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`provider` text NOT NULL,
	`api_key` text NOT NULL,
	`pms_user_id` integer,
	`pms_email` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_pms_integrations_user` ON `pms_integrations` (`user_id`);--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`booking_id` text NOT NULL,
	`asset_id` text NOT NULL,
	`user_id` text NOT NULL,
	`rating` integer NOT NULL,
	`title` text,
	`content` text,
	`owner_response` text,
	`owner_responded_at` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`asset_id`) REFERENCES `assets`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_reviews_asset` ON `reviews` (`asset_id`);--> statement-breakpoint
CREATE INDEX `idx_reviews_user` ON `reviews` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_reviews_status` ON `reviews` (`status`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text,
	`phone` text,
	`avatar_url` text,
	`preferred_language` text DEFAULT 'en',
	`whatsapp_number` text,
	`bio` text,
	`verified` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`stripe_connected_account_id` text,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
