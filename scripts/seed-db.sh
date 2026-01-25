#!/bin/bash

set -e

# Usage: ./scripts/seed-db.sh [--local|--remote]
ENV_FLAG=${1:---local}

if [[ "$ENV_FLAG" != "--local" && "$ENV_FLAG" != "--remote" ]]; then
  echo "Usage: $0 [--local|--remote]"
  exit 1
fi

echo "🌱 Seeding database ($ENV_FLAG)..."

# Read seed data
SEED_FILE="seeds/data.json"

if [ ! -f "$SEED_FILE" ]; then
  echo "❌ Seed file not found: $SEED_FILE"
  exit 1
fi

# Function to escape single quotes for SQL
escape_sql() {
  echo "$1" | sed "s/'/''/g"
}

# Generate SQL from JSON using jq and heredoc
SQL=$(cat << 'EOF'
-- Seed brokers
INSERT INTO brokers (id, clerk_user_id, name, email, whatsapp_number, bio, avatar_url, verified) VALUES
('broker-001', 'seed_broker_clerk_001', 'Premium Properties Group', 'contact@premiumproperties.com', '+41 79 123 45 67', 'Specializing in luxury properties across Europe', NULL, 1);

-- Seed assets (Mallorca Villa)
INSERT INTO assets (
  id, broker_id, tier, status, title, description, short_description,
  location, address, city, country, latitude, longitude,
  max_guests, bedrooms, bathrooms, sq_meters,
  amenities, views, highlights,
  video_url, pdf_asset_path,
  base_price, currency, cleaning_fee,
  instant_book, min_nights, max_nights,
  featured, sort_order
) VALUES (
  'mallorca-villa',
  'broker-001',
  'elite',
  'published',
  'Modern Villa Overlooking the Bay of Palma',
  'Beautiful, modern designer villa with sea views from all levels. Great views over the Bay of Palma and the Tramuntana Mountains.

Completed in 2022 with existing final de obra, ENERGY CERTIFICATE A. Very good sun exposure. Sun from morning to evening.

Southwest location in Sol de Mallorca. Very quiet, exclusive residential area. Several beaches within walking distance including the Three Fingers Bay and Cala Cap Falco. The international schools are very accessible. 20 minutes to the airport, 10 minutes to Palma, 15 minutes to Port Andratx, 6 minutes to Puerto Portals.

The property features sensationally beautiful kitchen area with a second kitchen. The spacious dining room features an open tunnel fireplace and beautiful natural stonework. The living area extends over 83m². The continuous glass front can be opened to the terrace via large sliding elements. Fantastic sea views across the Bay of Palma from all areas.

The spa includes a sauna, a double shower, a freestanding bathtub, and plenty of space for loungers. The fitness room is right next door. The underground garage has eight parking spaces and various ancillary rooms for golf equipment, bicycles, etc.

The pool area is a great place to relax. It features a saltwater infinity pool, plenty of space for loungers, a large lounge area, and a pool house with a bedroom, bathroom, and kitchen.',
  '1200m² villa with 6 bedrooms, sea views, saltwater pool, spa, wine cellar in exclusive Sol de Mallorca',
  'Sol de Mallorca, Spain',
  'Sol de Mallorca, 07180 Calvià, Balearic Islands, Spain',
  'Calvià',
  'Spain',
  '39.5144',
  '2.5136',
  12,
  6,
  6,
  1200,
  '["Infinity Pool","Saltwater Pool","Pool House","Spa","Sauna","Fitness Room","Wine Cellar","Elevator","Underground Parking (8 spaces)","Roof Terrace","Drone Landing Pad","Sea Views","Mountain Views","Alarm System","Cameras","Underfloor Heating","Air Conditioning","Double Glazing","Schüco Windows","WiFi","Beach Access"]',
  '["Bay of Palma","Tramuntana Mountains","Mediterranean Sea"]',
  '["Sea View","Private Pool","Spa & Fitness","Wine Cellar","Energy Certificate A"]',
  NULL,
  NULL,
  350000,
  'eur',
  35000,
  0,
  5,
  30,
  1,
  1
);

-- Seed assets (Davos Chalet)
INSERT INTO assets (
  id, broker_id, tier, status, title, description, short_description,
  location, address, city, country, latitude, longitude,
  max_guests, bedrooms, bathrooms, sq_meters,
  amenities, views, highlights,
  video_url, pdf_asset_path,
  base_price, currency, cleaning_fee,
  instant_book, min_nights, max_nights,
  featured, sort_order
) VALUES (
  'davos-chalet',
  'broker-001',
  'elite',
  'published',
  'Chalet Bellevue - Davos',
  'Your hideaway on the sunny side of Davos. Located just 3 minutes by car to the World Economic Forum venue.

The chalet was completely hollowed out and very extensively renovated in the summer of 2010. It was ready for occupancy in December 2011. The sensationally beautiful interior design leaves nothing to be desired.

A renowned interior designer from Zurich designed and furnished the chalet. The woodwork - doors, cupboards, washbasins, etc. - was made from very old special wood from Graubünden by a local carpenter.

The house has four spacious bedrooms, three bathrooms, a guest toilet, two living rooms, two dining areas, a reading area with great view, two kitchens and a sauna. The uniquely sunny hillside location makes it possible to sit comfortably and warm outside even in winter.

There is WIFI TV in the whole house with Netflix, Amazon Prime and Apple TV+. The property offers covered parking for 2 cars and 3 outside parking spaces.',
  '300m² chalet with 4 bedrooms, sauna, mountain views, 3 min to WEF venue in Davos',
  'Davos, Switzerland',
  'Börtjistrasse 23, 7260 Davos, Switzerland',
  'Davos',
  'Switzerland',
  '46.8092',
  '9.8358',
  8,
  4,
  3,
  300,
  '["Sauna","2 Living Rooms","2 Dining Rooms","2 Kitchens","Reading Lounge","2 Terraces","Mountain Views","Sunny Hillside Location","WiFi TV","Netflix","Amazon Prime","Apple TV+","Covered Parking (2 spaces)","Outside Parking (3 spaces)","Guest Toilet","WEF Access"]',
  '["Mountain Views","Alpine Peaks","Valley Views"]',
  '["Mountain Chic","3 min to WEF","Sauna","Sunny Location"]',
  NULL,
  NULL,
  280000,
  'eur',
  25000,
  0,
  4,
  14,
  1,
  2
);

-- Seed assets (Barcelona Penthouse)
INSERT INTO assets (
  id, broker_id, tier, status, title, description, short_description,
  location, address, city, country, latitude, longitude,
  max_guests, bedrooms, bathrooms, sq_meters,
  amenities, views, highlights,
  video_url, pdf_asset_path,
  base_price, currency, cleaning_fee,
  instant_book, min_nights, max_nights,
  featured, sort_order
) VALUES (
  'barcelona-penthouse',
  'broker-001',
  'standard',
  'published',
  'Modern Downtown Penthouse',
  'A charming apartment in the heart of Barcelona''s Eixample district. Walking distance to Gaudí''s masterpieces and the best tapas bars in the city.

This modern apartment features a fully equipped kitchen, comfortable bedrooms, and a sunny balcony overlooking the vibrant neighborhood.',
  'Charming Eixample apartment near Gaudí landmarks with sunny balcony.',
  'Barcelona, Spain',
  'Carrer de Mallorca 123, 08008 Barcelona, Spain',
  'Barcelona',
  'Spain',
  '41.3874',
  '2.1686',
  4,
  2,
  2,
  85,
  '["WiFi","Kitchen","Air Conditioning","Washing Machine","Balcony"]',
  '["City Views"]',
  '["City Center","Walking Distance","Local Shops"]',
  NULL,
  NULL,
  45000,
  'eur',
  8000,
  1,
  2,
  30,
  0,
  3
);

-- Seed images for Mallorca
INSERT INTO images (id, asset_id, r2_key, alt, is_primary, "order") VALUES
('img-mallorca-1', 'mallorca-villa', '/properties/mallorca/main.webp', 'Main view of Mallorca villa', 1, 0),
('img-mallorca-2', 'mallorca-villa', '/properties/mallorca/view.webp', 'Bay of Palma view', 0, 1),
('img-mallorca-3', 'mallorca-villa', '/properties/mallorca/view2.webp', 'Sea view from terrace', 0, 2),
('img-mallorca-4', 'mallorca-villa', '/properties/mallorca/living-room.webp', 'Living room', 0, 3),
('img-mallorca-5', 'mallorca-villa', '/properties/mallorca/living-room2.webp', 'Living room 2', 0, 4),
('img-mallorca-6', 'mallorca-villa', '/properties/mallorca/living-room3.webp', 'Living room 3', 0, 5),
('img-mallorca-7', 'mallorca-villa', '/properties/mallorca/kitchen.webp', 'Designer kitchen', 0, 6),
('img-mallorca-8', 'mallorca-villa', '/properties/mallorca/bedroom.webp', 'Master bedroom', 0, 7),
('img-mallorca-9', 'mallorca-villa', '/properties/mallorca/bedoom2.webp', 'Bedroom 2', 0, 8),
('img-mallorca-10', 'mallorca-villa', '/properties/mallorca/bedroom3.webp', 'Bedroom 3', 0, 9),
('img-mallorca-11', 'mallorca-villa', '/properties/mallorca/bedroom4.webp', 'Bedroom 4', 0, 10),
('img-mallorca-12', 'mallorca-villa', '/properties/mallorca/bathroom.webp', 'Bathroom', 0, 11),
('img-mallorca-13', 'mallorca-villa', '/properties/mallorca/spa.webp', 'Spa area', 0, 12),
('img-mallorca-14', 'mallorca-villa', '/properties/mallorca/spa2.webp', 'Spa area 2', 0, 13),
('img-mallorca-15', 'mallorca-villa', '/properties/mallorca/gym.webp', 'Fitness room', 0, 14),
('img-mallorca-16', 'mallorca-villa', '/properties/mallorca/terrace.webp', 'Terrace', 0, 15),
('img-mallorca-17', 'mallorca-villa', '/properties/mallorca/terrace2.webp', 'Pool terrace', 0, 16),
('img-mallorca-18', 'mallorca-villa', '/properties/mallorca/garage.webp', 'Underground garage', 0, 17);

-- Seed images for Chalet
INSERT INTO images (id, asset_id, r2_key, alt, is_primary, "order") VALUES
('img-chalet-1', 'davos-chalet', '/properties/chalet/outside.webp', 'Chalet exterior view', 1, 0),
('img-chalet-2', 'davos-chalet', '/properties/chalet/view.webp', 'Mountain view', 0, 1),
('img-chalet-3', 'davos-chalet', '/properties/chalet/view2.webp', 'Mountain view 2', 0, 2),
('img-chalet-4', 'davos-chalet', '/properties/chalet/view3.webp', 'Valley view', 0, 3),
('img-chalet-5', 'davos-chalet', '/properties/chalet/living-room.webp', 'Spacious living room', 0, 4),
('img-chalet-6', 'davos-chalet', '/properties/chalet/kitchen.webp', 'Design kitchen', 0, 5),
('img-chalet-7', 'davos-chalet', '/properties/chalet/bedroom.webp', 'Mountain chic bedroom', 0, 6),
('img-chalet-8', 'davos-chalet', '/properties/chalet/bathroom.webp', 'Bathroom', 0, 7),
('img-chalet-9', 'davos-chalet', '/properties/chalet/spa.webp', 'Sauna', 0, 8);

-- Seed experiences
INSERT INTO experiences (
  id, broker_id, title, description, short_description,
  location, city, country, category, duration, max_participants,
  base_price, currency, image_url, status, featured
) VALUES
('exp-1', 'broker-001', 'Private Yacht Day', 'Sail the stunning Sardinian coastline aboard a luxury yacht with a private captain and chef.', 'Luxury yacht charter along the Sardinian coast.', 'Sardinia, Italy', 'Sardinia', 'Italy', 'sailing', '8 hours', 8, 250000, 'eur', 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800&q=80', 'published', 1),
('exp-2', 'broker-001', 'Wine Tasting Tour', 'Discover the finest Tuscan wines with a private sommelier at exclusive vineyards.', 'Private Tuscan wine tasting experience.', 'Tuscany, Italy', 'Tuscany', 'Italy', 'food_wine', '6 hours', 6, 45000, 'eur', 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&q=80', 'published', 1),
('exp-3', 'broker-001', 'Private Helicopter Tour', 'Soar above Monaco and the French Riviera in a private helicopter tour.', 'Exclusive helicopter tour over Monaco.', 'Monaco', 'Monaco', 'Monaco', 'adventure', '2 hours', 4, 380000, 'eur', 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=800&q=80', 'published', 1),
('exp-4', 'broker-001', 'Michelin Chef Experience', 'Private cooking class and dinner with a Michelin-starred chef in Paris.', 'Cook with a Michelin-starred chef.', 'Paris, France', 'Paris', 'France', 'food_wine', '4 hours', 8, 120000, 'eur', 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80', 'published', 1),
('exp-5', 'broker-001', 'Sunset Catamaran Cruise', 'Sail into the famous Santorini sunset aboard a luxury catamaran.', 'Romantic Santorini sunset cruise.', 'Santorini, Greece', 'Santorini', 'Greece', 'sailing', '5 hours', 10, 68000, 'eur', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80', 'published', 0),
('exp-6', 'broker-001', 'Private Art Gallery Tour', 'Exclusive after-hours tour of Florence''s finest art galleries with an expert curator.', 'Private gallery tour in Florence.', 'Florence, Italy', 'Florence', 'Italy', 'culture', '3 hours', 6, 35000, 'eur', 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800&q=80', 'published', 0);

-- Seed pricing rules
INSERT INTO pricing_rules (id, asset_id, name, start_date, end_date, multiplier, min_nights, priority, active) VALUES
('pr-mallorca-summer', 'mallorca-villa', 'Summer Peak Season', '2026-06-15', '2026-09-15', 150, 7, 10, 1),
('pr-mallorca-winter', 'mallorca-villa', 'Winter Low Season', '2026-11-01', '2027-03-31', 80, NULL, 5, 1),
('pr-chalet-wef', 'davos-chalet', 'WEF Week Premium', '2027-01-18', '2027-01-25', 300, 7, 20, 1),
('pr-chalet-ski', 'davos-chalet', 'Ski Season', '2026-12-15', '2027-04-15', 175, 4, 10, 1);
EOF
)

# Execute SQL via wrangler
echo "$SQL" | bunx wrangler d1 execute booking-portal-db $ENV_FLAG --command "$(cat)"

echo "✅ Database seeded successfully ($ENV_FLAG)"

