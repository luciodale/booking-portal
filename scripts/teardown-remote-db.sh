#!/bin/bash

bunx wrangler d1 execute booking-portal-db --remote --command "
DROP TABLE IF EXISTS channel_markups;
DROP TABLE IF EXISTS asset_experiences;
DROP TABLE IF EXISTS experience_images;
DROP TABLE IF EXISTS favorites;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS availabilities;
DROP TABLE IF EXISTS pricing_rules;
DROP TABLE IF EXISTS images;
DROP TABLE IF EXISTS experiences;
DROP TABLE IF EXISTS assets;
DROP TABLE IF EXISTS channels;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS d1_migrations;
"

