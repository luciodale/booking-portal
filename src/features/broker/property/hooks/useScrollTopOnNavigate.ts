import { useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";

export function useScrollTopOnNavigate() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
}
