import { describe, expect, it } from "vitest";

/**
 * Pure-logic mirror of useCalendarAutoClose.
 * Tests the state machine without React hooks.
 */
function createAutoCloseTracker() {
  let hasCompletedFirstSelection = false;

  return {
    shouldAutoClose(): boolean {
      if (hasCompletedFirstSelection) return false;
      hasCompletedFirstSelection = true;
      return true;
    },
    reset() {
      hasCompletedFirstSelection = false;
    },
    get completed() {
      return hasCompletedFirstSelection;
    },
  };
}

/**
 * Pure-logic mirror of handleDateClick from useBookingCalendar.
 */
function createDateSelection(tracker: ReturnType<typeof createAutoCloseTracker>) {
  let checkIn: string | null = null;
  let checkOut: string | null = null;
  let calendarOpen = true;

  return {
    click(dateStr: string) {
      if (!checkIn || (checkIn && checkOut)) {
        checkIn = dateStr;
        checkOut = null;
      } else if (dateStr > checkIn) {
        checkOut = dateStr;
        if (tracker.shouldAutoClose()) {
          calendarOpen = false;
        }
      } else {
        checkIn = dateStr;
        checkOut = null;
      }
    },
    open() {
      calendarOpen = true;
    },
    confirm() {
      calendarOpen = false;
    },
    get state() {
      return { checkIn, checkOut, calendarOpen };
    },
  };
}

describe("calendar auto-close behavior", () => {
  it("auto-closes on first checkout selection", () => {
    const tracker = createAutoCloseTracker();
    const sel = createDateSelection(tracker);

    sel.click("2026-02-20"); // checkIn
    expect(sel.state.calendarOpen).toBe(true);

    sel.click("2026-02-25"); // checkOut — first time
    expect(sel.state.checkOut).toBe("2026-02-25");
    expect(sel.state.calendarOpen).toBe(false);
  });

  it("does NOT auto-close on subsequent checkout selections", () => {
    const tracker = createAutoCloseTracker();
    const sel = createDateSelection(tracker);

    // First selection cycle
    sel.click("2026-02-20");
    sel.click("2026-02-25");
    expect(sel.state.calendarOpen).toBe(false);

    // Reopen
    sel.open();
    expect(sel.state.calendarOpen).toBe(true);

    // Second selection cycle — should stay open
    sel.click("2026-03-01"); // new checkIn
    sel.click("2026-03-05"); // new checkOut
    expect(sel.state.checkOut).toBe("2026-03-05");
    expect(sel.state.calendarOpen).toBe(true); // NOT auto-closed
  });

  it("requires Confirm to close after first selection", () => {
    const tracker = createAutoCloseTracker();
    const sel = createDateSelection(tracker);

    // Complete first selection (auto-closes)
    sel.click("2026-02-20");
    sel.click("2026-02-25");

    // Reopen and select new dates
    sel.open();
    sel.click("2026-03-10");
    sel.click("2026-03-15");
    expect(sel.state.calendarOpen).toBe(true);

    // User clicks Confirm
    sel.confirm();
    expect(sel.state.calendarOpen).toBe(false);
  });

  it("reset allows auto-close again", () => {
    const tracker = createAutoCloseTracker();
    const sel = createDateSelection(tracker);

    sel.click("2026-02-20");
    sel.click("2026-02-25");
    expect(sel.state.calendarOpen).toBe(false);

    // Reset tracker (e.g. via retryDates)
    tracker.reset();
    sel.open();

    sel.click("2026-03-01");
    sel.click("2026-03-05");
    // After reset, first selection auto-closes again
    expect(sel.state.calendarOpen).toBe(false);
  });

  it("cross-month selection auto-closes on first time", () => {
    const tracker = createAutoCloseTracker();
    const sel = createDateSelection(tracker);

    sel.click("2026-02-25"); // checkIn in Feb
    sel.click("2026-03-05"); // checkOut in Mar
    expect(sel.state.checkIn).toBe("2026-02-25");
    expect(sel.state.checkOut).toBe("2026-03-05");
    expect(sel.state.calendarOpen).toBe(false);
  });

  it("cross-month re-selection stays open after first cycle", () => {
    const tracker = createAutoCloseTracker();
    const sel = createDateSelection(tracker);

    // First cycle
    sel.click("2026-02-20");
    sel.click("2026-02-25");

    // Reopen and do cross-month selection
    sel.open();
    sel.click("2026-03-28");
    sel.click("2026-04-02");
    expect(sel.state.calendarOpen).toBe(true);
  });

  it("clicking before checkIn resets without affecting auto-close state", () => {
    const tracker = createAutoCloseTracker();
    const sel = createDateSelection(tracker);

    sel.click("2026-02-20"); // checkIn
    sel.click("2026-02-15"); // before checkIn — resets
    expect(sel.state.checkIn).toBe("2026-02-15");
    expect(sel.state.checkOut).toBeNull();
    expect(sel.state.calendarOpen).toBe(true);
    // First checkout should still auto-close
    expect(tracker.completed).toBe(false);
  });

  it("multiple re-selections within reopened calendar all stay open", () => {
    const tracker = createAutoCloseTracker();
    const sel = createDateSelection(tracker);

    // First cycle (auto-closes)
    sel.click("2026-02-10");
    sel.click("2026-02-15");
    expect(sel.state.calendarOpen).toBe(false);

    sel.open();

    // Second selection
    sel.click("2026-02-20");
    sel.click("2026-02-25");
    expect(sel.state.calendarOpen).toBe(true);

    // Third selection (still same reopened session)
    sel.click("2026-03-01");
    sel.click("2026-03-10");
    expect(sel.state.calendarOpen).toBe(true);
  });
});
