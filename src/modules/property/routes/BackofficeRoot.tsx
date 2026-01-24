import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Link, Outlet, createRootRoute } from "@tanstack/react-router";

const queryClient = new QueryClient();

export const rootRoute = createRootRoute({
  component: () => (
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
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Properties
              </Link>
              <Link
                to="/experiences"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Experiences
              </Link>
            </div>
          </nav>
        </header>
        <main>
          <Outlet />
        </main>
      </div>
    </QueryClientProvider>
  ),
});
