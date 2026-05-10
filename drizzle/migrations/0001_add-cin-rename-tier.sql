ALTER TABLE `assets` ADD COLUMN `cin` text;--> statement-breakpoint
UPDATE `assets` SET `tier` = 'premium' WHERE `tier` = 'standard';
