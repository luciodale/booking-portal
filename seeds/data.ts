/**
 * Seed Data - Type-safe seed data for database and R2
 * Uses schema types as single source of truth
 */

import type {
  NewAsset,
  NewCityTaxDefault,
  NewExperience,
  NewImage,
  NewPmsIntegration,
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
    | "additionalCosts"
    | "showFullAddress"
  >
> & {
  smoobuPropertyId?: number;
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
    | "instantBook"
    | "additionalCosts"
  >
>;

export type SeedCityTaxDefault = Required<
  Pick<
    NewCityTaxDefault,
    "id" | "userId" | "city" | "country" | "amount" | "maxNights"
  >
>;

export type SeedPmsIntegration = Required<
  Pick<NewPmsIntegration, "id" | "userId" | "provider" | "apiKey" | "pmsUserId">
>;

export type SeedData = {
  users: SeedUser[];
  assets: SeedAsset[];
  images: SeedImage[];
  experiences: SeedExperience[];
  cityTaxDefaults: SeedCityTaxDefault[];
  pmsIntegrations: SeedPmsIntegration[];
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
    additionalCosts: [
      { label: "Cleaning fee", amount: 35000, per: "stay" },
      { label: "Tourist tax", amount: 350, per: "night_per_guest", maxNights: 10 },
    ],
    instantBook: false,
    featured: true,
    sortOrder: 1,
    showFullAddress: true,
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
    additionalCosts: [
      { label: "Cleaning fee", amount: 25000, per: "stay" },
    ],
    instantBook: false,
    featured: true,
    sortOrder: 2,
    showFullAddress: true,
  },
  {
    id: "barcelona-penthouse",
    userId: "seed_broker_001",
    smoobuPropertyId: 100001,
    tier: "standard",
    status: "published",
    title: "Modern Downtown Penthouse",
    description: `A charming apartment in the heart of Barcelona's Eixample district. Walking distance to Gaudí's masterpieces and the best tapas bars in the city.

This modern apartment features a fully equipped kitchen, comfortable bedrooms, and a sunny balcony overlooking the vibrant neighborhood.`,
    shortDescription:
      "Charming Eixample apartment near Gaudí landmarks with sunny balcony.",
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
    additionalCosts: [
      { label: "Cleaning fee", amount: 8000, per: "stay" },
      { label: "Tourist tax", amount: 225, per: "night_per_guest", maxNights: 7 },
    ],
    instantBook: true,
    featured: false,
    sortOrder: 3,
    showFullAddress: true,
  },
  {
    id: "como-lakehouse",
    userId: "seed_broker_001",
    tier: "elite",
    status: "published",
    title: "Lake Como Lakefront Estate",
    description: `An exquisite lakefront estate on the shores of Lake Como, offering breathtaking views of the Italian Alps and the serene waters below.

The property features lush gardens, a private dock, and interiors designed by a renowned Milanese architect. Every room opens to panoramic lake views through floor-to-ceiling windows.`,
    shortDescription:
      "Lakefront estate with private dock, Alpine views, and Italian designer interiors on Lake Como.",
    street: "Via Roma 45",
    zip: "22021",
    city: "Bellagio",
    country: "Italy",
    latitude: "45.9868",
    longitude: "9.2614",
    maxOccupancy: 10,
    bedrooms: 5,
    bathrooms: 4,
    sqMeters: 600,
    amenities: [
      "Private Dock",
      "Lake Views",
      "Garden",
      "Wine Cellar",
      "Heated Pool",
      "WiFi",
      "Air Conditioning",
      "Fireplace",
      "Parking",
    ],
    views: ["Lake Como", "Italian Alps", "Garden"],
    highlights: ["Lakefront", "Private Dock", "Wine Cellar", "Heated Pool"],
    videoUrl: null,
    pdfAssetPath: null,
    additionalCosts: [
      { label: "Cleaning fee", amount: 20000, per: "stay" },
      { label: "Tourist tax", amount: 300, per: "night_per_guest", maxNights: 14 },
    ],
    instantBook: false,
    featured: true,
    sortOrder: 4,
    showFullAddress: true,
  },
  {
    id: "lisbon-loft",
    userId: "seed_broker_001",
    smoobuPropertyId: 100002,
    tier: "standard",
    status: "published",
    title: "Alfama District Art Loft",
    description: `A stylish loft in Lisbon's historic Alfama district, blending traditional azulejo tiles with contemporary design.

Steps from Fado houses and the iconic Tram 28 route. Rooftop terrace with sweeping views over the Tagus River.`,
    shortDescription:
      "Art loft in Alfama with rooftop terrace and Tagus River views.",
    street: "Rua de São Miguel 18",
    zip: "1100-544",
    city: "Lisbon",
    country: "Portugal",
    latitude: "38.7110",
    longitude: "-9.1304",
    maxOccupancy: 3,
    bedrooms: 1,
    bathrooms: 1,
    sqMeters: 65,
    amenities: [
      "WiFi",
      "Kitchen",
      "Rooftop Terrace",
      "Air Conditioning",
      "Washing Machine",
    ],
    views: ["Tagus River", "City Views"],
    highlights: ["Historic District", "Rooftop Terrace", "River Views"],
    videoUrl: null,
    pdfAssetPath: null,
    additionalCosts: [
      { label: "Cleaning fee", amount: 6000, per: "stay" },
      { label: "Tourist tax", amount: 200, per: "night_per_guest", maxNights: 7 },
    ],
    instantBook: true,
    featured: false,
    sortOrder: 5,
    showFullAddress: true,
  },
  {
    id: "zermatt-lodge",
    userId: "seed_broker_001",
    tier: "elite",
    status: "published",
    title: "Matterhorn View Alpine Lodge",
    description: `Perched above Zermatt, this alpine lodge delivers unobstructed Matterhorn views from every living space.

Hand-crafted timber interiors, a private outdoor hot tub, and ski-in/ski-out access make this the ultimate mountain retreat. The lodge includes a cinema room and a wellness area with sauna and steam bath.`,
    shortDescription:
      "Ski-in/ski-out lodge with Matterhorn views, hot tub, cinema, and wellness area.",
    street: "Haus Alpenblick 7",
    zip: "3920",
    city: "Zermatt",
    country: "Switzerland",
    latitude: "46.0207",
    longitude: "7.7491",
    maxOccupancy: 8,
    bedrooms: 4,
    bathrooms: 3,
    sqMeters: 350,
    amenities: [
      "Hot Tub",
      "Sauna",
      "Steam Bath",
      "Cinema Room",
      "Ski-In/Ski-Out",
      "Boot Warmers",
      "Fireplace",
      "WiFi",
      "Covered Parking",
    ],
    views: ["Matterhorn", "Alpine Peaks", "Village Views"],
    highlights: ["Matterhorn View", "Ski-In/Ski-Out", "Hot Tub", "Cinema"],
    videoUrl: null,
    pdfAssetPath: null,
    additionalCosts: [
      { label: "Cleaning fee", amount: 20000, per: "stay" },
    ],
    instantBook: false,
    featured: true,
    sortOrder: 6,
    showFullAddress: true,
  },
  {
    id: "nice-apartment",
    userId: "seed_broker_001",
    smoobuPropertyId: 100003,
    tier: "standard",
    status: "published",
    title: "Promenade des Anglais Apartment",
    description: `Bright two-bedroom apartment along Nice's famous Promenade des Anglais, just steps from the pebbly beach.

Enjoy the morning light flooding through large French windows while sipping coffee on the balcony overlooking the Mediterranean.`,
    shortDescription:
      "Seafront apartment on the Promenade des Anglais with Mediterranean views.",
    street: "Promenade des Anglais 84",
    zip: "06000",
    city: "Nice",
    country: "France",
    latitude: "43.6947",
    longitude: "7.2653",
    maxOccupancy: 4,
    bedrooms: 2,
    bathrooms: 1,
    sqMeters: 75,
    amenities: [
      "WiFi",
      "Kitchen",
      "Air Conditioning",
      "Balcony",
      "Beach Access",
      "Elevator",
    ],
    views: ["Mediterranean Sea", "Promenade"],
    highlights: ["Seafront", "Beach Access", "French Riviera"],
    videoUrl: null,
    pdfAssetPath: null,
    additionalCosts: [
      { label: "Cleaning fee", amount: 7000, per: "stay" },
      { label: "Tourist tax", amount: 150, per: "night_per_guest" },
    ],
    instantBook: true,
    featured: false,
    sortOrder: 7,
    showFullAddress: true,
  },
  {
    id: "mykonos-villa",
    userId: "seed_broker_001",
    tier: "elite",
    status: "published",
    title: "Cycladic Cliffside Villa",
    description: `A stunning whitewashed villa perched on the cliffs of Mykonos, offering infinity pool views straight into the Aegean Sea.

Traditional Cycladic architecture meets contemporary luxury, with a private chef kitchen, outdoor dining terraces, and direct path to a secluded cove.`,
    shortDescription:
      "Cliffside Cycladic villa with infinity pool, private cove, and Aegean panoramas.",
    street: "Agios Lazaros",
    zip: "84600",
    city: "Mykonos",
    country: "Greece",
    latitude: "37.4467",
    longitude: "25.3289",
    maxOccupancy: 8,
    bedrooms: 4,
    bathrooms: 4,
    sqMeters: 400,
    amenities: [
      "Infinity Pool",
      "Private Cove Access",
      "Chef Kitchen",
      "Outdoor Dining",
      "Air Conditioning",
      "WiFi",
      "Parking",
      "BBQ",
    ],
    views: ["Aegean Sea", "Sunset Views", "Island Panorama"],
    highlights: ["Infinity Pool", "Private Cove", "Sunset Views", "Chef Kitchen"],
    videoUrl: null,
    pdfAssetPath: null,
    additionalCosts: [
      { label: "Cleaning fee", amount: 25000, per: "stay" },
      { label: "Tourist tax", amount: 400, per: "night_per_guest", maxNights: 7 },
    ],
    instantBook: false,
    featured: true,
    sortOrder: 8,
    showFullAddress: true,
  },
  {
    id: "vienna-studio",
    userId: "seed_broker_001",
    smoobuPropertyId: 100004,
    tier: "standard",
    status: "published",
    title: "Ringstrasse Art Nouveau Studio",
    description: `A beautifully restored Art Nouveau studio steps from the Vienna State Opera and the Ringstrasse boulevard.

High ceilings, original parquet floors, and curated period furniture blend seamlessly with modern comforts. The fully equipped kitchenette and marble bathroom make it ideal for couples or solo travelers.`,
    shortDescription:
      "Art Nouveau studio on the Ringstrasse, steps from the Vienna Opera.",
    street: "Opernring 11",
    zip: "1010",
    city: "Vienna",
    country: "Austria",
    latitude: "48.2030",
    longitude: "16.3689",
    maxOccupancy: 2,
    bedrooms: 1,
    bathrooms: 1,
    sqMeters: 55,
    amenities: [
      "WiFi",
      "Kitchenette",
      "Air Conditioning",
      "Elevator",
      "Washing Machine",
    ],
    views: ["Ringstrasse", "City Views"],
    highlights: ["Historic Center", "Opera District", "Art Nouveau"],
    videoUrl: null,
    pdfAssetPath: null,
    additionalCosts: [
      { label: "Cleaning fee", amount: 5000, per: "stay" },
      { label: "City tax", amount: 380, per: "night_per_guest", maxNights: 10 },
    ],
    instantBook: true,
    featured: false,
    sortOrder: 9,
    showFullAddress: true,
  },
  {
    id: "porto-townhouse",
    userId: "seed_broker_001",
    smoobuPropertyId: 100005,
    tier: "standard",
    status: "published",
    title: "Ribeira Townhouse Duplex",
    description: `A stylish duplex in Porto's UNESCO-listed Ribeira district, overlooking the Douro River and the iconic Dom Luís I Bridge.

The ground floor features an open-plan living area with exposed stone walls; the upper floor houses two cozy bedrooms tucked under original timber beams.`,
    shortDescription:
      "Duplex townhouse in Ribeira with Douro River views and stone-wall interiors.",
    street: "Rua da Lada 26",
    zip: "4050-060",
    city: "Porto",
    country: "Portugal",
    latitude: "41.1406",
    longitude: "-8.6132",
    maxOccupancy: 4,
    bedrooms: 2,
    bathrooms: 1,
    sqMeters: 80,
    amenities: [
      "WiFi",
      "Kitchen",
      "Washing Machine",
      "River Views",
      "Heating",
    ],
    views: ["Douro River", "Dom Luís Bridge"],
    highlights: ["UNESCO District", "River Views", "Historic Charm"],
    videoUrl: null,
    pdfAssetPath: null,
    additionalCosts: [
      { label: "Cleaning fee", amount: 5500, per: "stay" },
      { label: "Tourist tax", amount: 200, per: "night_per_guest", maxNights: 7 },
    ],
    instantBook: true,
    featured: false,
    sortOrder: 10,
    showFullAddress: true,
  },
  {
    id: "munich-loft",
    userId: "seed_broker_001",
    smoobuPropertyId: 100006,
    tier: "standard",
    status: "published",
    title: "Schwabing Industrial Loft",
    description: `A converted industrial loft in Munich's creative Schwabing quarter. Exposed brick, steel beams, and polished concrete floors meet designer furniture and a fully equipped kitchen.

Walking distance to the English Garden and excellent public transport connections to Marienplatz and the city center.`,
    shortDescription:
      "Industrial-chic loft in Schwabing near the English Garden.",
    street: "Leopoldstrasse 77",
    zip: "80802",
    city: "Munich",
    country: "Germany",
    latitude: "48.1620",
    longitude: "11.5854",
    maxOccupancy: 3,
    bedrooms: 1,
    bathrooms: 1,
    sqMeters: 70,
    amenities: [
      "WiFi",
      "Kitchen",
      "Washing Machine",
      "Dishwasher",
      "Heating",
      "Bike Storage",
    ],
    views: ["Courtyard"],
    highlights: ["English Garden", "Creative Quarter", "Industrial Design"],
    videoUrl: null,
    pdfAssetPath: null,
    additionalCosts: [
      { label: "Cleaning fee", amount: 6000, per: "stay" },
    ],
    instantBook: true,
    featured: false,
    sortOrder: 11,
    showFullAddress: true,
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
  // Como Lakehouse (reuse mallorca images)
  {
    id: "img-como-1",
    assetId: "como-lakehouse",
    r2Key: "properties/mallorca/view.webp",
    alt: "Lake Como lakefront view",
    isPrimary: true,
    order: 0,
    sourcePath: "properties/mallorca/view.webp",
  },
  {
    id: "img-como-2",
    assetId: "como-lakehouse",
    r2Key: "properties/mallorca/living-room.webp",
    alt: "Estate living room",
    isPrimary: false,
    order: 1,
    sourcePath: "properties/mallorca/living-room.webp",
  },
  // Lisbon Loft (reuse barcelona images)
  {
    id: "img-lisbon-1",
    assetId: "lisbon-loft",
    r2Key: "properties/barcelona/main.webp",
    alt: "Lisbon loft exterior",
    isPrimary: true,
    order: 0,
    sourcePath: "properties/barcelona/main.webp",
  },
  {
    id: "img-lisbon-2",
    assetId: "lisbon-loft",
    r2Key: "properties/barcelona/living.webp",
    alt: "Loft interior",
    isPrimary: false,
    order: 1,
    sourcePath: "properties/barcelona/living.webp",
  },
  // Zermatt Lodge (reuse chalet images)
  {
    id: "img-zermatt-1",
    assetId: "zermatt-lodge",
    r2Key: "properties/chalet/outside.webp",
    alt: "Alpine lodge exterior",
    isPrimary: true,
    order: 0,
    sourcePath: "properties/chalet/outside.webp",
  },
  {
    id: "img-zermatt-2",
    assetId: "zermatt-lodge",
    r2Key: "properties/chalet/view.webp",
    alt: "Matterhorn view",
    isPrimary: false,
    order: 1,
    sourcePath: "properties/chalet/view.webp",
  },
  {
    id: "img-zermatt-3",
    assetId: "zermatt-lodge",
    r2Key: "properties/chalet/living-room.webp",
    alt: "Lodge living room",
    isPrimary: false,
    order: 2,
    sourcePath: "properties/chalet/living-room.webp",
  },
  // Nice Apartment (reuse barcelona images)
  {
    id: "img-nice-1",
    assetId: "nice-apartment",
    r2Key: "properties/barcelona/main.webp",
    alt: "Nice apartment main view",
    isPrimary: true,
    order: 0,
    sourcePath: "properties/barcelona/main.webp",
  },
  {
    id: "img-nice-2",
    assetId: "nice-apartment",
    r2Key: "properties/barcelona/bedroom.webp",
    alt: "Apartment bedroom",
    isPrimary: false,
    order: 1,
    sourcePath: "properties/barcelona/bedroom.webp",
  },
  // Mykonos Villa (reuse mallorca images)
  {
    id: "img-mykonos-1",
    assetId: "mykonos-villa",
    r2Key: "properties/mallorca/main.webp",
    alt: "Cycladic villa exterior",
    isPrimary: true,
    order: 0,
    sourcePath: "properties/mallorca/main.webp",
  },
  {
    id: "img-mykonos-2",
    assetId: "mykonos-villa",
    r2Key: "properties/mallorca/terrace.webp",
    alt: "Villa terrace with sea view",
    isPrimary: false,
    order: 1,
    sourcePath: "properties/mallorca/terrace.webp",
  },
  {
    id: "img-mykonos-3",
    assetId: "mykonos-villa",
    r2Key: "properties/mallorca/bedroom.webp",
    alt: "Villa bedroom",
    isPrimary: false,
    order: 2,
    sourcePath: "properties/mallorca/bedroom.webp",
  },
  // Vienna Studio (reuse barcelona images)
  {
    id: "img-vienna-1",
    assetId: "vienna-studio",
    r2Key: "properties/barcelona/main.webp",
    alt: "Vienna studio main view",
    isPrimary: true,
    order: 0,
    sourcePath: "properties/barcelona/main.webp",
  },
  {
    id: "img-vienna-2",
    assetId: "vienna-studio",
    r2Key: "properties/barcelona/living.webp",
    alt: "Studio living area",
    isPrimary: false,
    order: 1,
    sourcePath: "properties/barcelona/living.webp",
  },
  // Porto Townhouse (reuse barcelona images)
  {
    id: "img-porto-1",
    assetId: "porto-townhouse",
    r2Key: "properties/barcelona/main.webp",
    alt: "Porto townhouse exterior",
    isPrimary: true,
    order: 0,
    sourcePath: "properties/barcelona/main.webp",
  },
  {
    id: "img-porto-2",
    assetId: "porto-townhouse",
    r2Key: "properties/barcelona/bedroom.webp",
    alt: "Townhouse bedroom",
    isPrimary: false,
    order: 1,
    sourcePath: "properties/barcelona/bedroom.webp",
  },
  // Munich Loft (reuse barcelona images)
  {
    id: "img-munich-1",
    assetId: "munich-loft",
    r2Key: "properties/barcelona/main.webp",
    alt: "Munich loft main view",
    isPrimary: true,
    order: 0,
    sourcePath: "properties/barcelona/main.webp",
  },
  {
    id: "img-munich-2",
    assetId: "munich-loft",
    r2Key: "properties/barcelona/living.webp",
    alt: "Loft living area",
    isPrimary: false,
    order: 1,
    sourcePath: "properties/barcelona/living.webp",
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
    city: "Sardinia",
    country: "Italy",
    category: "sailing",
    duration: "8 hours",
    maxParticipants: 8,
    basePrice: 250000,
    currency: "eur",
    imageUrl: "experiences/exp-1/main.webp",
    additionalCosts: [
      { label: "Fuel surcharge", amount: 15000, per: "booking" },
    ],
    status: "published",
    featured: true,
    instantBook: true,
  },
  {
    id: "exp-2",
    userId: "seed_broker_001",
    title: "Wine Tasting Tour",
    description:
      "Discover the finest Tuscan wines with a private sommelier at exclusive vineyards.",
    shortDescription: "Private Tuscan wine tasting experience.",
    city: "Tuscany",
    country: "Italy",
    category: "food_wine",
    duration: "6 hours",
    maxParticipants: 6,
    basePrice: 45000,
    currency: "eur",
    imageUrl: "experiences/exp-2/main.webp",
    additionalCosts: null,
    status: "published",
    featured: true,
    instantBook: true,
  },
  {
    id: "exp-3",
    userId: "seed_broker_001",
    title: "Private Helicopter Tour",
    description:
      "Soar above Monaco and the French Riviera in a private helicopter tour.",
    shortDescription: "Exclusive helicopter tour over Monaco.",
    city: "Monaco",
    country: "Monaco",
    category: "adventure",
    duration: "2 hours",
    maxParticipants: 4,
    basePrice: 380000,
    currency: "eur",
    imageUrl: "experiences/exp-3/main.webp",
    additionalCosts: null,
    status: "published",
    featured: true,
    instantBook: false,
  },
  {
    id: "exp-4",
    userId: "seed_broker_001",
    title: "Michelin Chef Experience",
    description:
      "Private cooking class and dinner with a Michelin-starred chef in Paris.",
    shortDescription: "Cook with a Michelin-starred chef.",
    city: "Paris",
    country: "France",
    category: "food_wine",
    duration: "4 hours",
    maxParticipants: 8,
    basePrice: 120000,
    currency: "eur",
    imageUrl: "experiences/exp-4/main.webp",
    additionalCosts: null,
    status: "published",
    featured: true,
    instantBook: true,
  },
  {
    id: "exp-5",
    userId: "seed_broker_001",
    title: "Sunset Catamaran Cruise",
    description:
      "Sail into the famous Santorini sunset aboard a luxury catamaran.",
    shortDescription: "Romantic Santorini sunset cruise.",
    city: "Santorini",
    country: "Greece",
    category: "sailing",
    duration: "5 hours",
    maxParticipants: 10,
    basePrice: 68000,
    currency: "eur",
    imageUrl: "experiences/exp-5/main.webp",
    additionalCosts: null,
    status: "published",
    featured: false,
    instantBook: true,
  },
  {
    id: "exp-6",
    userId: "seed_broker_001",
    title: "Private Art Gallery Tour",
    description:
      "Exclusive after-hours tour of Florence's finest art galleries with an expert curator.",
    shortDescription: "Private gallery tour in Florence.",
    city: "Florence",
    country: "Italy",
    category: "culture",
    duration: "3 hours",
    maxParticipants: 6,
    basePrice: 35000,
    currency: "eur",
    imageUrl: "experiences/exp-6/main.webp",
    additionalCosts: null,
    status: "published",
    featured: false,
    instantBook: false,
  },
  {
    id: "exp-7",
    userId: "seed_broker_001",
    title: "Alpine Ski Safari",
    description:
      "A full-day guided ski safari across hidden off-piste runs in the Swiss Alps with a certified mountain guide.",
    shortDescription: "Off-piste ski adventure in the Swiss Alps.",
    city: "Zermatt",
    country: "Switzerland",
    category: "adventure",
    duration: "7 hours",
    maxParticipants: 6,
    basePrice: 95000,
    currency: "eur",
    imageUrl: "experiences/exp-1/main.webp",
    additionalCosts: [
      { label: "Equipment rental", amount: 8000, per: "participant" },
    ],
    status: "published",
    featured: false,
    instantBook: true,
  },
  {
    id: "exp-8",
    userId: "seed_broker_001",
    title: "Truffle Hunting in Piedmont",
    description:
      "Join a truffle hunter and his trained dog through the forests of Piedmont, followed by a truffle lunch at a family estate.",
    shortDescription: "Truffle hunt and lunch in Piedmont.",
    city: "Alba",
    country: "Italy",
    category: "food_wine",
    duration: "5 hours",
    maxParticipants: 8,
    basePrice: 52000,
    currency: "eur",
    imageUrl: "experiences/exp-2/main.webp",
    additionalCosts: null,
    status: "published",
    featured: true,
    instantBook: true,
  },
  {
    id: "exp-9",
    userId: "seed_broker_001",
    title: "Private Flamenco Show",
    description:
      "An intimate, private flamenco performance in a historic tablao in Seville, paired with tapas and sherry.",
    shortDescription: "Private flamenco show with tapas in Seville.",
    city: "Seville",
    country: "Spain",
    category: "culture",
    duration: "3 hours",
    maxParticipants: 10,
    basePrice: 28000,
    currency: "eur",
    imageUrl: "experiences/exp-4/main.webp",
    additionalCosts: null,
    status: "published",
    featured: false,
    instantBook: false,
  },
  {
    id: "exp-10",
    userId: "seed_broker_001",
    title: "Aegean Island Hopping",
    description:
      "A multi-island day trip through the Cyclades aboard a private speedboat, with swimming stops at secluded bays.",
    shortDescription: "Private speedboat island hopping in the Cyclades.",
    city: "Mykonos",
    country: "Greece",
    category: "sailing",
    duration: "10 hours",
    maxParticipants: 6,
    basePrice: 180000,
    currency: "eur",
    imageUrl: "experiences/exp-5/main.webp",
    additionalCosts: null,
    status: "published",
    featured: true,
    instantBook: true,
  },
];

// ============================================================================
// City Tax Defaults
// ============================================================================
export const cityTaxDefaults: SeedCityTaxDefault[] = [
  {
    id: "ctx-calvia",
    userId: "seed_broker_001",
    city: "Calvià",
    country: "Spain",
    amount: 350,
    maxNights: 10,
  },
  {
    id: "ctx-barcelona",
    userId: "seed_broker_001",
    city: "Barcelona",
    country: "Spain",
    amount: 225,
    maxNights: 7,
  },
  {
    id: "ctx-bellagio",
    userId: "seed_broker_001",
    city: "Bellagio",
    country: "Italy",
    amount: 300,
    maxNights: 14,
  },
  {
    id: "ctx-lisbon",
    userId: "seed_broker_001",
    city: "Lisbon",
    country: "Portugal",
    amount: 200,
    maxNights: 7,
  },
  {
    id: "ctx-nice",
    userId: "seed_broker_001",
    city: "Nice",
    country: "France",
    amount: 150,
    maxNights: null,
  },
  {
    id: "ctx-mykonos",
    userId: "seed_broker_001",
    city: "Mykonos",
    country: "Greece",
    amount: 400,
    maxNights: 7,
  },
];

// ============================================================================
// PMS Integrations
// ============================================================================
export const pmsIntegrations: SeedPmsIntegration[] = [
  {
    id: "pms-seed-001",
    userId: "seed_broker_001",
    provider: "smoobu",
    apiKey: "mock-api-key",
    pmsUserId: 50001,
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
  cityTaxDefaults,
  pmsIntegrations,
};
