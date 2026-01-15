import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

export const Route = createRootRoute({
  component: () => {
    return (
      <>
        <div className="min-h-screen bg-background">
          <main className="container mx-auto px-4 py-8">
            <Outlet />
          </main>
        </div>
        <TanStackRouterDevtools />
      </>
    );
  },
});

