import type { BackofficeBooking } from "@/features/broker/bookings/api/client-server/queryBookings";
import {
  useBackofficeBookings,
  useCancelBooking,
} from "@/features/broker/bookings/hooks/useBackofficeBookings";
import { queryProperties } from "@/features/broker/property/api/client-server/queryProperties";
import { cn } from "@/modules/utils/cn";
import { SearchableDropdown } from "@luciodale/react-searchable-dropdown";
import type { TObjectDropdownOption } from "@luciodale/react-searchable-dropdown";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

const STATUS_STYLES: Record<string, string> = {
  confirmed: "bg-success/20 text-success",
  cancelled: "bg-error/20 text-error",
  pending: "bg-warning/20 text-warning",
  completed: "bg-primary/20 text-primary",
};

const ALL_PROPERTIES_OPTION: TObjectDropdownOption = {
  label: "All Properties",
  value: "",
};

function formatCents(cents: number, currency: string) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

function usePropertyOptions() {
  const { data } = useQuery({
    queryKey: ["backoffice", "properties"],
    queryFn: () => queryProperties(),
  });

  const options: TObjectDropdownOption[] = [ALL_PROPERTIES_OPTION];
  if (data?.properties) {
    for (const p of data.properties) {
      options.push({ label: p.title, value: p.id });
    }
  }

  return options;
}

function PricingBreakdown({ booking }: { booking: BackofficeBooking }) {
  const fmt = (cents: number) => formatCents(cents, booking.currency);
  const hostPayout =
    booking.totalPrice -
    booking.platformFeeCents -
    booking.withholdingTaxCents;

  return (
    <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm py-3 px-6 max-w-md">
      <span className="text-muted-foreground">Nightly total</span>
      <span className="text-foreground text-right">{fmt(booking.baseTotal)}</span>

      {booking.additionalCostsCents > 0 && (
        <>
          <span className="text-muted-foreground">Additional costs</span>
          <span className="text-foreground text-right">{fmt(booking.additionalCostsCents)}</span>
        </>
      )}

      {booking.extrasCents > 0 && (
        <>
          <span className="text-muted-foreground">Extras</span>
          <span className="text-foreground text-right">{fmt(booking.extrasCents)}</span>
        </>
      )}

      {booking.cityTaxCents > 0 && (
        <>
          <span className="text-muted-foreground">City tax</span>
          <span className="text-foreground text-right">{fmt(booking.cityTaxCents)}</span>
        </>
      )}

      <div className="col-span-2 border-t border-border my-1" />

      <span className="text-muted-foreground">Guest total</span>
      <span className="text-foreground font-medium text-right">{fmt(booking.totalPrice)}</span>

      {booking.platformFeeCents > 0 && (
        <>
          <span className="text-muted-foreground">Platform fee</span>
          <span className="text-error text-right">-{fmt(booking.platformFeeCents)}</span>
        </>
      )}

      {booking.withholdingTaxCents > 0 && (
        <>
          <span className="text-muted-foreground">Withholding tax</span>
          <span className="text-error text-right">-{fmt(booking.withholdingTaxCents)}</span>
        </>
      )}

      <div className="col-span-2 border-t border-border my-1" />

      <span className="text-muted-foreground font-medium">Host payout</span>
      <span className="text-foreground font-medium text-right">{fmt(hostPayout)}</span>
    </div>
  );
}

function CancelButton({ booking }: { booking: BackofficeBooking }) {
  const [confirming, setConfirming] = useState(false);
  const cancelMutation = useCancelBooking();

  if (booking.status !== "confirmed") return null;

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-error text-white hover:bg-error/90 transition-colors disabled:opacity-50"
          disabled={cancelMutation.isPending}
          onClick={() =>
            cancelMutation.mutate(booking.id, {
              onSettled: () => setConfirming(false),
            })
          }
        >
          {cancelMutation.isPending ? "Cancelling..." : "Confirm"}
        </button>
        <button
          type="button"
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
          disabled={cancelMutation.isPending}
          onClick={() => setConfirming(false)}
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-error/10 text-error hover:bg-error/20 transition-colors"
      onClick={() => setConfirming(true)}
    >
      Cancel
    </button>
  );
}

function useBookingsFilters() {
  const [selectedProperty, setSelectedProperty] =
    useState<TObjectDropdownOption>(ALL_PROPERTIES_OPTION);

  const propertyId = selectedProperty.value || undefined;
  const { data, isLoading, error } = useBackofficeBookings({ propertyId });
  const propertyOptions = usePropertyOptions();

  return {
    selectedProperty,
    setSelectedProperty,
    propertyOptions,
    data,
    isLoading,
    error,
  };
}

function BookingRow({ booking }: { booking: BackofficeBooking }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr
        className="hover:bg-secondary/50 transition-colors cursor-pointer"
        onClick={() => setExpanded((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setExpanded((prev) => !prev);
          }
        }}
      >
        <td className="px-6 py-4">
          <div className="flex items-center gap-2">
            <ChevronRight
              className={cn(
                "w-4 h-4 shrink-0 text-muted-foreground transition-transform",
                expanded && "rotate-90"
              )}
            />
            <div>
              <div className="text-sm font-medium text-foreground">
                {booking.guestName ?? "\u2014"}
              </div>
              <div className="text-xs text-muted-foreground">
                {booking.guestEmail}
              </div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 text-sm text-foreground max-w-[200px] truncate">
          {booking.propertyTitle}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
          {booking.checkIn}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
          {booking.checkOut}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span
            className={cn(
              "px-2.5 py-1 inline-flex text-xs leading-5 font-medium rounded-full",
              STATUS_STYLES[booking.status]
            )}
          >
            {booking.status}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
          {formatCents(booking.totalPrice, booking.currency)}
        </td>
        <td
          className="px-6 py-4 whitespace-nowrap"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <CancelButton booking={booking} />
        </td>
      </tr>
      {expanded && (
        <tr className="bg-secondary/30">
          <td colSpan={7}>
            <PricingBreakdown booking={booking} />
          </td>
        </tr>
      )}
    </>
  );
}

export function BookingsList() {
  const {
    selectedProperty,
    setSelectedProperty,
    propertyOptions,
    data,
    isLoading,
    error,
  } = useBookingsFilters();

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Bookings</h1>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="w-72">
          <SearchableDropdown
            options={propertyOptions}
            value={selectedProperty}
            setValue={setSelectedProperty}
            searchOptionKeys={["label"]}
            placeholder="Filter by property..."
            classNameSearchableDropdownContainer="relative"
            classNameSearchQueryInput="input pr-9"
            classNameDropdownOptions="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden"
            classNameDropdownOption="px-3 py-2 text-sm text-foreground cursor-pointer"
            classNameDropdownOptionFocused="bg-secondary"
            classNameDropdownOptionNoMatch="px-3 py-2 text-sm text-muted-foreground"
            DropdownIcon={({ toggled }: { toggled: boolean }) => (
              <ChevronDown
                className={cn("w-4 h-4 shrink-0 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-transform", toggled && "rotate-180")}
              />
            )}
          />
        </div>
      </div>

      {error && (
        <div className="bg-error/10 border border-error/20 rounded-lg p-4 mb-6">
          <p className="text-error text-sm">
            Failed to load bookings: {error.message}
          </p>
        </div>
      )}

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-secondary">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Guest
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Property
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Check-in
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Check-out
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-12 text-center text-muted-foreground"
                >
                  Loading bookings...
                </td>
              </tr>
            ) : !data || data.bookings.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-12 text-center text-muted-foreground"
                >
                  No bookings found.
                </td>
              </tr>
            ) : (
              data.bookings.map((booking) => (
                <BookingRow key={booking.id} booking={booking} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
