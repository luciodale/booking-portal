import { ExperienceCalendarGrid } from "@/features/public/booking/ui/ExperienceCalendarGrid";
import type { ExperienceCalendarPopoverProps } from "@/features/public/booking/ui/ExperienceCalendarPopover";
import { ExperienceDateTrigger } from "@/features/public/booking/ui/ExperienceDateTrigger";
import { SwipeBarBottom, useSwipeBarContext } from "@luciodale/swipe-bar";
import { useEffect, useRef, useState } from "react";

export function MobileExperienceCalendarTrigger({
  selectedDate,
  onOpen,
}: {
  selectedDate: string | null;
  onOpen: () => void;
}) {
  return (
    <button type="button" className="w-full text-left" onClick={onOpen}>
      <ExperienceDateTrigger selectedDate={selectedDate} />
    </button>
  );
}

export function MobileExperienceCalendarBottomSheet({
  isOpen,
  onOpenChange,
  currentMonth,
  selectedDate,
  availabilityMap,
  maxParticipants,
  onDateClick,
  onClear,
}: ExperienceCalendarPopoverProps) {
  const { closeSidebar, isBottomOpen } = useSwipeBarContext();
  const [sheetHeight] = useState(() =>
    typeof window !== "undefined" ? Math.round(window.innerHeight * 0.9) : 600
  );

  const prevIsOpenRef = useRef(isOpen);
  const prevBottomOpenRef = useRef(isBottomOpen);

  useEffect(() => {
    const wasOpen = prevIsOpenRef.current;
    const wasBottomOpen = prevBottomOpenRef.current;
    prevIsOpenRef.current = isOpen;
    prevBottomOpenRef.current = isBottomOpen;

    if (wasOpen && !isOpen) {
      closeSidebar("bottom");
      return;
    }

    if (wasBottomOpen && !isBottomOpen && isOpen) {
      onOpenChange(false);
    }
  }, [isOpen, isBottomOpen, closeSidebar, onOpenChange]);

  return (
    <SwipeBarBottom
      sidebarHeightPx={sheetHeight}
      showToggle={false}
      swipeToOpen={false}
      swipeToClose
      showOverlay
      isAbsolute
      closeSidebarOnOverlayClick
      swipeBarZIndex={50}
      overlayZIndex={49}
      className="rounded-t-2xl bg-card"
    >
      <div className="flex flex-col" style={{ height: sheetHeight }}>
        <div className="flex justify-center pt-3 pb-2 shrink-0">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4">
          <ExperienceCalendarGrid
            currentMonth={currentMonth}
            selectedDate={selectedDate}
            availabilityMap={availabilityMap}
            maxParticipants={maxParticipants}
            onDateClick={onDateClick}
            vertical
            monthCount={12}
          />

          {selectedDate && (
            <div className="mt-3 pt-3 border-t border-border flex justify-end">
              <button
                type="button"
                onClick={onClear}
                className="text-xs text-primary hover:text-primary/80 transition-colors"
              >
                Clear date
              </button>
            </div>
          )}

          <p className="mt-3 text-[11px] text-muted-foreground/70">
            Fully booked? Contact us — we might find more spots.
          </p>
        </div>
      </div>
    </SwipeBarBottom>
  );
}
