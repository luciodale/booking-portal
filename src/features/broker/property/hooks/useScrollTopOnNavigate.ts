import { useRouterState } from "@tanstack/react-router";
import { type RefObject, useEffect } from "react";

export function useScrollTopOnNavigate(scrollRef: RefObject<HTMLDivElement | null>) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname triggers scroll on route change
  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0);
  }, [pathname]);
}
