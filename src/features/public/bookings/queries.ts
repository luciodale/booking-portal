import type * as schema from "@/db/schema";
import { assets, bookings, images } from "@/db/schema";
import { generateImageUrl } from "@/modules/r2/r2-helpers";
import { formatLocation } from "@/utils/formatLocation";
import { and, eq } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";

type Db = DrizzleD1Database<typeof schema>;

export type BookingDetail = {
  id: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  baseTotal: number;
  cleaningFee: number;
  serviceFee: number;
  totalPrice: number;
  currency: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  guestNote: string | null;
  createdAt: string | null;
  property: {
    id: string;
    title: string;
    city: string | null;
    tier: "elite" | "standard";
    location: string;
    imageUrl: string;
  };
};

export async function fetchBookingById(
  db: Db,
  bookingId: string,
  userId: string
): Promise<BookingDetail | null> {
  const [row] = await db
    .select({
      id: bookings.id,
      checkIn: bookings.checkIn,
      checkOut: bookings.checkOut,
      nights: bookings.nights,
      guests: bookings.guests,
      baseTotal: bookings.baseTotal,
      cleaningFee: bookings.cleaningFee,
      serviceFee: bookings.serviceFee,
      totalPrice: bookings.totalPrice,
      currency: bookings.currency,
      status: bookings.status,
      guestNote: bookings.guestNote,
      createdAt: bookings.createdAt,
      propertyId: assets.id,
      propertyTitle: assets.title,
      propertyCity: assets.city,
      propertyTier: assets.tier,
      propertyCountry: assets.country,
    })
    .from(bookings)
    .innerJoin(assets, eq(bookings.assetId, assets.id))
    .where(and(eq(bookings.id, bookingId), eq(bookings.userId, userId)))
    .limit(1);

  if (!row) return null;

  const [primaryImg] = await db
    .select({ r2Key: images.r2Key })
    .from(images)
    .where(and(eq(images.assetId, row.propertyId), eq(images.isPrimary, true)))
    .limit(1);

  return {
    id: row.id,
    checkIn: row.checkIn,
    checkOut: row.checkOut,
    nights: row.nights,
    guests: row.guests,
    baseTotal: row.baseTotal,
    cleaningFee: row.cleaningFee,
    serviceFee: row.serviceFee,
    totalPrice: row.totalPrice,
    currency: row.currency,
    status: row.status,
    guestNote: row.guestNote,
    createdAt: row.createdAt,
    property: {
      id: row.propertyId,
      title: row.propertyTitle,
      city: row.propertyCity,
      tier: row.propertyTier,
      location: formatLocation({ city: row.propertyCity, country: row.propertyCountry }),
      imageUrl: primaryImg ? generateImageUrl(primaryImg.r2Key) : "",
    },
  };
}
