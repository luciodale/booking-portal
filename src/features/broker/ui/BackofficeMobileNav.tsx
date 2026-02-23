import { HamburgerButton } from "@/modules/ui/react/HamburgerButton";
import { SwipebarItem } from "@/modules/ui/react/SwipebarItem";
import { type Theme, applyTheme } from "@/modules/ui/react/ThemeToggle";
import {
  MOBILE_NAV_SWIPEBAR_PROPS,
  getSidebarWidth,
} from "@/modules/ui/react/mobile-nav-config";
import { useClerk } from "@clerk/clerk-react";
import { SwipeBarLeft, useSwipeBarContext } from "@luciodale/swipe-bar";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Banknote,
  Building2,
  Calendar,
  CalendarDays,
  Compass,
  Globe,
  LogOut,
  Monitor,
  Moon,
  PlusCircle,
  Settings,
  Sun,
  X,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type NavItem = {
  to: string;
  label: string;
  icon: ReactNode;
  testId?: string;
};

function useThemeCycle() {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark" || stored === "system") {
      setTheme(stored);
    }
  }, []);

  function cycleTheme() {
    const next: Theme =
      theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
    applyTheme(next);
  }

  return { theme, cycleTheme };
}

function resolveThemeIcon(theme: Theme) {
  if (theme === "light") return Sun;
  if (theme === "dark") return Moon;
  return Monitor;
}

function resolveThemeLabel(theme: Theme) {
  if (theme === "light") return "Light";
  if (theme === "dark") return "Dark";
  return "System";
}

export function BackofficeMobileNav({ isAdmin }: { isAdmin: boolean }) {
  const { openSidebar, closeSidebar } = useSwipeBarContext();
  const { signOut } = useClerk();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { theme, cycleTheme } = useThemeCycle();

  const ThemeIcon = resolveThemeIcon(theme);

  const navItems: NavItem[] = [
    {
      to: "/properties",
      label: "Properties",
      icon: <Building2 size={18} />,
      testId: "nav-properties",
    },
    {
      to: "/experiences",
      label: "Experiences",
      icon: <Compass size={18} />,
      testId: "nav-experiences",
    },
    { to: "/bookings", label: "Bookings", icon: <CalendarDays size={18} /> },
    {
      to: "/create/properties/new",
      label: "Create Property",
      icon: <PlusCircle size={18} />,
    },
    { to: "/connect", label: "Payouts", icon: <Banknote size={18} /> },
    ...(isAdmin
      ? [
          { to: "/admin/events", label: "Events", icon: <Calendar size={18} /> },
          { to: "/admin/settings", label: "Settings", icon: <Settings size={18} /> },
        ]
      : []),
  ];

  function handleOpen() {
    openSidebar("left");
  }

  function handleClose() {
    closeSidebar("left");
  }

  function handleSignOut() {
    signOut({ redirectUrl: "/" });
  }

  return (
    <>
      <HamburgerButton onClick={handleOpen} />
      {createPortal(
        <SwipeBarLeft
          {...MOBILE_NAV_SWIPEBAR_PROPS}
          sidebarWidthPx={getSidebarWidth()}
          className="bg-card border-r border-border"
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4">
              <Link
                to="/"
                onClick={handleClose}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary to-accent flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">
                    E
                  </span>
                </div>
                <span className="text-lg font-semibold tracking-tight">
                  <span className="text-foreground">Elite</span>
                  <span className="text-primary">Stay</span>
                  <span className="text-muted-foreground ml-2 text-sm font-normal">
                    Backoffice
                  </span>
                </span>
              </Link>
              <button
                type="button"
                onClick={handleClose}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                aria-label="Close menu"
              >
                <X size={22} />
              </button>
            </div>

            <nav className="flex-1 flex flex-col px-4 gap-1 overflow-y-auto">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={handleClose}
                  data-testid={item.testId}
                >
                  <SwipebarItem
                    icon={item.icon}
                    label={item.label}
                    isActive={pathname.startsWith(item.to)}
                  />
                </Link>
              ))}
              <a href="/">
                <SwipebarItem icon={<Globe size={18} />} label="Public Site" />
              </a>
            </nav>

            <div className="border-t border-border px-4 py-4 flex flex-col gap-1">
              <button type="button" onClick={cycleTheme}>
                <SwipebarItem
                  icon={<ThemeIcon size={18} />}
                  label={`Theme: ${resolveThemeLabel(theme)}`}
                />
              </button>
              <button type="button" onClick={handleSignOut}>
                <SwipebarItem icon={<LogOut size={18} />} label="Sign Out" />
              </button>
            </div>
          </div>
        </SwipeBarLeft>,
        document.body
      )}
    </>
  );
}
