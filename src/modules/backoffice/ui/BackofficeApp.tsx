import { rootRoute } from "@/modules/backoffice/routes/BackofficeRoot";
import { indexRoute } from "@/modules/backoffice/routes/index";
import { propertiesRoute } from "@/modules/backoffice/routes/properties";
import { editPropertyRoute } from "@/modules/backoffice/routes/properties.$id.edit";
import { pricingManagementRoute } from "@/modules/backoffice/routes/properties.$id.pricing";
import { createPropertyRoute } from "@/modules/backoffice/routes/properties.new";
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
