import { PlatformSettingsView } from "@/features/admin/settings/ui/PlatformSettingsView";
import { rootRoute } from "@/features/broker/property/routes/BackofficeRoot";
import { createRoute } from "@tanstack/react-router";

export const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/settings",
  component: PlatformSettingsView,
});
