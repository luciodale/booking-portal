import { Link, createRoute } from "@tanstack/react-router";
import { rootRoute } from "./BackofficeRoot";

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Dashboard,
});

function Dashboard() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
      <p className="text-muted-foreground mb-8">
        Welcome to the booking management portal.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        <Link
          to="/properties"
          className="group bg-card hover:bg-card-hover border border-border rounded-xl p-6 transition-all duration-200"
        >
          <h2 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
            Properties
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage your property listings, pricing, and availability.
          </p>
        </Link>

        <Link
          to="/properties/new"
          search={{ type: "elite" }}
          className="group bg-card hover:bg-card-hover border border-border rounded-xl p-6 transition-all duration-200"
        >
          <h2 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
            Create Property
          </h2>
          <p className="text-sm text-muted-foreground">
            Add a new elite property to your portfolio.
          </p>
        </Link>
      </div>
    </div>
  );
}
