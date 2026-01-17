import { Outlet, createRootRoute } from "@tanstack/react-router";

export const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4">
        <h1 className="font-semibold text-lg">Booking Portal Backoffice</h1>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  ),
});
