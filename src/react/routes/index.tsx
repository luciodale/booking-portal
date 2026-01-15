import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold">Booking Portal</h1>
      <p className="text-lg text-muted-foreground">
        Welcome to the elite direct-booking platform.
      </p>
      <div className="mt-8">
        <a
          href="/test"
          className="text-primary hover:underline"
        >
          Go to test route →
        </a>
      </div>
    </div>
  );
}

