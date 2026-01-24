import { rootRoute } from "@/modules/property/routes/BackofficeRoot";
import { indexRoute } from "@/modules/property/routes/index";
import { propertiesRoute } from "@/modules/property/routes/properties";
import { editPropertyRoute } from "@/modules/property/routes/properties.$id.edit";
import { pricingManagementRoute } from "@/modules/property/routes/properties.$id.pricing";
import { createPropertyRoute } from "@/modules/property/routes/properties.new";
import { RouterProvider, createRouter } from "@tanstack/react-router";

const routeTree = rootRoute.addChildren([
  indexRoute,
  propertiesRoute,
  createPropertyRoute,
  editPropertyRoute,
  pricingManagementRoute,
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
