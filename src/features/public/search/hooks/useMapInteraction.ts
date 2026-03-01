import { useCallback, useRef, useState } from "react";

export function useMapInteraction() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);
  const propertyRefs = useRef(new Map<string, HTMLDivElement | null>());

  const selectProperty = useCallback((id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  }, []);

  const focusProperty = useCallback((id: string) => {
    setSelectedId(id);
    setFocusId(id);
    const el = propertyRefs.current.get(id);
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, []);

  const setPropertyRef = useCallback(
    (id: string, el: HTMLDivElement | null) => {
      propertyRefs.current.set(id, el);
    },
    []
  );

  return {
    selectedId,
    focusId,
    selectProperty,
    focusProperty,
    setPropertyRef,
  };
}
