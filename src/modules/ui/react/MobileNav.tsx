import { localePath } from "@/i18n/locale-path";
import { t } from "@/i18n/t";
import type { Locale } from "@/i18n/types";
import { HamburgerButton } from "@/modules/ui/react/HamburgerButton";
import { SwipebarItem } from "@/modules/ui/react/SwipebarItem";
import { type Theme, applyTheme } from "@/modules/ui/react/ThemeToggle";
import {
  MOBILE_NAV_SWIPEBAR_PROPS,
  getSidebarWidth,
} from "@/modules/ui/react/mobile-nav-config";
import { SignedIn, SignedOut, useAuth } from "@clerk/astro/react";
import {
  SwipeBarLeft,
  SwipeBarProvider,
  useSwipeBarContext,
} from "@luciodale/swipe-bar";
import {
  Building2,
  Crown,
  Home,
  Info,
  LayoutDashboard,
  LogIn,
  LogOut,
  Monitor,
  Moon,
  Sun,
  User,
  X,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type MobileNavProps = {
  locale: Locale;
  currentPath: string;
};

type NavLink = {
  href: string;
  label: string;
  matchPath: string;
  icon: ReactNode;
};

function getNavLinks(locale: Locale): NavLink[] {
  return [
    {
      href: localePath(locale, "/"),
      label: t(locale, "nav.home"),
      matchPath: "/",
      icon: <Home size={18} />,
    },
    {
      href: localePath(locale, "/elite"),
      label: t(locale, "nav.elite"),
      matchPath: "/elite",
      icon: <Crown size={18} />,
    },
    {
      href: localePath(locale, "/standard"),
      label: t(locale, "nav.standard"),
      matchPath: "/standard",
      icon: <Building2 size={18} />,
    },
    {
      href: localePath(locale, "/about"),
      label: t(locale, "nav.about"),
      matchPath: "/about",
      icon: <Info size={18} />,
    },
  ];
}

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

function MobileNavContent({ locale, currentPath }: MobileNavProps) {
  const { openSidebar, closeSidebar } = useSwipeBarContext();
  const { signOut } = useAuth();
  const { theme, cycleTheme } = useThemeCycle();
  const navLinks = getNavLinks(locale);

  const ThemeIcon = resolveThemeIcon(theme);

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
              <a
                href={localePath(locale, "/")}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary to-accent flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">
                    E
                  </span>
                </div>
                <span className="text-xl font-semibold tracking-tight">
                  <span className="text-foreground">Elite</span>
                  <span className="text-primary">Stay</span>
                </span>
              </a>
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
              {navLinks.map((link) => (
                <a key={link.matchPath} href={link.href}>
                  <SwipebarItem
                    icon={link.icon}
                    label={link.label}
                    isActive={currentPath === link.matchPath}
                  />
                </a>
              ))}
              <a href={localePath(locale, "/backoffice")}>
                <SwipebarItem
                  icon={<LayoutDashboard size={18} />}
                  label={t(locale, "auth.backoffice")}
                />
              </a>
            </nav>

            <div className="border-t border-border px-4 py-4 flex flex-col gap-1">
              <button type="button" onClick={cycleTheme}>
                <SwipebarItem
                  icon={<ThemeIcon size={18} />}
                  label={`Theme: ${resolveThemeLabel(theme)}`}
                />
              </button>
              <SignedOut>
                <a href="/sign-in">
                  <SwipebarItem
                    icon={<LogIn size={18} />}
                    label={t(locale, "auth.signIn")}
                  />
                </a>
              </SignedOut>
              <SignedIn>
                <a href={localePath(locale, "/bookings")}>
                  <SwipebarItem
                    icon={<User size={18} />}
                    label={t(locale, "auth.myBookings")}
                  />
                </a>
                <button type="button" onClick={handleSignOut}>
                  <SwipebarItem
                    icon={<LogOut size={18} />}
                    label={t(locale, "auth.signOut")}
                  />
                </button>
              </SignedIn>
            </div>
          </div>
        </SwipeBarLeft>,
        document.body
      )}
    </>
  );
}

export function MobileNav({ locale, currentPath }: MobileNavProps) {
  return (
    <SwipeBarProvider>
      <MobileNavContent locale={locale} currentPath={currentPath} />
    </SwipeBarProvider>
  );
}
