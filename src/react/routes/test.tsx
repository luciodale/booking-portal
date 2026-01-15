import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

export const Route = createFileRoute('/test')({
  component: TestPage,
});

function TestPage() {
  const [data, setData] = useState<{ message?: string; timestamp?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/test')
      .then((res) => res.json() as Promise<{ message?: string; timestamp?: string }>)
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Test Route</h1>
      <p className="text-muted-foreground">
        This is an example React route with TanStack Router.
      </p>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="mt-4 p-4 bg-card rounded-lg border">
          <pre className="text-sm">{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
      <div className="mt-4">
        <a href="/" className="text-primary hover:underline">
          ← Back to home
        </a>
      </div>
    </div>
  );
}

