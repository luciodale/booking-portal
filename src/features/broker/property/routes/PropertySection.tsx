/**
 * Dashboard card sections for properties and experiences.
 */

import { Link } from "@tanstack/react-router";

export function PropertySection() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Link
        to="/properties"
        className="group bg-card border border-border rounded-xl p-6 transition-all duration-200 hover:bg-card-hover"
      >
        <h2 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
          Properties
        </h2>
        <p className="text-sm text-muted-foreground">
          Manage your property listings, pricing, and availability.
        </p>
      </Link>

      <Link
        to="/create/properties/new"
        className="group bg-card border border-border rounded-xl p-6 transition-all duration-200 hover:bg-card-hover"
      >
        <h2 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
          Create Property
        </h2>
        <p className="text-sm text-muted-foreground">
          Add a new property from your PMS integration.
        </p>
      </Link>
    </div>
  );
}

export function ExperienceSection() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Link
        to="/experiences"
        className="group bg-card border border-border rounded-xl p-6 transition-all duration-200 hover:bg-card-hover"
      >
        <h2 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
          Experiences
        </h2>
        <p className="text-sm text-muted-foreground">
          Manage your experience listings and availability.
        </p>
      </Link>

      <Link
        to="/experiences/new"
        className="group bg-card border border-border rounded-xl p-6 transition-all duration-200 hover:bg-card-hover"
      >
        <h2 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
          Create Experience
        </h2>
        <p className="text-sm text-muted-foreground">
          Add a new experience for guests to book.
        </p>
      </Link>
    </div>
  );
}
