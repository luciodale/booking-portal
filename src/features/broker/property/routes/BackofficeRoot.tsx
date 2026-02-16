import { useScrollTopOnNavigate } from "@/features/broker/property/hooks/useScrollTopOnNavigate";
import { BackofficeUserMenu } from "@/features/broker/ui/BackofficeUserMenu";
import { useAuth, useUser } from "@clerk/clerk-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Link, Outlet, createRootRoute } from "@tanstack/react-router";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

function BackofficeLayout() {
  useScrollTopOnNavigate();

  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const isAdmin =
    (user?.publicMetadata as { role?: string } | undefined)?.role === "admin";

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  if (!isSignedIn) {
    window.location.href = "/sign-in";
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
          <nav className="px-6 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">
                  E
                </span>
              </div>
              <span className="text-lg font-semibold tracking-tight">
                <span className="text-foreground">Elite</span>
                <span className="text-primary">Stay</span>
                <span className="text-muted-foreground ml-2 text-sm font-normal">
                  Backoffice
                </span>
              </span>
            </Link>
            <div className="flex items-center gap-6">
              <Link
                to="/properties"
                data-testid="nav-properties"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Properties
              </Link>
              <Link
                to="/experiences"
                data-testid="nav-experiences"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Experiences
              </Link>
              <Link
                to="/bookings"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Bookings
              </Link>
              <Link
                to="/create/properties/new"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Create Property
              </Link>
              {isAdmin && (
                <Link
                  to="/admin/events"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Events
                </Link>
              )}
              <BackofficeUserMenu />
            </div>
          </nav>
        </header>
        <main>
          <Outlet />
        </main>
      </div>
    </QueryClientProvider>
  );
}

export const rootRoute = createRootRoute({
  component: BackofficeLayout,
});
