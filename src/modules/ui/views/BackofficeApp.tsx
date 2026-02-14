import { experiencesRoute } from "@/features/broker/experience/routes/experiences";
import { editExperienceRoute } from "@/features/broker/experience/routes/experiences.$id.edit";
import { createExperienceRoute } from "@/features/broker/experience/routes/experiences.new";
import { createPropertyRoute } from "@/features/broker/pms/routes/createProperty";
import { rootRoute } from "@/features/broker/property/routes/BackofficeRoot";
import { createSectionRoute } from "@/features/broker/property/routes/createSection";
import { indexRoute } from "@/features/broker/property/routes/index";
import { propertiesRoute } from "@/features/broker/property/routes/properties";
import { editPropertyRoute } from "@/features/broker/property/routes/properties.$id.edit";
import { RouterProvider, createRouter } from "@tanstack/react-router";

const routeTree = rootRoute.addChildren([
  indexRoute,
  propertiesRoute,
  editPropertyRoute,
  createSectionRoute.addChildren([createPropertyRoute]),
  experiencesRoute,
  editExperienceRoute,
  createExperienceRoute,
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

export default function BackofficeApp() {
  return <RouterProvider router={router} />;
}
