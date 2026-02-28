import { useScrollTopOnNavigate } from "@/features/broker/property/hooks/useScrollTopOnNavigate";
import { BackofficeSidebar } from "@/features/broker/ui/BackofficeSidebar";
import { BackofficeUserMenu } from "@/features/broker/ui/BackofficeUserMenu";
import { useAuth, useUser } from "@clerk/clerk-react";
import { SwipeBarProvider, useSwipeBarContext } from "@luciodale/swipe-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Link, Outlet, createRootRoute } from "@tanstack/react-router";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useRef } from "react";

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

function BackofficeHeader({ isAdmin }: { isAdmin: boolean }) {
  const { isLeftOpen, openSidebar, closeSidebar } = useSwipeBarContext();

  function handleToggleSidebar() {
    if (isLeftOpen) {
      closeSidebar("left");
    } else {
      openSidebar("left");
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
      <nav className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleSidebar}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label={isLeftOpen ? "Close menu" : "Open menu"}
          >
            {isLeftOpen ? (
              <PanelLeftClose size={22} />
            ) : (
              <PanelLeftOpen size={22} />
            )}
          </button>
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
        </div>
        <div className="flex items-center gap-6">
          <a
            href="/"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Public Site
          </a>
          <BackofficeUserMenu isAdmin={isAdmin} />
        </div>
      </nav>
    </header>
  );
}

function BackofficeInner({ isAdmin }: { isAdmin: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  useScrollTopOnNavigate(scrollRef);

  return (
    <div className="flex bg-background" style={{ height: "100dvh" }}>
      <div className="relative flex h-full w-full overflow-hidden">
        <BackofficeSidebar isAdmin={isAdmin} />
        <div className="relative flex h-full max-w-full flex-1 flex-col overflow-hidden">
          <div ref={scrollRef} className="flex h-full w-full flex-1 flex-col overflow-auto">
            <BackofficeHeader isAdmin={isAdmin} />
            <main>
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

function BackofficeLayout() {
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
      <SwipeBarProvider>
        <BackofficeInner isAdmin={isAdmin} />
      </SwipeBarProvider>
    </QueryClientProvider>
  );
}

export const rootRoute = createRootRoute({
  component: BackofficeLayout,
});
