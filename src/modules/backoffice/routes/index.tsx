import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "./BackofficeRoot";

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Dashboard,
});

function Dashboard() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Backoffice Dashboard</h1>
      <p className="text-gray-600">Welcome to the booking management portal.</p>
    </div>
  );
}
