import { ClerkProvider } from "@clerk/clerk-react";
import type { PropsWithChildren } from "react";

const CLERK_PUBLISHABLE_KEY =
  "pk_test_ZXF1aXBwZWQtc2hyZXctMTUuY2xlcmsuYWNjb3VudHMuZGV2JA";

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
