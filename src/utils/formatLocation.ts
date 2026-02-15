export function formatLocation(data: {
  city?: string | null;
  country?: string | null;
}): string {
  const base = [data.city, data.country].filter(Boolean).join(", ");
  if (!base) return "Location TBD";
  return base;
}

export function formatAddress(data: {
  street?: string | null;
  zip?: string | null;
  city?: string | null;
  country?: string | null;
  showFullAddress?: boolean;
}): string {
  if (data.showFullAddress && data.street) {
    return [data.street, data.zip, data.city].filter(Boolean).join(", ");
  }
  return data.city ?? "Location TBD";
}
