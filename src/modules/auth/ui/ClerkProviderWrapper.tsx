import { ClerkProvider } from "@clerk/clerk-react";
import type { PropsWithChildren } from "react";

const PUBLISHABLE_KEY = import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY;

export function ClerkProviderWrapper({ children }: PropsWithChildren) {
  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
    >
      {children}
    </ClerkProvider>
  );
}
