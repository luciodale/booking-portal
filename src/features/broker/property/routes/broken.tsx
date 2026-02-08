import { Outlet, createRoute } from "@tanstack/react-router";
import { rootRoute } from "./BackofficeRoot";

export const brokenRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/broken",
  component: () => (
    <div className="p-8">
      <p className="text-sm text-muted-foreground mb-6">
        (WIP — this flow is under active development)
      </p>
      <Outlet />
    </div>
  ),
});
