import { createRouter, RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { routeTree } from './generated';

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export function App() {
  return (
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  );
}

