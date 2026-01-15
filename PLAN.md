Project Specification: "Elite" Direct-Booking Platform

1. Executive Summary

Building a high-end, direct-to-broker booking platform designed to compete with Booking.com/Airbnb but with a "Direct Management" focus.

Core Value: Removing intermediaries to lower fees, focusing on direct Broker-to-User relationships.

Target Market: High-net-worth individuals (rents 30k–100k/month) + a standard tier.

Future Proofing: Initially Apartments, architected to expand into Boats (Skippers), Tours, and Concierge Services.

2. Design & Brand Philosophy

Aesthetic: "Elite," Minimal, Elegant. High-end typography, parallax effects, smooth transitions.

Segmentation: The UI must visually distinguish between:

Elite Collection: (Luxury, dark mode options, video backgrounds).

Standard Collection: (Clean, grid-based, functional).

3. Technical Architecture (Cloudflare Stack)

Core Stack

Runtime: Cloudflare Workers (Serverless API).

Frontend: Astro (SSG for speed/SEO) + React Islands (Interactive components).

Database: Cloudflare D1 (SQLite) - Strictly for Business Data (Assets/Users/Bookings).

Storage: Cloudflare R2 (Images/Assets).

Auth: Clerk (User & Broker management).

Payments: Stripe (Connect/Checkout).

Chat Infrastructure: Headless Chat Provider (e.g., Stream Chat or TalkJS).

Codebase Structure 

To ensure type safety across the entire stack, we will use a single repo approach. (NO - MONOREPO THANKS)

/src
├── packages
│   └── db                 # THE SOURCE OF TRUTH
│       ├── schema.ts      # Drizzle ORM definitions
│       └── index.ts       # Exports types (Asset, Booking) inferred from schema
├── ...
│   


4. Data Model Strategy

Database (Drizzle ORM)

We rely on Drizzle ORM to define the schema and generate TypeScript types automatically.

Key Entities:

Assets: The core table. Includes type enum ('apartment', 'boat', 'tour') to allow future expansion.

Brokers: Stores profile and whatsapp_number.

Pricing_Rules: Replaces external tools like Smoobu.

Logic: Base Price + Date Range + Multiplier (e.g., August = 1.5x).

Bookings: Links User, Asset, and Transaction.

Pricing Logic

Constraint: Do not scrape Airbnb/Booking for prices.

Solution: Build an internal Dynamic Pricing Engine.

Data: Brokers import base prices. We allow CSV import from Smoobu for migration, but the app becomes the new source of truth.

5. Messaging System (Headless 3rd Party)

Requirement: No message storage in D1. Use a robust third-party infrastructure that allows full UI customization and WhatsApp bridging.

Provider Choice: Stream Chat or TalkJS.

Why: They offer "Headless" SDKs (Hooks) allowing us to build the UI entirely from scratch in React (preserving the "Elite" look) while they handle storage, websockets, and history.

Data Storage: Managed entirely by the Provider.

Frontend Implementation:

We build custom React components (<ChatWindow />, <MessageBubble />).

We use the Provider's React Hooks (useChannel, useMessage) to bind data to our UI.

Broker Notification (WhatsApp):

Trigger: When a user sends a message, the Chat Provider fires a Webhook.

Action: Your Cloudflare Worker receives the webhook and calls the Meta WhatsApp Cloud API to send the notification template to the Broker.

Note: The Broker replies via a link or directly (depending on integration depth), but the initial alert is guaranteed via WhatsApp.

6. Functional Requirements

User Side

Search/Filter: Filter by Tier (Elite/Standard), Date, Location.

Asset View: High-res R2 images, "Instant Book" vs "Request Booking" toggle.

Chat: Custom-designed React chat window (powered by Stream/TalkJS).

Broker Side

Onboarding: Clerk Auth + Profile setup (WhatsApp verification).

Asset Management: Form to upload details and R2 images.

Calendar: View bookings (Initially sync via iCal to prevent double-booking with Airbnb).

7. Execution Roadmap

Phase 1: The Core (Data & Auth)

Set up repo.

Deploy D1 with Drizzle Schema (Assets/Pricing only).

Integrate Clerk Auth.

Phase 2: The "Elite" Frontend

Build Astro layouts.

Implement R2 image uploads.

Render "Elite" vs "Standard" UI logic.

Phase 3: Logic & Payments

Implement Pricing Engine.

Integrate Stripe.

Phase 4: Communication Integration

Set up Stream Chat (or equivalent) account.

Build the Cloudflare Worker endpoint to generate Chat Auth Tokens for logged-in users.

Build the Custom React Chat UI (connecting to Stream SDK).

Set up the Webhook -> Meta API pipeline for WhatsApp alerts.


-----

look into see-in-the-sea to setup a similar repo. Add the schema, one test worker function, astro, tailwindcss 4, react, react-router by tanstack plus an example react route (like I do in the other repo) don't do multi language for now. I need something small to get started but that scales well as I need to add components and features.