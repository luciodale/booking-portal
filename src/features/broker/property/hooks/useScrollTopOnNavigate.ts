import { useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";

export function useScrollTopOnNavigate() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname triggers scroll on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
}
