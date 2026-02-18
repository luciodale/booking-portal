import type { Locale } from "@/i18n/types";
import { ClerkProvider } from "@clerk/clerk-react";
import type { PropsWithChildren } from "react";

type ClerkProviderWrapperProps = PropsWithChildren<{
  locale?: Locale;
}>;

export function ClerkProviderWrapper({ locale, children }: ClerkProviderWrapperProps) {
  return (
    <ClerkProvider
      publishableKey={import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      localization={locale === "it" ? { locale: "it-IT" } : undefined}
    >
      {children}
    </ClerkProvider>
  );
}
