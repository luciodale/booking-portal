-- Add extras column to assets
ALTER TABLE `assets` ADD `extras` text;--> statement-breakpoint

-- Add show_price column to experiences
ALTER TABLE `experiences` ADD `show_price` integer DEFAULT 1 NOT NULL;--> statement-breakpoint

-- Drop idx_assets_featured index (must happen before dropping the column)
DROP INDEX IF EXISTS `idx_assets_featured`;--> statement-breakpoint

-- Drop featured and sort_order from assets
ALTER TABLE `assets` DROP COLUMN `featured`;--> statement-breakpoint
ALTER TABLE `assets` DROP COLUMN `sort_order`;--> statement-breakpoint

-- Drop featured from experiences
ALTER TABLE `experiences` DROP COLUMN `featured`;--> statement-breakpoint

-- Drop featured and sort_order from asset_experiences
ALTER TABLE `asset_experiences` DROP COLUMN `featured`;--> statement-breakpoint
ALTER TABLE `asset_experiences` DROP COLUMN `sort_order`;
