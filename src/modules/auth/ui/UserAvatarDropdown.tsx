import { $userStore } from "@clerk/astro/client";
import { useAuth } from "@clerk/astro/react";
import {
  autoUpdate,
  flip,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
} from "@floating-ui/react";
import { useStore } from "@nanostores/react";
import { User } from "lucide-react";
import { useState, useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

function useHydrated() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

function useUserAvatarDropdown() {
  const user = useStore($userStore);
  const { signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: "bottom-end",
    middleware: [offset(8), flip(), shift()],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
  ]);

  function handleSignOut() {
    signOut({ redirectUrl: "/" });
  }

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() ||
      user.primaryEmailAddress?.emailAddress[0]?.toUpperCase() ||
      "?"
    : "?";

  return {
    user,
    isOpen,
    initials,
    refs,
    floatingStyles,
    getReferenceProps,
    getFloatingProps,
    handleSignOut,
  };
}

export function UserAvatarDropdown() {
  const hydrated = useHydrated();
  const {
    user,
    isOpen,
    initials,
    refs,
    floatingStyles,
    getReferenceProps,
    getFloatingProps,
    handleSignOut,
  } = useUserAvatarDropdown();

  if (!hydrated) {
    return (
      <div className="w-8 h-8 rounded-full bg-primary/10 border border-border-accent flex items-center justify-center">
        <User className="w-4 h-4 text-primary" />
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        ref={refs.setReference}
        {...getReferenceProps()}
        className="flex items-center gap-2 rounded-full transition-opacity hover:opacity-80"
      >
        {user?.imageUrl ? (
          <img
            src={user.imageUrl}
            alt=""
            className="w-8 h-8 rounded-full object-cover border border-border-accent"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-secondary border border-border-accent flex items-center justify-center">
            <span className="text-xs font-semibold text-accent">
              {initials}
            </span>
          </div>
        )}
      </button>

      {isOpen && (
        <div
          ref={refs.setFloating}
          style={floatingStyles}
          {...getFloatingProps()}
          className="z-50 min-w-[200px] bg-card border border-border rounded-xl shadow-xl p-2"
        >
          <div className="px-3 py-2 border-b border-border mb-1">
            <p className="text-sm font-medium text-foreground truncate">
              {user?.primaryEmailAddress?.emailAddress}
            </p>
          </div>

          <a
            href="/bookings"
            className="flex items-center gap-2 px-3 py-2 text-sm text-foreground rounded-lg hover:bg-secondary transition-colors"
          >
            My Bookings
          </a>

          <a
            href="/backoffice"
            className="flex items-center gap-2 px-3 py-2 text-sm text-foreground rounded-lg hover:bg-secondary transition-colors"
          >
            Manage Properties
          </a>

          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-error rounded-lg hover:bg-secondary transition-colors text-left"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
