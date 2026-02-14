import { CLERK_PUBLISHABLE_KEY } from "@/config";
import { ClerkProvider } from "@clerk/clerk-react";
import type { PropsWithChildren } from "react";

export function ClerkProviderWrapper({ children }: PropsWithChildren) {
  return (
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
    >
      {children}
    </ClerkProvider>
  );
}
