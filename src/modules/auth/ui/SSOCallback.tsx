import { AuthenticateWithRedirectCallback } from "@clerk/astro/react";

export function SSOCallback() {
  return (
    <div className="flex flex-col items-center gap-4">
      <AuthenticateWithRedirectCallback />
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
      <p className="text-sm text-muted-foreground">Completing sign in...</p>
    </div>
  );
}
