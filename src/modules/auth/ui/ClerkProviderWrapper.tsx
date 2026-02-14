import { ClerkProvider } from "@clerk/clerk-react";
import type { PropsWithChildren } from "react";

export function ClerkProviderWrapper({ children }: PropsWithChildren) {
  return (
    <ClerkProvider
      publishableKey={import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
    >
      {children}
    </ClerkProvider>
  );
}
