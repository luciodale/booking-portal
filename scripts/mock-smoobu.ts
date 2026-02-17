#!/usr/bin/env bun
/**
 * Mock Smoobu API + Stripe Webhook Server
 * Local development server that mocks Smoobu API endpoints and can fire
 * fake Stripe webhook events to the local Astro dev server.
 * Run with: bun run mock:smoobu
 */

const PORT = 4200;
const ASTRO_ORIGIN = "http://localhost:4321";
const PRICE_PER_NIGHT = 150; // EUR
const MIN_LENGTH_OF_STAY = 3; // nights

// ── In-memory booking store ────────────────────────────────────────────────
type Booking = {
  id: number;
  apartmentId: number;
  arrivalDate: string;
  departureDate: string;
};

let nextBookingId = 99001;
const bookings: Booking[] = [];

// ── Mock apartment catalogue ─────────────────────────────────────────────
type MockApartment = {
  id: number;
  name: string;
  location: {
    street: string;
    zip: string;
    city: string;
    country: string;
    latitude: string;
    longitude: string;
  };
  timeZone: string;
  rooms: {
    maxOccupancy: number;
    bedrooms: number;
    bathrooms: number;
    doubleBeds: number;
    singleBeds: number;
    sofaBeds: number;
    couches: number;
    childBeds: number;
    queenSizeBeds: number;
    kingSizeBeds: number;
  };
  equipments: string[];
  currency: string;
  price: { minimal: string; maximal: string };
  type: { id: number; name: string };
};

const MOCK_APARTMENTS: MockApartment[] = [
  {
    id: 100001,
    name: "Modern Downtown Penthouse",
    location: {
      street: "Carrer de Mallorca 123",
      zip: "08008",
      city: "Barcelona",
      country: "Spain",
      latitude: "41.3874",
      longitude: "2.1686",
    },
    timeZone: "Europe/Madrid",
    rooms: {
      maxOccupancy: 4,
      bedrooms: 2,
      bathrooms: 2,
      doubleBeds: 1,
      singleBeds: 0,
      sofaBeds: 0,
      couches: 0,
      childBeds: 0,
      queenSizeBeds: 1,
      kingSizeBeds: 0,
    },
    equipments: [
      "WiFi",
      "Kitchen",
      "Air Conditioning",
      "Washing Machine",
      "Balcony",
    ],
    currency: "EUR",
    price: { minimal: "120", maximal: "200" },
    type: { id: 1, name: "apartment" },
  },
  {
    id: 100002,
    name: "Alfama District Art Loft",
    location: {
      street: "Rua de São Miguel 18",
      zip: "1100-544",
      city: "Lisbon",
      country: "Portugal",
      latitude: "38.7110",
      longitude: "-9.1304",
    },
    timeZone: "Europe/Lisbon",
    rooms: {
      maxOccupancy: 3,
      bedrooms: 1,
      bathrooms: 1,
      doubleBeds: 1,
      singleBeds: 0,
      sofaBeds: 0,
      couches: 0,
      childBeds: 0,
      queenSizeBeds: 0,
      kingSizeBeds: 0,
    },
    equipments: [
      "WiFi",
      "Kitchen",
      "Rooftop Terrace",
      "Air Conditioning",
      "Washing Machine",
    ],
    currency: "EUR",
    price: { minimal: "100", maximal: "180" },
    type: { id: 1, name: "apartment" },
  },
  {
    id: 100003,
    name: "Promenade des Anglais Apartment",
    location: {
      street: "Promenade des Anglais 84",
      zip: "06000",
      city: "Nice",
      country: "France",
      latitude: "43.6947",
      longitude: "7.2653",
    },
    timeZone: "Europe/Paris",
    rooms: {
      maxOccupancy: 4,
      bedrooms: 2,
      bathrooms: 1,
      doubleBeds: 1,
      singleBeds: 0,
      sofaBeds: 0,
      couches: 0,
      childBeds: 0,
      queenSizeBeds: 1,
      kingSizeBeds: 0,
    },
    equipments: [
      "WiFi",
      "Kitchen",
      "Air Conditioning",
      "Balcony",
      "Beach Access",
      "Elevator",
    ],
    currency: "EUR",
    price: { minimal: "130", maximal: "220" },
    type: { id: 1, name: "apartment" },
  },
  {
    id: 100004,
    name: "Ringstrasse Art Nouveau Studio",
    location: {
      street: "Opernring 11",
      zip: "1010",
      city: "Vienna",
      country: "Austria",
      latitude: "48.2030",
      longitude: "16.3689",
    },
    timeZone: "Europe/Vienna",
    rooms: {
      maxOccupancy: 2,
      bedrooms: 1,
      bathrooms: 1,
      doubleBeds: 1,
      singleBeds: 0,
      sofaBeds: 0,
      couches: 0,
      childBeds: 0,
      queenSizeBeds: 0,
      kingSizeBeds: 0,
    },
    equipments: [
      "WiFi",
      "Kitchenette",
      "Air Conditioning",
      "Elevator",
      "Washing Machine",
    ],
    currency: "EUR",
    price: { minimal: "90", maximal: "160" },
    type: { id: 1, name: "apartment" },
  },
  {
    id: 100005,
    name: "Ribeira Townhouse Duplex",
    location: {
      street: "Rua da Lada 26",
      zip: "4050-060",
      city: "Porto",
      country: "Portugal",
      latitude: "41.1406",
      longitude: "-8.6132",
    },
    timeZone: "Europe/Lisbon",
    rooms: {
      maxOccupancy: 4,
      bedrooms: 2,
      bathrooms: 1,
      doubleBeds: 1,
      singleBeds: 0,
      sofaBeds: 0,
      couches: 0,
      childBeds: 0,
      queenSizeBeds: 1,
      kingSizeBeds: 0,
    },
    equipments: [
      "WiFi",
      "Kitchen",
      "Washing Machine",
      "River Views",
      "Heating",
    ],
    currency: "EUR",
    price: { minimal: "100", maximal: "170" },
    type: { id: 1, name: "apartment" },
  },
  {
    id: 100006,
    name: "Schwabing Industrial Loft",
    location: {
      street: "Leopoldstrasse 77",
      zip: "80802",
      city: "Munich",
      country: "Germany",
      latitude: "48.1620",
      longitude: "11.5854",
    },
    timeZone: "Europe/Berlin",
    rooms: {
      maxOccupancy: 3,
      bedrooms: 1,
      bathrooms: 1,
      doubleBeds: 1,
      singleBeds: 0,
      sofaBeds: 0,
      couches: 0,
      childBeds: 0,
      queenSizeBeds: 0,
      kingSizeBeds: 0,
    },
    equipments: [
      "WiFi",
      "Kitchen",
      "Washing Machine",
      "Dishwasher",
      "Heating",
      "Bike Storage",
    ],
    currency: "EUR",
    price: { minimal: "110", maximal: "180" },
    type: { id: 1, name: "apartment" },
  },
  {
    id: 200001,
    name: "Trastevere Rooftop Terrace",
    location: {
      street: "Via della Lungaretta 42",
      zip: "00153",
      city: "Rome",
      country: "Italy",
      latitude: "41.8892",
      longitude: "12.4704",
    },
    timeZone: "Europe/Rome",
    rooms: {
      maxOccupancy: 4,
      bedrooms: 2,
      bathrooms: 1,
      doubleBeds: 1,
      singleBeds: 0,
      sofaBeds: 1,
      couches: 0,
      childBeds: 0,
      queenSizeBeds: 0,
      kingSizeBeds: 1,
    },
    equipments: [
      "WiFi",
      "Kitchen",
      "Air Conditioning",
      "Rooftop Terrace",
      "Washing Machine",
    ],
    currency: "EUR",
    price: { minimal: "140", maximal: "240" },
    type: { id: 1, name: "apartment" },
  },
  {
    id: 200002,
    name: "Jordaan Canal House",
    location: {
      street: "Prinsengracht 310",
      zip: "1016 HX",
      city: "Amsterdam",
      country: "Netherlands",
      latitude: "52.3728",
      longitude: "4.8832",
    },
    timeZone: "Europe/Amsterdam",
    rooms: {
      maxOccupancy: 3,
      bedrooms: 1,
      bathrooms: 1,
      doubleBeds: 0,
      singleBeds: 0,
      sofaBeds: 1,
      couches: 0,
      childBeds: 0,
      queenSizeBeds: 1,
      kingSizeBeds: 0,
    },
    equipments: [
      "WiFi",
      "Kitchen",
      "Heating",
      "Canal Views",
      "Bike Rental",
      "Washing Machine",
    ],
    currency: "EUR",
    price: { minimal: "160", maximal: "280" },
    type: { id: 1, name: "apartment" },
  },
  {
    id: 200003,
    name: "Gothic Quarter Hideaway",
    location: {
      street: "Carrer d'Avinyó 15",
      zip: "08002",
      city: "Barcelona",
      country: "Spain",
      latitude: "41.3807",
      longitude: "2.1764",
    },
    timeZone: "Europe/Madrid",
    rooms: {
      maxOccupancy: 2,
      bedrooms: 1,
      bathrooms: 1,
      doubleBeds: 1,
      singleBeds: 0,
      sofaBeds: 0,
      couches: 0,
      childBeds: 0,
      queenSizeBeds: 0,
      kingSizeBeds: 0,
    },
    equipments: ["WiFi", "Kitchen", "Air Conditioning", "Washing Machine"],
    currency: "EUR",
    price: { minimal: "95", maximal: "170" },
    type: { id: 1, name: "apartment" },
  },
];

/** Generate dates between start (inclusive) and end (exclusive). */
function dateRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const current = new Date(`${start}T12:00:00`);
  const last = new Date(`${end}T12:00:00`);
  while (current < last) {
    dates.push(current.toISOString().slice(0, 10));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

/** Check if a date range overlaps any existing booking for an apartment. */
function hasOverlap(
  apartmentId: number,
  arrival: string,
  departure: string
): boolean {
  return bookings.some(
    (b) =>
      b.apartmentId === apartmentId &&
      b.arrivalDate < departure &&
      b.departureDate > arrival
  );
}

/** Return the set of booked dates for an apartment. */
function bookedDatesFor(apartmentId: number): Set<string> {
  const dates = new Set<string>();
  for (const b of bookings) {
    if (b.apartmentId !== apartmentId) continue;
    for (const d of dateRange(b.arrivalDate, b.departureDate)) {
      dates.add(d);
    }
  }
  return dates;
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function log(method: string, path: string, detail?: string) {
  const ts = new Date().toLocaleTimeString();
  console.log(`[${ts}] ${method} ${path}${detail ? ` — ${detail}` : ""}`);
}

// ── Server ─────────────────────────────────────────────────────────────────
const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const { pathname } = url;

    // GET /api/me — Smoobu user verification
    if (req.method === "GET" && pathname === "/api/me") {
      const apiKey = req.headers.get("Api-Key");
      if (!apiKey) {
        log("GET", pathname, "missing Api-Key header");
        return jsonResponse(
          {
            status: 401,
            title: "Unauthorized",
            detail: "Missing Api-Key header",
          },
          401
        );
      }
      log("GET", pathname, `apiKey=${apiKey.slice(0, 8)}…`);
      return jsonResponse({
        id: 12345,
        firstName: "Mock",
        lastName: "Broker",
        email: "mock-broker@example.com",
      });
    }

    // GET /api/apartments — List all Smoobu apartments
    if (req.method === "GET" && pathname === "/api/apartments") {
      log("GET", pathname);
      return jsonResponse({
        apartments: MOCK_APARTMENTS,
      });
    }

    // POST /booking/checkApartmentAvailability
    if (
      req.method === "POST" &&
      pathname === "/booking/checkApartmentAvailability"
    ) {
      const body = (await req.json()) as {
        apartments?: number[];
        arrivalDate?: string;
        departureDate?: string;
      };
      const apartments = body.apartments ?? [];
      const arrival = body.arrivalDate ?? "";
      const departure = body.departureDate ?? "";

      const available: number[] = [];
      const prices: Record<string, { price: number; currency: string }> = {};
      const errorMessages: Record<
        string,
        {
          errorCode: number;
          message: string;
          minimumLengthOfStay?: number;
        }
      > = {};

      const nights = dateRange(arrival, departure).length;

      for (const id of apartments) {
        if (hasOverlap(id, arrival, departure)) {
          errorMessages[String(id)] = {
            errorCode: 0,
            message: "Not available for selected dates",
          };
        } else if (nights < MIN_LENGTH_OF_STAY) {
          errorMessages[String(id)] = {
            errorCode: 1,
            message: `Minimum length of stay is ${MIN_LENGTH_OF_STAY} nights`,
            minimumLengthOfStay: MIN_LENGTH_OF_STAY,
          };
        } else {
          available.push(id);
          prices[String(id)] = {
            price: PRICE_PER_NIGHT * nights,
            currency: "EUR",
          };
        }
      }

      log(
        "POST",
        pathname,
        `apartments=${apartments} → available=${available}`
      );
      return jsonResponse({
        availableApartments: available,
        prices,
        errorMessages,
      });
    }

    // GET /api/rates
    if (req.method === "GET" && pathname === "/api/rates") {
      const apartmentIds = url.searchParams.getAll("apartments[]").map(Number);
      const startDate = url.searchParams.get("start_date") ?? "";
      const endDate = url.searchParams.get("end_date") ?? "";
      const dates = dateRange(startDate, endDate);

      const data: Record<
        string,
        Record<
          string,
          { price: number; min_length_of_stay: number; available: number }
        >
      > = {};

      for (const id of apartmentIds) {
        const booked = bookedDatesFor(id);
        const rateMap: Record<
          string,
          { price: number; min_length_of_stay: number; available: number }
        > = {};
        for (const d of dates) {
          rateMap[d] = {
            price: PRICE_PER_NIGHT,
            min_length_of_stay: MIN_LENGTH_OF_STAY,
            available: booked.has(d) ? 0 : 1,
          };
        }
        data[String(id)] = rateMap;
      }

      log("GET", pathname, `apartments=${apartmentIds} dates=${dates.length}`);
      return jsonResponse({ data });
    }

    // GET /api/apartments/:id
    const apartmentMatch = pathname.match(/^\/api\/apartments\/(\d+)$/);
    if (req.method === "GET" && apartmentMatch) {
      const aptId = Number(apartmentMatch[1]);
      const apt = MOCK_APARTMENTS.find((a) => a.id === aptId);
      log("GET", pathname, apt ? apt.name : "unknown id — returning generic");

      if (apt) {
        const { id: _id, name: _name, ...details } = apt;
        return jsonResponse(details);
      }

      // Fallback for unknown IDs
      return jsonResponse({
        location: {
          street: "Mock Street 1",
          zip: "00000",
          city: "Mock City",
          country: "Mock Country",
          latitude: "0",
          longitude: "0",
        },
        timeZone: "Europe/Berlin",
        rooms: {
          maxOccupancy: 4,
          bedrooms: 2,
          bathrooms: 1,
          doubleBeds: 1,
          singleBeds: 0,
          sofaBeds: 0,
          couches: 0,
          childBeds: 0,
          queenSizeBeds: 0,
          kingSizeBeds: 0,
        },
        equipments: ["WiFi", "Kitchen"],
        currency: "EUR",
        price: { minimal: "150", maximal: "150" },
        type: { id: 1, name: "apartment" },
      });
    }

    // POST /api/reservations
    if (req.method === "POST" && pathname === "/api/reservations") {
      const body = (await req.json()) as {
        apartmentId?: number;
        arrivalDate?: string;
        departureDate?: string;
      };
      const id = nextBookingId++;
      if (body.apartmentId && body.arrivalDate && body.departureDate) {
        bookings.push({
          id,
          apartmentId: body.apartmentId,
          arrivalDate: body.arrivalDate,
          departureDate: body.departureDate,
        });
        log(
          "POST",
          pathname,
          `booking #${id} apt=${body.apartmentId} ${body.arrivalDate}→${body.departureDate}`
        );
      }
      return jsonResponse({ id });
    }

    // ── Mock Stripe webhook triggers ──────────────────────────────────────

    // POST /mock/trigger-webhook — raw: accepts { metadata, sessionId } and fires webhook
    if (req.method === "POST" && pathname === "/mock/trigger-webhook") {
      const body = (await req.json()) as {
        metadata?: Record<string, string>;
        sessionId?: string;
      };
      const metadata = body.metadata ?? {};
      const sessionId = body.sessionId ?? `cs_test_mock_${Date.now()}`;

      const fakeEvent = {
        id: `evt_test_mock_${Date.now()}`,
        object: "event",
        type: "checkout.session.completed",
        data: {
          object: {
            id: sessionId,
            payment_intent: `pi_test_mock_${Date.now()}`,
            metadata,
          },
        },
      };

      log(
        "POST",
        pathname,
        `firing webhook → ${ASTRO_ORIGIN}/api/stripe-webhook`
      );

      try {
        const res = await fetch(`${ASTRO_ORIGIN}/api/stripe-webhook`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(fakeEvent),
        });

        const resBody = await res.text();
        log("POST", pathname, `webhook responded ${res.status}`);
        return jsonResponse({
          webhookStatus: res.status,
          webhookBody: resBody,
        });
      } catch (err) {
        log("POST", pathname, `webhook fetch failed: ${err}`);
        return jsonResponse(
          { error: "Failed to reach Astro dev server", detail: String(err) },
          502
        );
      }
    }

    // POST /mock/complete-booking — convenience: simplified property booking
    if (req.method === "POST" && pathname === "/mock/complete-booking") {
      const body = (await req.json()) as {
        propertyId?: string;
        smoobuPropertyId?: string;
        userId?: string;
        checkIn?: string;
        checkOut?: string;
        guests?: number;
        currency?: string;
        totalPriceCents?: number;
        guestFirstName?: string;
        guestLastName?: string;
        guestEmail?: string;
        guestPhone?: string;
        adults?: number;
        children?: number;
        guestNote?: string;
      };

      const checkIn = body.checkIn ?? "2026-03-01";
      const checkOut = body.checkOut ?? "2026-03-04";
      const nights = dateRange(checkIn, checkOut).length;

      const metadata: Record<string, string> = {
        propertyId: body.propertyId ?? "mock-property-1",
        smoobuPropertyId: body.smoobuPropertyId ?? "0",
        userId: body.userId ?? "mock-user",
        checkIn,
        checkOut,
        nights: String(nights),
        guests: String(body.guests ?? 2),
        currency: body.currency ?? "eur",
        totalPriceCents: String(
          body.totalPriceCents ?? PRICE_PER_NIGHT * 100 * nights
        ),
        guestFirstName: body.guestFirstName ?? "Test",
        guestLastName: body.guestLastName ?? "Guest",
        guestEmail: body.guestEmail ?? "test@example.com",
        guestPhone: body.guestPhone ?? "",
        adults: String(body.adults ?? body.guests ?? 2),
        children: String(body.children ?? 0),
        guestNote: body.guestNote ?? "",
      };

      const triggerRes = await fetch(
        `http://localhost:${PORT}/mock/trigger-webhook`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ metadata }),
        }
      );

      const result = await triggerRes.json();
      log("POST", pathname, `property booking → webhook ${triggerRes.status}`);
      return jsonResponse(result, triggerRes.status);
    }

    // POST /mock/trigger-refund-webhook — fire a charge.refunded event
    if (req.method === "POST" && pathname === "/mock/trigger-refund-webhook") {
      const body = (await req.json()) as {
        paymentIntentId?: string;
        amount?: number;
      };
      const paymentIntentId =
        body.paymentIntentId ?? `pi_test_mock_${Date.now()}`;

      const fakeEvent = {
        id: `evt_test_refund_${Date.now()}`,
        object: "event",
        type: "charge.refunded",
        data: {
          object: {
            payment_intent: paymentIntentId,
            refunded: true,
            amount_refunded: body.amount ?? 10000,
          },
        },
      };

      log(
        "POST",
        pathname,
        `firing charge.refunded → ${ASTRO_ORIGIN}/api/stripe-webhook`
      );

      try {
        const res = await fetch(`${ASTRO_ORIGIN}/api/stripe-webhook`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(fakeEvent),
        });

        const resBody = await res.text();
        log("POST", pathname, `webhook responded ${res.status}`);
        return jsonResponse({
          webhookStatus: res.status,
          webhookBody: resBody,
        });
      } catch (err) {
        log("POST", pathname, `webhook fetch failed: ${err}`);
        return jsonResponse(
          { error: "Failed to reach Astro dev server", detail: String(err) },
          502
        );
      }
    }

    // DELETE /api/reservations/:id — mock Smoobu reservation cancellation
    const reservationDeleteMatch = pathname.match(
      /^\/api\/reservations\/(\d+)$/
    );
    if (req.method === "DELETE" && reservationDeleteMatch) {
      const resId = Number(reservationDeleteMatch[1]);
      const idx = bookings.findIndex((b) => b.id === resId);
      if (idx !== -1) {
        bookings.splice(idx, 1);
        log("DELETE", pathname, `reservation #${resId} removed`);
      } else {
        log("DELETE", pathname, `reservation #${resId} not found (OK)`);
      }
      return jsonResponse({ success: true });
    }

    // POST /mock/complete-experience — convenience: simplified experience booking
    if (req.method === "POST" && pathname === "/mock/complete-experience") {
      const body = (await req.json()) as {
        experienceId?: string;
        userId?: string;
        bookingDate?: string;
        participants?: number;
        currency?: string;
        totalPriceCents?: number;
        guestFirstName?: string;
        guestLastName?: string;
        guestEmail?: string;
        guestPhone?: string;
        guestNote?: string;
      };

      const metadata: Record<string, string> = {
        type: "experience",
        experienceId: body.experienceId ?? "mock-experience-1",
        userId: body.userId ?? "mock-user",
        bookingDate: body.bookingDate ?? "2026-03-01",
        participants: String(body.participants ?? 2),
        currency: body.currency ?? "eur",
        totalPriceCents: String(body.totalPriceCents ?? 5000),
        guestFirstName: body.guestFirstName ?? "Test",
        guestLastName: body.guestLastName ?? "Guest",
        guestEmail: body.guestEmail ?? "test@example.com",
        guestPhone: body.guestPhone ?? "",
        guestNote: body.guestNote ?? "",
      };

      const triggerRes = await fetch(
        `http://localhost:${PORT}/mock/trigger-webhook`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ metadata }),
        }
      );

      const result = await triggerRes.json();
      log(
        "POST",
        pathname,
        `experience booking → webhook ${triggerRes.status}`
      );
      return jsonResponse(result, triggerRes.status);
    }

    log(req.method, pathname, "404");
    return jsonResponse({ error: "Not found" }, 404);
  },
});

console.log(`Mock Smoobu API running on http://localhost:${server.port}`);
console.log(`  Price: ${PRICE_PER_NIGHT} EUR/night (min stay: ${MIN_LENGTH_OF_STAY} nights)`);
console.log(`  Bookings in memory: ${bookings.length}`);
console.log(
  `  Apartments: ${MOCK_APARTMENTS.map((a) => `${a.id} (${a.name})`).join(", ")}`
);
console.log();
console.log("Smoobu API endpoints:");
console.log(
  `  GET  http://localhost:${PORT}/api/me                                  — verify API key`
);
console.log(
  `  GET  http://localhost:${PORT}/api/apartments                           — list apartments`
);
console.log(
  `  GET  http://localhost:${PORT}/api/apartments/:id                       — apartment details`
);
console.log(
  `  GET  http://localhost:${PORT}/api/rates                                — rates`
);
console.log(
  `  POST http://localhost:${PORT}/booking/checkApartmentAvailability       — availability`
);
console.log(
  `  POST http://localhost:${PORT}/api/reservations                         — create booking`
);
console.log();
console.log("Mock helper endpoints:");
console.log(
  `  POST http://localhost:${PORT}/mock/trigger-webhook         — raw metadata`
);
console.log(
  `  POST http://localhost:${PORT}/mock/complete-booking        — property booking`
);
console.log(
  `  POST http://localhost:${PORT}/mock/complete-experience     — experience booking`
);
console.log(
  `  POST http://localhost:${PORT}/mock/trigger-refund-webhook  — charge.refunded`
);
