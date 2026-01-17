import { RouterProvider, createRouter } from "@tanstack/react-router";
import { indexRoute } from "../routes/index";
import { rootRoute } from "../routes/root";

const routeTree = rootRoute.addChildren([indexRoute]);

const router = createRouter({
  routeTree,
  basepath: "/backoffice", // Important for hosting under /backoffice
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function BackofficeApp() {
  return <RouterProvider router={router} />;
}
