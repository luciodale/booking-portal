import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";
import { ClerkProviderWrapper } from "./ClerkProviderWrapper";

export function SSOCallback() {
  return (
    <ClerkProviderWrapper>
      <div className="flex flex-col items-center gap-4">
        <AuthenticateWithRedirectCallback />
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
        <p className="text-sm text-muted-foreground">Completing sign in...</p>
      </div>
    </ClerkProviderWrapper>
  );
}
