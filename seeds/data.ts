/**
 * Seed Data - Type-safe seed data for database and R2
 * Uses schema types as single source of truth
 */

import type {
  NewAsset,
  NewExperience,
  NewImage,
  NewUser,
} from "../src/db/schema";

// Seed types extend schema insert types with seed-specific fields
export type SeedUser = Required<
  Pick<
    NewUser,
    | "id"
    | "name"
    | "email"
    | "whatsappNumber"
    | "bio"
    | "avatarUrl"
    | "verified"
  >
>;

export type SeedAsset = Required<
  Pick<
    NewAsset,
    | "id"
    | "userId"
    | "tier"
    | "status"
    | "title"
    | "description"
    | "shortDescription"
    | "location"
    | "street"
    | "zip"
    | "city"
    | "country"
    | "latitude"
    | "longitude"
    | "maxOccupancy"
    | "bedrooms"
    | "bathrooms"
    | "sqMeters"
    | "videoUrl"
    | "pdfAssetPath"
    | "instantBook"
    | "featured"
    | "sortOrder"
  >
> & {
  amenities: string[];
  views: string[];
  highlights: string[];
};

export type SeedImage = Required<
  Pick<NewImage, "id" | "assetId" | "r2Key" | "alt" | "isPrimary" | "order">
> & {
  /** Source path - local file path or remote URL (seed-only field) */
  sourcePath: string;
};

export type SeedExperience = Required<
  Pick<
    NewExperience,
    | "id"
    | "userId"
    | "title"
    | "description"
    | "shortDescription"
    | "location"
    | "city"
    | "country"
    | "category"
    | "duration"
    | "maxParticipants"
    | "basePrice"
    | "currency"
    | "imageUrl"
    | "status"
    | "featured"
  >
>;

export type SeedData = {
  users: SeedUser[];
  assets: SeedAsset[];
  images: SeedImage[];
  experiences: SeedExperience[];
};

// ============================================================================
// Users
// ============================================================================
export const users: SeedUser[] = [
  {
    id: "user_39g4hv3lngCrCxq6Y2v6akxvJx9",
    name: "John Doe",
    email: "john.doe@example.com",
    whatsappNumber: "+41 79 123 45 67",
    bio: "Specializing in luxury properties across Europe",
    avatarUrl: null,
    verified: true,
  },
  {
    id: "seed_broker_001",
    name: "Premium Properties Group",
    email: "contact@premiumproperties.com",
    whatsappNumber: "+41 79 123 45 67",
    bio: "Specializing in luxury properties across Europe",
    avatarUrl: null,
    verified: true,
  },
];

// ============================================================================
// Assets
// ============================================================================
export const assets: SeedAsset[] = [
  {
    id: "mallorca-villa",
    userId: "seed_broker_001",
    tier: "elite",
    status: "published",
    title: "Modern Villa Overlooking the Bay of Palma",
    description: `Beautiful, modern designer villa with sea views from all levels. Great views over the Bay of Palma and the Tramuntana Mountains.

Completed in 2022 with existing final de obra, ENERGY CERTIFICATE A. Very good sun exposure. Sun from morning to evening.

Southwest location in Sol de Mallorca. Very quiet, exclusive residential area. Several beaches within walking distance including the Three Fingers Bay and Cala Cap Falco. The international schools are very accessible. 20 minutes to the airport, 10 minutes to Palma, 15 minutes to Port Andratx, 6 minutes to Puerto Portals.

The property features sensationally beautiful kitchen area with a second kitchen. The spacious dining room features an open tunnel fireplace and beautiful natural stonework. The living area extends over 83m². The continuous glass front can be opened to the terrace via large sliding elements. Fantastic sea views across the Bay of Palma from all areas.

The spa includes a sauna, a double shower, a freestanding bathtub, and plenty of space for loungers. The fitness room is right next door. The underground garage has eight parking spaces and various ancillary rooms for golf equipment, bicycles, etc.

The pool area is a great place to relax. It features a saltwater infinity pool, plenty of space for loungers, a large lounge area, and a pool house with a bedroom, bathroom, and kitchen.`,
    shortDescription:
      "1200m² villa with 6 bedrooms, sea views, saltwater pool, spa, wine cellar in exclusive Sol de Mallorca",
    location: "Sol de Mallorca, Spain",
    street: "Sol de Mallorca",
    zip: "07180",
    city: "Calvià",
    country: "Spain",
    latitude: "39.5144",
    longitude: "2.5136",
    maxOccupancy: 12,
    bedrooms: 6,
    bathrooms: 6,
    sqMeters: 1200,
    amenities: [
      "Infinity Pool",
      "Saltwater Pool",
      "Pool House",
      "Spa",
      "Sauna",
      "Fitness Room",
      "Wine Cellar",
      "Elevator",
      "Underground Parking (8 spaces)",
      "Roof Terrace",
      "Drone Landing Pad",
      "Sea Views",
      "Mountain Views",
      "Alarm System",
      "Cameras",
      "Underfloor Heating",
      "Air Conditioning",
      "Double Glazing",
      "Schüco Windows",
      "WiFi",
      "Beach Access",
    ],
    views: ["Bay of Palma", "Tramuntana Mountains", "Mediterranean Sea"],
    highlights: [
      "Sea View",
      "Private Pool",
      "Spa & Fitness",
      "Wine Cellar",
      "Energy Certificate A",
    ],
    videoUrl: null,
    pdfAssetPath: null,
    instantBook: false,
    featured: true,
    sortOrder: 1,
  },
  {
    id: "davos-chalet",
    userId: "seed_broker_001",
    tier: "elite",
    status: "published",
    title: "Chalet Bellevue - Davos",
    description: `Your hideaway on the sunny side of Davos. Located just 3 minutes by car to the World Economic Forum venue.

The chalet was completely hollowed out and very extensively renovated in the summer of 2010. It was ready for occupancy in December 2011. The sensationally beautiful interior design leaves nothing to be desired.

A renowned interior designer from Zurich designed and furnished the chalet. The woodwork - doors, cupboards, washbasins, etc. - was made from very old special wood from Graubünden by a local carpenter.

The house has four spacious bedrooms, three bathrooms, a guest toilet, two living rooms, two dining areas, a reading area with great view, two kitchens and a sauna. The uniquely sunny hillside location makes it possible to sit comfortably and warm outside even in winter.

There is WIFI TV in the whole house with Netflix, Amazon Prime and Apple TV+. The property offers covered parking for 2 cars and 3 outside parking spaces.`,
    shortDescription:
      "300m² chalet with 4 bedrooms, sauna, mountain views, 3 min to WEF venue in Davos",
    location: "Davos, Switzerland",
    street: "Börtjistrasse 23",
    zip: "7260",
    city: "Davos",
    country: "Switzerland",
    latitude: "46.8092",
    longitude: "9.8358",
    maxOccupancy: 8,
    bedrooms: 4,
    bathrooms: 3,
    sqMeters: 300,
    amenities: [
      "Sauna",
      "2 Living Rooms",
      "2 Dining Rooms",
      "2 Kitchens",
      "Reading Lounge",
      "2 Terraces",
      "Mountain Views",
      "Sunny Hillside Location",
      "WiFi TV",
      "Netflix",
      "Amazon Prime",
      "Apple TV+",
      "Covered Parking (2 spaces)",
      "Outside Parking (3 spaces)",
      "Guest Toilet",
      "WEF Access",
    ],
    views: ["Mountain Views", "Alpine Peaks", "Valley Views"],
    highlights: ["Mountain Chic", "3 min to WEF", "Sauna", "Sunny Location"],
    videoUrl: null,
    pdfAssetPath: null,
    instantBook: false,
    featured: true,
    sortOrder: 2,
  },
  {
    id: "barcelona-penthouse",
    userId: "seed_broker_001",
    tier: "standard",
    status: "published",
    title: "Modern Downtown Penthouse",
    description: `A charming apartment in the heart of Barcelona's Eixample district. Walking distance to Gaudí's masterpieces and the best tapas bars in the city.

This modern apartment features a fully equipped kitchen, comfortable bedrooms, and a sunny balcony overlooking the vibrant neighborhood.`,
    shortDescription:
      "Charming Eixample apartment near Gaudí landmarks with sunny balcony.",
    location: "Barcelona, Spain",
    street: "Carrer de Mallorca 123",
    zip: "08008",
    city: "Barcelona",
    country: "Spain",
    latitude: "41.3874",
    longitude: "2.1686",
    maxOccupancy: 4,
    bedrooms: 2,
    bathrooms: 2,
    sqMeters: 85,
    amenities: [
      "WiFi",
      "Kitchen",
      "Air Conditioning",
      "Washing Machine",
      "Balcony",
    ],
    views: ["City Views"],
    highlights: ["City Center", "Walking Distance", "Local Shops"],
    videoUrl: null,
    pdfAssetPath: null,
    instantBook: true,
    featured: false,
    sortOrder: 3,
  },
];

// ============================================================================
// Images - with source paths for seeding
// ============================================================================
export const images: SeedImage[] = [
  // Mallorca Villa images (local files)
  {
    id: "img-mallorca-1",
    assetId: "mallorca-villa",
    r2Key: "properties/mallorca/main.webp",
    alt: "Main view of Mallorca villa",
    isPrimary: true,
    order: 0,
    sourcePath: "properties/mallorca/main.webp",
  },
  {
    id: "img-mallorca-2",
    assetId: "mallorca-villa",
    r2Key: "properties/mallorca/view.webp",
    alt: "Bay of Palma view",
    isPrimary: false,
    order: 1,
    sourcePath: "properties/mallorca/view.webp",
  },
  {
    id: "img-mallorca-3",
    assetId: "mallorca-villa",
    r2Key: "properties/mallorca/view2.webp",
    alt: "Sea view from terrace",
    isPrimary: false,
    order: 2,
    sourcePath: "properties/mallorca/view2.webp",
  },
  {
    id: "img-mallorca-4",
    assetId: "mallorca-villa",
    r2Key: "properties/mallorca/living-room.webp",
    alt: "Living room",
    isPrimary: false,
    order: 3,
    sourcePath: "properties/mallorca/living-room.webp",
  },
  {
    id: "img-mallorca-5",
    assetId: "mallorca-villa",
    r2Key: "properties/mallorca/living-room2.webp",
    alt: "Living room 2",
    isPrimary: false,
    order: 4,
    sourcePath: "properties/mallorca/living-room2.webp",
  },
  {
    id: "img-mallorca-6",
    assetId: "mallorca-villa",
    r2Key: "properties/mallorca/living-room3.webp",
    alt: "Living room 3",
    isPrimary: false,
    order: 5,
    sourcePath: "properties/mallorca/living-room3.webp",
  },
  {
    id: "img-mallorca-7",
    assetId: "mallorca-villa",
    r2Key: "properties/mallorca/kitchen.webp",
    alt: "Designer kitchen",
    isPrimary: false,
    order: 6,
    sourcePath: "properties/mallorca/kitchen.webp",
  },
  {
    id: "img-mallorca-8",
    assetId: "mallorca-villa",
    r2Key: "properties/mallorca/bedroom.webp",
    alt: "Master bedroom",
    isPrimary: false,
    order: 7,
    sourcePath: "properties/mallorca/bedroom.webp",
  },
  {
    id: "img-mallorca-9",
    assetId: "mallorca-villa",
    r2Key: "properties/mallorca/bedoom2.webp",
    alt: "Bedroom 2",
    isPrimary: false,
    order: 8,
    sourcePath: "properties/mallorca/bedoom2.webp",
  },
  {
    id: "img-mallorca-10",
    assetId: "mallorca-villa",
    r2Key: "properties/mallorca/bedroom3.webp",
    alt: "Bedroom 3",
    isPrimary: false,
    order: 9,
    sourcePath: "properties/mallorca/bedroom3.webp",
  },
  {
    id: "img-mallorca-11",
    assetId: "mallorca-villa",
    r2Key: "properties/mallorca/bedroom4.webp",
    alt: "Bedroom 4",
    isPrimary: false,
    order: 10,
    sourcePath: "properties/mallorca/bedroom4.webp",
  },
  {
    id: "img-mallorca-12",
    assetId: "mallorca-villa",
    r2Key: "properties/mallorca/bathroom.webp",
    alt: "Bathroom",
    isPrimary: false,
    order: 11,
    sourcePath: "properties/mallorca/bathroom.webp",
  },
  {
    id: "img-mallorca-13",
    assetId: "mallorca-villa",
    r2Key: "properties/mallorca/spa.webp",
    alt: "Spa area",
    isPrimary: false,
    order: 12,
    sourcePath: "properties/mallorca/spa.webp",
  },
  {
    id: "img-mallorca-14",
    assetId: "mallorca-villa",
    r2Key: "properties/mallorca/spa2.webp",
    alt: "Spa area 2",
    isPrimary: false,
    order: 13,
    sourcePath: "properties/mallorca/spa2.webp",
  },
  {
    id: "img-mallorca-15",
    assetId: "mallorca-villa",
    r2Key: "properties/mallorca/gym.webp",
    alt: "Fitness room",
    isPrimary: false,
    order: 14,
    sourcePath: "properties/mallorca/gym.webp",
  },
  {
    id: "img-mallorca-16",
    assetId: "mallorca-villa",
    r2Key: "properties/mallorca/terrace.webp",
    alt: "Terrace",
    isPrimary: false,
    order: 15,
    sourcePath: "properties/mallorca/terrace.webp",
  },
  {
    id: "img-mallorca-17",
    assetId: "mallorca-villa",
    r2Key: "properties/mallorca/terrace2.webp",
    alt: "Pool terrace",
    isPrimary: false,
    order: 16,
    sourcePath: "properties/mallorca/terrace2.webp",
  },
  {
    id: "img-mallorca-18",
    assetId: "mallorca-villa",
    r2Key: "properties/mallorca/garage.webp",
    alt: "Underground garage",
    isPrimary: false,
    order: 17,
    sourcePath: "properties/mallorca/garage.webp",
  },
  // Davos Chalet images (local files)
  {
    id: "img-chalet-1",
    assetId: "davos-chalet",
    r2Key: "properties/chalet/outside.webp",
    alt: "Chalet exterior view",
    isPrimary: true,
    order: 0,
    sourcePath: "properties/chalet/outside.webp",
  },
  {
    id: "img-chalet-2",
    assetId: "davos-chalet",
    r2Key: "properties/chalet/view.webp",
    alt: "Mountain view",
    isPrimary: false,
    order: 1,
    sourcePath: "properties/chalet/view.webp",
  },
  {
    id: "img-chalet-3",
    assetId: "davos-chalet",
    r2Key: "properties/chalet/view2.webp",
    alt: "Mountain view 2",
    isPrimary: false,
    order: 2,
    sourcePath: "properties/chalet/view2.webp",
  },
  {
    id: "img-chalet-4",
    assetId: "davos-chalet",
    r2Key: "properties/chalet/view3.webp",
    alt: "Valley view",
    isPrimary: false,
    order: 3,
    sourcePath: "properties/chalet/view3.webp",
  },
  {
    id: "img-chalet-5",
    assetId: "davos-chalet",
    r2Key: "properties/chalet/living-room.webp",
    alt: "Spacious living room",
    isPrimary: false,
    order: 4,
    sourcePath: "properties/chalet/living-room.webp",
  },
  {
    id: "img-chalet-6",
    assetId: "davos-chalet",
    r2Key: "properties/chalet/kitchen.webp",
    alt: "Design kitchen",
    isPrimary: false,
    order: 5,
    sourcePath: "properties/chalet/kitchen.webp",
  },
  {
    id: "img-chalet-7",
    assetId: "davos-chalet",
    r2Key: "properties/chalet/bedroom.webp",
    alt: "Mountain chic bedroom",
    isPrimary: false,
    order: 6,
    sourcePath: "properties/chalet/bedroom.webp",
  },
  {
    id: "img-chalet-8",
    assetId: "davos-chalet",
    r2Key: "properties/chalet/bathroom.webp",
    alt: "Bathroom",
    isPrimary: false,
    order: 7,
    sourcePath: "properties/chalet/bathroom.webp",
  },
  {
    id: "img-chalet-9",
    assetId: "davos-chalet",
    r2Key: "properties/chalet/spa.webp",
    alt: "Sauna",
    isPrimary: false,
    order: 8,
    sourcePath: "properties/chalet/spa.webp",
  },
  // Barcelona Penthouse images (local files)
  {
    id: "img-barcelona-1",
    assetId: "barcelona-penthouse",
    r2Key: "properties/barcelona/main.webp",
    alt: "Barcelona penthouse main view",
    isPrimary: true,
    order: 0,
    sourcePath: "properties/barcelona/main.webp",
  },
  {
    id: "img-barcelona-2",
    assetId: "barcelona-penthouse",
    r2Key: "properties/barcelona/living.webp",
    alt: "Living area",
    isPrimary: false,
    order: 1,
    sourcePath: "properties/barcelona/living.webp",
  },
  {
    id: "img-barcelona-3",
    assetId: "barcelona-penthouse",
    r2Key: "properties/barcelona/bedroom.webp",
    alt: "Bedroom",
    isPrimary: false,
    order: 2,
    sourcePath: "properties/barcelona/bedroom.webp",
  },
];

// ============================================================================
// Experiences
// ============================================================================
export const experiences: SeedExperience[] = [
  {
    id: "exp-1",
    userId: "seed_broker_001",
    title: "Private Yacht Day",
    description:
      "Sail the stunning Sardinian coastline aboard a luxury yacht with a private captain and chef.",
    shortDescription: "Luxury yacht charter along the Sardinian coast.",
    location: "Sardinia, Italy",
    city: "Sardinia",
    country: "Italy",
    category: "sailing",
    duration: "8 hours",
    maxParticipants: 8,
    basePrice: 250000,
    currency: "eur",
    imageUrl: "experiences/exp-1/main.webp",
    status: "published",
    featured: true,
  },
  {
    id: "exp-2",
    userId: "seed_broker_001",
    title: "Wine Tasting Tour",
    description:
      "Discover the finest Tuscan wines with a private sommelier at exclusive vineyards.",
    shortDescription: "Private Tuscan wine tasting experience.",
    location: "Tuscany, Italy",
    city: "Tuscany",
    country: "Italy",
    category: "food_wine",
    duration: "6 hours",
    maxParticipants: 6,
    basePrice: 45000,
    currency: "eur",
    imageUrl: "experiences/exp-2/main.webp",
    status: "published",
    featured: true,
  },
  {
    id: "exp-3",
    userId: "seed_broker_001",
    title: "Private Helicopter Tour",
    description:
      "Soar above Monaco and the French Riviera in a private helicopter tour.",
    shortDescription: "Exclusive helicopter tour over Monaco.",
    location: "Monaco",
    city: "Monaco",
    country: "Monaco",
    category: "adventure",
    duration: "2 hours",
    maxParticipants: 4,
    basePrice: 380000,
    currency: "eur",
    imageUrl: "experiences/exp-3/main.webp",
    status: "published",
    featured: true,
  },
  {
    id: "exp-4",
    userId: "seed_broker_001",
    title: "Michelin Chef Experience",
    description:
      "Private cooking class and dinner with a Michelin-starred chef in Paris.",
    shortDescription: "Cook with a Michelin-starred chef.",
    location: "Paris, France",
    city: "Paris",
    country: "France",
    category: "food_wine",
    duration: "4 hours",
    maxParticipants: 8,
    basePrice: 120000,
    currency: "eur",
    imageUrl: "experiences/exp-4/main.webp",
    status: "published",
    featured: true,
  },
  {
    id: "exp-5",
    userId: "seed_broker_001",
    title: "Sunset Catamaran Cruise",
    description:
      "Sail into the famous Santorini sunset aboard a luxury catamaran.",
    shortDescription: "Romantic Santorini sunset cruise.",
    location: "Santorini, Greece",
    city: "Santorini",
    country: "Greece",
    category: "sailing",
    duration: "5 hours",
    maxParticipants: 10,
    basePrice: 68000,
    currency: "eur",
    imageUrl: "experiences/exp-5/main.webp",
    status: "published",
    featured: false,
  },
  {
    id: "exp-6",
    userId: "seed_broker_001",
    title: "Private Art Gallery Tour",
    description:
      "Exclusive after-hours tour of Florence's finest art galleries with an expert curator.",
    shortDescription: "Private gallery tour in Florence.",
    location: "Florence, Italy",
    city: "Florence",
    country: "Italy",
    category: "culture",
    duration: "3 hours",
    maxParticipants: 6,
    basePrice: 35000,
    currency: "eur",
    imageUrl: "experiences/exp-6/main.webp",
    status: "published",
    featured: false,
  },
];

// ============================================================================
// Export all seed data
// ============================================================================
export const seedData: SeedData = {
  users,
  assets,
  images,
  experiences,
};
