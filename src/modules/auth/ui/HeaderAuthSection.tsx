import type { Locale } from "@/i18n/types";
import { t } from "@/i18n/t";
import { localePath } from "@/i18n/locale-path";
import { SignedIn, SignedOut } from "@clerk/astro/react";
import { UserAvatarDropdown } from "./UserAvatarDropdown";

type HeaderAuthSectionProps = {
  locale?: Locale;
};

export function HeaderAuthSection({ locale = "en" }: HeaderAuthSectionProps) {
  return (
    <div className="flex items-center gap-4">
      <SignedOut>
        <a
          href="/sign-in"
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
          data-testid="header-signin"
        >
          {t(locale, "auth.signIn")}
        </a>
        <a href="/sign-up" className="btn-primary text-sm px-4 py-2">
          {t(locale, "auth.getStarted")}
        </a>
      </SignedOut>

      <SignedIn>
        <UserAvatarDropdown locale={locale} />
      </SignedIn>
    </div>
  );
}
