/**
 * Map Smoobu listing (list item + details) to partial CreatePropertyInput for form prefill.
 */

import { getDefaultIcon } from "@/modules/constants";
import type { CreatePropertyInput } from "@/schemas/property";
import type { SmoobuApartmentDetails } from "@/schemas/smoobu";
import { displayToKebab } from "./sync-features";

export function mapSmoobuListingToCreatePropertyPartial(
  listItem: { id: number; name: string },
  details: SmoobuApartmentDetails
): Partial<CreatePropertyInput> {
  const { location, rooms, equipments } = details;
  const partial: Partial<CreatePropertyInput> = {
    smoobuPropertyId: listItem.id,
    title: listItem.name,
    street: location.street || undefined,
    zip: location.zip || undefined,
    city: location.city || undefined,
    country: location.country || undefined,
    latitude: location.latitude || undefined,
    longitude: location.longitude || undefined,
    maxOccupancy: rooms.maxOccupancy,
    bedrooms: rooms.bedrooms,
    bathrooms: rooms.bathrooms,
    doubleBeds: rooms.doubleBeds ?? undefined,
    singleBeds: rooms.singleBeds ?? undefined,
    sofaBeds: rooms.sofaBeds ?? undefined,
    couches: rooms.couches ?? undefined,
    childBeds: rooms.childBeds ?? undefined,
    queenSizeBeds: rooms.queenSizeBeds ?? undefined,
    kingSizeBeds: rooms.kingSizeBeds ?? undefined,
    amenities: equipments?.map((e) => {
      const kebab = displayToKebab(e);
      return { name: kebab, icon: getDefaultIcon(kebab, "amenity") ?? "check" };
    }),
  };
  return partial;
}
