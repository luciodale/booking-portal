import { cn } from "@/modules/utils/cn";
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
import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export type Theme = "system" | "light" | "dark";

const OPTIONS: { value: Theme; label: string; Icon: typeof Monitor }[] = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "System", Icon: Monitor },
];

export function applyTheme(theme: Theme) {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const dark = theme === "dark" || (theme === "system" && prefersDark);
  document.documentElement.classList.toggle("dark", dark);
}

function resolveIcon(theme: Theme) {
  const match = OPTIONS.find((o) => o.value === theme);
  return match?.Icon ?? Monitor;
}

function useThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");
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

  // Initialise from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    if (stored && OPTIONS.some((o) => o.value === stored)) {
      setTheme(stored);
    }
  }, []);

  // Listen to OS preference changes when in "system" mode
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    function onChange() {
      if ((localStorage.getItem("theme") || "system") === "system") {
        applyTheme("system");
      }
    }
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  function select(value: Theme) {
    setTheme(value);
    setIsOpen(false);
    localStorage.setItem("theme", value);
    applyTheme(value);
  }

  return {
    theme,
    isOpen,
    refs,
    floatingStyles,
    getReferenceProps,
    getFloatingProps,
    select,
  };
}

export function ThemeToggle() {
  const {
    theme,
    isOpen,
    refs,
    floatingStyles,
    getReferenceProps,
    getFloatingProps,
    select,
  } = useThemeToggle();

  const ActiveIcon = resolveIcon(theme);

  return (
    <div className="relative">
      <button
        type="button"
        ref={refs.setReference}
        {...getReferenceProps()}
        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors duration-200"
        aria-label="Theme"
      >
        <ActiveIcon size={18} />
      </button>

      {isOpen && (
        <div
          ref={refs.setFloating}
          style={floatingStyles}
          {...getFloatingProps()}
          className="z-50 min-w-[140px] bg-card border border-border rounded-xl shadow-xl p-1"
        >
          {OPTIONS.map(({ value, label, Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => select(value)}
              className={cn(
                "flex my-1 items-center gap-2 w-full px-3 py-2 text-sm rounded-lg transition-colors",
                theme === value
                  ? "text-foreground bg-secondary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
