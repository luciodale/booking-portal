import { useEffect, useState } from 'react';

interface ApiResponse {
  message?: string;
  timestamp?: string;
}

export function TestApp() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/test')
      .then((res) => res.json() as Promise<ApiResponse>)
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
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="container mx-auto max-w-2xl">
        <h1 className="text-4xl font-bold mb-4 text-gradient">React Test Page</h1>
        <p className="text-muted-foreground mb-8">
          This is a React island for testing interactive components.
        </p>
        
        <div className="bg-card rounded-2xl p-6 marble-border">
          <h2 className="text-xl font-semibold mb-4">API Test</h2>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : (
            <pre className="text-sm bg-secondary p-4 rounded-lg overflow-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          )}
        </div>
        
        <div className="mt-8">
          <a href="/" className="text-primary hover:underline">
            ← Back to Astro home
          </a>
        </div>
      </div>
    </div>
  );
}
