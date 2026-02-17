import { notificationStore } from "@/modules/ui/react/stores/notificationStore";
import { useStore } from "@nanostores/react";
import { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";

function useThemeFromDom(): "light" | "dark" {
  const [dark, setDark] = useState(
    () => typeof document !== "undefined" && document.documentElement.classList.contains("dark"),
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  return dark ? "dark" : "light";
}

export function GlobalToaster() {
  const $notification = useStore(notificationStore);
  const theme = useThemeFromDom();

  useEffect(() => {
    if ($notification) {
      toast[$notification.type || "message"]($notification.message);
    }
  }, [$notification]);

  return <Toaster richColors position="top-right" theme={theme} />;
}
