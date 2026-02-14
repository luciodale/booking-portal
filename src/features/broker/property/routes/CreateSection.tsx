import { Outlet, createRoute } from "@tanstack/react-router";
import { rootRoute } from "./BackofficeRoot";

export const createSectionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/create",
  component: () => (
    <div className="p-8">
      <Outlet />
    </div>
  ),
});
