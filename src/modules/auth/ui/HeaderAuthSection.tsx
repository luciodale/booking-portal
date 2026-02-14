import { SignedIn, SignedOut } from "@clerk/astro/react";
import { UserAvatarDropdown } from "./UserAvatarDropdown";

export function HeaderAuthSection() {
  return (
    <div className="flex items-center gap-4">
      <SignedOut>
        <a
          href="/sign-in"
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
          data-testid="header-signin"
        >
          Sign In
        </a>
        <a href="/sign-up" className="btn-primary text-sm px-4 py-2">
          Get Started
        </a>
      </SignedOut>

      <SignedIn>
        <UserAvatarDropdown />
      </SignedIn>
    </div>
  );
}
