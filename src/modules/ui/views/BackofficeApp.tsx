import type { Locale } from "@/i18n/types";
import { LocaleProvider } from "@/i18n/react/LocaleProvider";
import { eventsRoute } from "@/features/admin/events/routes/events";
import { settingsRoute } from "@/features/admin/settings/routes/settings";
import { bookingsRoute } from "@/features/broker/bookings/routes/bookings";
import { connectRoute } from "@/features/broker/connect/routes/connect";
import { integrationsRoute } from "@/features/broker/pms/routes/integrations";
import { experiencesRoute } from "@/features/broker/experience/routes/experiences";
import { editExperienceRoute } from "@/features/broker/experience/routes/experiences.$id.edit";
import { createExperienceRoute } from "@/features/broker/experience/routes/experiences.new";
import { createPropertyRoute } from "@/features/broker/pms/routes/createProperty";
import { rootRoute } from "@/features/broker/property/routes/BackofficeRoot";
import { createSectionRoute } from "@/features/broker/property/routes/CreateSection";
import { indexRoute } from "@/features/broker/property/routes/index";
import { propertiesRoute } from "@/features/broker/property/routes/properties";
import { editPropertyRoute } from "@/features/broker/property/routes/properties.$id.edit";
import { ClerkProviderWrapper } from "@/modules/auth/ui/ClerkProviderWrapper";
import { RouterProvider, createRouter } from "@tanstack/react-router";

const routeTree = rootRoute.addChildren([
  indexRoute,
  propertiesRoute,
  editPropertyRoute,
  createSectionRoute.addChildren([createPropertyRoute]),
  experiencesRoute,
  editExperienceRoute,
  createExperienceRoute,
  eventsRoute,
  settingsRoute,
  bookingsRoute,
  connectRoute,
  integrationsRoute,
]);

const router = createRouter({
  routeTree,
  basepath: "/backoffice",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

type BackofficeAppProps = {
  locale?: Locale;
};

export default function BackofficeApp({ locale = "en" }: BackofficeAppProps) {
  return (
    <ClerkProviderWrapper locale={locale}>
      <LocaleProvider locale={locale}>
        <RouterProvider router={router} />
      </LocaleProvider>
    </ClerkProviderWrapper>
  );
}
