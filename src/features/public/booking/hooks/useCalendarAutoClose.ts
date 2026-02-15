import { useCallback, useState } from "react";

/**
 * Tracks whether the calendar should auto-close on checkout selection.
 *
 * - First time a checkout date is picked → auto-close (returns true).
 * - After reopening the calendar → no auto-close (returns false);
 *   user must click "Confirm" to dismiss.
 */
export function useCalendarAutoClose() {
  const [hasCompletedFirstSelection, setHasCompletedFirstSelection] =
    useState(false);

  /** Call when a checkout date is selected. Returns true if the popover should close. */
  const shouldAutoClose = useCallback((): boolean => {
    if (hasCompletedFirstSelection) return false;
    setHasCompletedFirstSelection(true);
    return true;
  }, [hasCompletedFirstSelection]);

  /** Reset so the next full selection cycle auto-closes again. */
  const resetAutoClose = useCallback(() => {
    setHasCompletedFirstSelection(false);
  }, []);

  return { shouldAutoClose, resetAutoClose, hasCompletedFirstSelection };
}
