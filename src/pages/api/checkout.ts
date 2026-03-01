import { getDb } from "@/db";
import { assets, cityTaxDefaults, pmsIntegrations } from "@/db/schema";
import { getApplicationFeePercent } from "@/features/admin/settings/domain/getApplicationFeePercent";
import { resolveConnectAccount } from "@/features/broker/connect/domain/resolveConnectAccount";
import { fetchSmoobuRates } from "@/features/broker/pms/integrations/smoobu/server-service/GETRates";
import { checkSmoobuAvailability } from "@/features/broker/pms/integrations/smoobu/server-service/POSTCheckAvailability";
import { safeErrorMessage } from "@/features/broker/property/api/server-handler/responseHelpers";
import {
  computeExtrasTotal,
  computePropertyAdditionalCosts,
} from "@/features/public/booking/domain/computeAdditionalCosts";
import { computePaymentSplit } from "@/features/public/booking/domain/computePaymentSplit";
import { multiplyCents, sumCents, toCents } from "@/modules/money/money";
import { localePath } from "@/i18n/locale-path";
import { getRequestLocale } from "@/i18n/request-locale";
import { t } from "@/i18n/t";
import type { Locale } from "@/i18n/types";
import { isItalyCountry } from "@/modules/countries";
import { requireAuth } from "@/modules/auth/auth";
import { createEventLogger } from "@/modules/logging/eventLogger";
import type { APIRoute } from "astro";
import { and, eq } from "drizzle-orm";
import Stripe from "stripe";
import { z } from "zod";

const checkoutBodySchema = z.object({
  propertyId: z.string().min(1),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guests: z.number().int().min(1),
  currency: z.string().min(1),
  nightPriceCents: z.record(z.string(), z.number().int().nonnegative()),
  cityTaxCents: z.number().int().nonnegative(),
  selectedExtraIndices: z.array(z.number().int().min(0)).default([]),
  guestInfo: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
    adults: z.number().int().min(1),
    children: z.number().int().min(0),
    guestNote: z.string().optional(),
  }),
  locale: z.string().optional(),
});

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const authContext = requireAuth(locals);

    const D1Database = locals.runtime?.env?.DB;
    if (!D1Database)
      return jsonResponse({ error: "Database not available" }, 503);

    const stripeKey = locals.runtime?.env?.STRIPE_SECRET_KEY;
    if (!stripeKey)
      return jsonResponse({ error: "Stripe not configured" }, 503);

    const log = createEventLogger(D1Database);

    const body = checkoutBodySchema.safeParse(await request.json());
    if (!body.success) {
      return jsonResponse(
        { error: "Invalid request", details: body.error.issues },
        400
      );
    }

    const {
      propertyId,
      checkIn,
      checkOut,
      guests,
      currency,
      nightPriceCents,
      cityTaxCents,
      selectedExtraIndices,
      guestInfo,
      locale: bodyLocale,
    } = body.data;
    const locale: Locale = (bodyLocale as Locale) ?? getRequestLocale(request);
    const db = getDb(D1Database);

    // Fetch asset + integration
    const [asset] = await db
      .select()
      .from(assets)
      .where(eq(assets.id, propertyId))
      .limit(1);

    if (!asset || !asset.smoobuPropertyId) {
      return jsonResponse({ error: t(locale, "error.propertyNotFound") }, 404);
    }

    if (!isItalyCountry(asset.country)) {
      return jsonResponse({ error: t(locale, "error.instantBookNotAvailable") }, 403);
    }

    const [integration] = await db
      .select()
      .from(pmsIntegrations)
      .where(eq(pmsIntegrations.userId, asset.userId))
      .limit(1);

    if (
      !integration ||
      integration.provider !== "smoobu" ||
      !integration.pmsUserId
    ) {
      return jsonResponse({ error: t(locale, "error.noPmsIntegration") }, 404);
    }

    // Verify broker has completed Stripe Connect onboarding
    const connectedAccountId = await resolveConnectAccount(db, asset.userId);
    if (!connectedAccountId) {
      return jsonResponse(
        { error: "This property's host hasn't set up payouts yet" },
        400
      );
    }

    // Re-verify availability server-side
    const availability = await checkSmoobuAvailability(integration.apiKey, {
      arrivalDate: checkIn,
      departureDate: checkOut,
      apartments: [asset.smoobuPropertyId],
      customerId: integration.pmsUserId,
      guests,
    });

    if (!availability.availableApartments.includes(asset.smoobuPropertyId)) {
      const errorInfo =
        availability.errorMessages[String(asset.smoobuPropertyId)];

      if (errorInfo?.errorCode === 1 && errorInfo.minimumLengthOfStay) {
        log.error({
          source: "checkout",
          message: `Minimum stay violation for property ${propertyId}: requires ${errorInfo.minimumLengthOfStay} nights`,
          metadata: { propertyId, checkIn, checkOut, guests },
        });
        return jsonResponse(
          {
            error: t(locale, "error.minStay", {
              nights: errorInfo.minimumLengthOfStay,
            }),
          },
          400
        );
      }

      if (errorInfo?.errorCode === 2) {
        log.error({
          source: "checkout",
          message: `Max occupancy exceeded for property ${propertyId}: ${guests} guests, max ${errorInfo.numberOfGuest ?? "?"}`,
          metadata: {
            propertyId,
            checkIn,
            checkOut,
            guests,
            maxGuests: errorInfo.numberOfGuest,
          },
        });
        return jsonResponse(
          {
            error: t(locale, "error.maxGuests", {
              count: errorInfo.numberOfGuest ?? guests,
            }),
          },
          400
        );
      }

      log.error({
        source: "checkout",
        message: `Availability conflict for property ${propertyId} (${checkIn} - ${checkOut})`,
        metadata: { propertyId, checkIn, checkOut, guests },
      });
      return jsonResponse(
        { error: t(locale, "error.propertyNotAvailable") },
        409
      );
    }

    // Compute nights
    const checkInDate = new Date(`${checkIn}T00:00:00`);
    const checkOutDate = new Date(`${checkOut}T00:00:00`);
    const nights = Math.round(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Validate client sent correct number of nights
    const clientDates = Object.keys(nightPriceCents).sort();
    if (clientDates.length !== nights) {
      return jsonResponse(
        {
          error: t(locale, "error.nightPriceMismatch", {
            expected: nights,
            received: clientDates.length,
          }),
        },
        400
      );
    }

    // Verify price integrity: compare each night's price against Smoobu rates
    const propId = String(asset.smoobuPropertyId);
    const ratesResponse = await fetchSmoobuRates(
      integration.apiKey,
      asset.smoobuPropertyId,
      checkIn,
      checkOut
    );
    const rateMap = ratesResponse.data[propId] ?? {};

    // Belt-and-suspenders: check min_length_of_stay from rates data
    const minStayValues = clientDates
      .map((date) => rateMap[date]?.min_length_of_stay)
      .filter((v): v is number => v != null);

    if (minStayValues.length > 0) {
      const maxMinStay = Math.max(...minStayValues);
      if (nights < maxMinStay) {
        return jsonResponse(
          {
            error: t(locale, "error.minStay", { nights: maxMinStay }),
          },
          400
        );
      }
    } else {
      log.warn({
        source: "checkout",
        message: `All min_length_of_stay values are null for property ${propertyId} (${checkIn} - ${checkOut})`,
        metadata: { propertyId, checkIn, checkOut },
      });
    }

    let serverPriceCents = 0;
    for (const date of clientDates) {
      const serverRate = rateMap[date];
      const clientCents = nightPriceCents[date];

      if (serverRate?.price == null || clientCents == null) {
        return jsonResponse(
          { error: t(locale, "error.unableToComputePrice") },
          400
        );
      }

      const serverCents = toCents(serverRate.price);
      if (serverCents !== clientCents) {
        log.error({
          source: "checkout",
          message: `Night price mismatch for ${date}: client=${clientCents}¢, server=${serverCents}¢`,
          metadata: { propertyId, date, clientCents, serverCents },
        });
        return jsonResponse({ error: t(locale, "error.priceChanged") }, 409);
      }
      serverPriceCents += serverCents;
    }

    // Compute additional costs server-side
    const additionalCostItems = computePropertyAdditionalCosts(
      asset.additionalCosts ?? null,
      { nights, guests, currency: currency.toLowerCase() }
    );
    const additionalTotalCents = sumCents(
      additionalCostItems.map((item) => item.amountCents)
    );

    // Compute extras server-side
    const extrasItems =
      asset.extras && selectedExtraIndices.length > 0
        ? computeExtrasTotal(asset.extras, selectedExtraIndices, {
            nights,
            guests,
            currency: currency.toLowerCase(),
          })
        : [];
    const extrasTotalCents = sumCents(
      extrasItems.map((item) => item.amountCents)
    );

    // Compute city tax server-side
    const [cityTaxRow] = await db
      .select()
      .from(cityTaxDefaults)
      .where(
        and(
          eq(cityTaxDefaults.userId, asset.userId),
          eq(cityTaxDefaults.city, asset.city ?? ""),
          eq(cityTaxDefaults.country, asset.country ?? "")
        )
      )
      .limit(1);

    const serverCityTaxCents =
      cityTaxRow && cityTaxRow.amount > 0
        ? multiplyCents(
            multiplyCents(
              cityTaxRow.amount,
              Math.min(nights, cityTaxRow.maxNights ?? nights)
            ),
            guests
          )
        : 0;

    if (cityTaxCents !== serverCityTaxCents) {
      log.error({
        source: "checkout",
        message: `City tax mismatch: client=${cityTaxCents}¢, server=${serverCityTaxCents}¢`,
        metadata: { propertyId, cityTaxCents, serverCityTaxCents },
      });
      return jsonResponse({ error: t(locale, "error.cityTaxChanged") }, 409);
    }

    // Compute payment split with proper fee base and withholding
    const feePercent = await getApplicationFeePercent(db, asset.userId);

    const split = computePaymentSplit({
      nightlyTotalCents: serverPriceCents,
      additionalCostsCents: additionalTotalCents,
      extrasCents: extrasTotalCents,
      cityTaxCents: serverCityTaxCents,
      feePercent,
      withholdingPercent: 21,
    });

    const origin = new URL(request.url).origin;

    const metadata = {
      propertyId,
      smoobuPropertyId: propId,
      userId: authContext.userId,
      checkIn,
      checkOut,
      nights: String(nights),
      guests: String(guests),
      currency: currency.toLowerCase(),
      totalPriceCents: String(split.guestTotalCents),
      nightlyTotalCents: String(serverPriceCents),
      additionalCostsCents: String(additionalTotalCents),
      extrasCents: String(extrasTotalCents),
      cityTaxCents: String(serverCityTaxCents),
      platformFeeCents: String(split.platformFeeCents),
      withholdingTaxCents: String(split.withholdingTaxCents),
      applicationFeeCents: String(split.applicationFeeCents),
      guestNote: guestInfo.guestNote ?? "",
      guestFirstName: guestInfo.firstName,
      guestLastName: guestInfo.lastName,
      guestEmail: guestInfo.email,
      guestPhone: guestInfo.phone ?? "",
      adults: String(guestInfo.adults),
      children: String(guestInfo.children),
    };

    const stripe = new Stripe(stripeKey);

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price_data: {
          currency: currency.toLowerCase(),
          unit_amount: serverPriceCents,
          product_data: {
            name: asset.title,
            description: `${nights} night${nights !== 1 ? "s" : ""} · ${checkIn} to ${checkOut}`,
          },
        },
        quantity: 1,
      },
      ...additionalCostItems.map((item) => ({
        price_data: {
          currency: currency.toLowerCase(),
          unit_amount: item.amountCents,
          product_data: {
            name: item.label,
            ...(item.detail ? { description: item.detail } : {}),
          },
        },
        quantity: 1,
      })),
      ...extrasItems.map((item) => ({
        price_data: {
          currency: currency.toLowerCase(),
          unit_amount: item.amountCents,
          product_data: {
            name: `Extra: ${item.label}`,
            ...(item.detail ? { description: item.detail } : {}),
          },
        },
        quantity: 1,
      })),
      ...(serverCityTaxCents > 0
        ? [
            {
              price_data: {
                currency: currency.toLowerCase(),
                unit_amount: serverCityTaxCents,
                product_data: {
                  name: `City Tax (${asset.city ?? "local"})`,
                },
              },
              quantity: 1,
            },
          ]
        : []),
    ];

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: guestInfo.email,
      line_items: lineItems,
      metadata,
      payment_intent_data: {
        application_fee_amount: split.applicationFeeCents,
        on_behalf_of: connectedAccountId,
        transfer_data: {
          destination: connectedAccountId,
        },
      },
      success_url: `${origin}${localePath(locale, "/booking/success")}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}${localePath(locale, `/elite/${propertyId}`)}`,
    });

    log.info({
      source: "checkout",
      message: "Checkout session created",
      metadata: { propertyId, stripeSessionId: session.id },
    });

    return jsonResponse({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    const locale: Locale = getRequestLocale(request);
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonResponse({ error: t(locale, "error.signInRequired") }, 401);
    }
    const D1 = locals.runtime?.env?.DB;
    if (D1) {
      createEventLogger(D1).error({
        source: "checkout",
        message: `Checkout failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        metadata: {
          error: error instanceof Error ? error.message : String(error),
        },
      });
    }
    return jsonResponse(
      { error: safeErrorMessage(error, t(locale, "error.checkoutFailed")) },
      500
    );
  }
};
