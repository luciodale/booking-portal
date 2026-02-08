import { brokenRoute } from "@/features/broker/property/routes/broken";
import { rootRoute } from "@/features/broker/property/routes/BackofficeRoot";
import { indexRoute } from "@/features/broker/property/routes/index";
import { propertiesRoute } from "@/features/broker/property/routes/properties";
import { editPropertyRoute } from "@/features/broker/property/routes/properties.$id.edit";
import { createPropertyRoute } from "@/features/broker/property/routes/properties.new";
import { RouterProvider, createRouter } from "@tanstack/react-router";

const routeTree = rootRoute.addChildren([
  indexRoute,
  propertiesRoute,
  editPropertyRoute,
  brokenRoute.addChildren([createPropertyRoute]),
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
