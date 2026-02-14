import { rootRoute } from "@/features/broker/property/routes/BackofficeRoot";
import { EventLogList } from "@/features/admin/events/ui/EventLogList";
import { createRoute } from "@tanstack/react-router";

export const eventsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/events",
  component: EventLogList,
});
