import { BookingsList } from "@/features/broker/bookings/ui/BookingsList";
import { rootRoute } from "@/features/broker/property/routes/BackofficeRoot";
import { createRoute } from "@tanstack/react-router";

export const bookingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/bookings",
  component: BookingsList,
});
