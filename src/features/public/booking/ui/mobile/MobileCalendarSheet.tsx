import { CalendarGrid } from "@/features/public/booking/ui/CalendarGrid";
import type { CalendarPopoverProps } from "@/features/public/booking/ui/CalendarPopover";
import { DateTrigger } from "@/features/public/booking/ui/DateTrigger";
import { SwipeBarBottom, useSwipeBarContext } from "@luciodale/swipe-bar";
import { useEffect, useRef, useState } from "react";

export function MobileCalendarSheet({
  isOpen,
  onOpenChange,
  currentMonth,
  checkIn,
  checkOut,
  rateMap,
  ratesLoading,
  currency,
  onDateClick,
  onConfirm,
}: CalendarPopoverProps) {
  const { openSidebar, closeSidebar, isBottomOpen } = useSwipeBarContext();
  const [sheetHeight] = useState(() =>
    typeof window !== "undefined" ? Math.round(window.innerHeight * 0.85) : 600
  );

  const prevIsOpenRef = useRef(isOpen);
  const prevBottomOpenRef = useRef(isBottomOpen);

  // Single effect: bidirectional close sync with ref guards
  useEffect(() => {
    const wasOpen = prevIsOpenRef.current;
    const wasBottomOpen = prevBottomOpenRef.current;
    prevIsOpenRef.current = isOpen;
    prevBottomOpenRef.current = isBottomOpen;

    // External close (auto-close on checkout selection)
    if (wasOpen && !isOpen) {
      closeSidebar("bottom");
      return;
    }

    // Swipe dismiss → tell parent
    if (wasBottomOpen && !isBottomOpen && isOpen) {
      onOpenChange(false);
    }
  }, [isOpen, isBottomOpen, closeSidebar, onOpenChange]);

  function handleOpen() {
    openSidebar("bottom");
    onOpenChange(true);
  }

  return (
    <>
      <button type="button" className="w-full text-left" onClick={handleOpen}>
        <DateTrigger checkIn={checkIn} checkOut={checkOut} />
      </button>

      <SwipeBarBottom
        sidebarHeightPx={sheetHeight}
        showToggle={false}
        swipeToOpen={false}
        swipeToClose
        showOverlay
        swipeBarZIndex={50}
        className="rounded-t-2xl bg-card"
      >
        <div className="flex flex-col" style={{ height: sheetHeight }}>
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-2 shrink-0">
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4">
            <CalendarGrid
              currentMonth={currentMonth}
              checkIn={checkIn}
              checkOut={checkOut}
              rateMap={rateMap}
              ratesLoading={ratesLoading}
              currency={currency}
              onDateClick={onDateClick}
              vertical
              monthCount={12}
            />
          </div>

          {/* Confirm button */}
          <div className="px-4 py-3 border-t border-border bg-card shrink-0">
            <button
              type="button"
              onClick={onConfirm}
              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              Confirm
            </button>
          </div>
        </div>
      </SwipeBarBottom>
    </>
  );
}
