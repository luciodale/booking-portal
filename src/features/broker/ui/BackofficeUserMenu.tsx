import { useClerk, useUser } from "@clerk/clerk-react";
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
import { Link } from "@tanstack/react-router";
import { useState } from "react";

function useBackofficeUserMenu() {
  const { user } = useUser();
  const { signOut } = useClerk();
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

  const isAdmin =
    (user?.publicMetadata as { role?: string } | undefined)?.role === "admin";

  return {
    user,
    isOpen,
    isAdmin,
    initials,
    refs,
    floatingStyles,
    getReferenceProps,
    getFloatingProps,
    handleSignOut,
  };
}

export function BackofficeUserMenu() {
  const {
    user,
    isOpen,
    isAdmin,
    initials,
    refs,
    floatingStyles,
    getReferenceProps,
    getFloatingProps,
    handleSignOut,
  } = useBackofficeUserMenu();

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
            className="w-8 h-8 rounded-full object-cover border border-border"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-xs font-semibold text-primary-foreground">
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

          {isAdmin && (
            <Link
              to="/admin/settings"
              className="flex items-center gap-2 px-3 py-2 text-sm text-foreground rounded-lg hover:bg-secondary transition-colors"
            >
              Admin Settings
            </Link>
          )}

          <a
            href="/"
            className="flex items-center gap-2 px-3 py-2 text-sm text-foreground rounded-lg hover:bg-secondary transition-colors"
          >
            Public Site
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
