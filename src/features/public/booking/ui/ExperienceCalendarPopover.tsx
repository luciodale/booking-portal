import type { ExperienceAvailabilityMap } from "@/features/public/booking/api/fetchExperienceAvailability";
import { ExperienceCalendarGrid } from "@/features/public/booking/ui/ExperienceCalendarGrid";
import {
  FloatingFocusManager,
  FloatingPortal,
  autoUpdate,
  flip,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
} from "@floating-ui/react";

type ExperienceCalendarPopoverProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentMonth: Date;
  selectedDate: string | null;
  availabilityMap: ExperienceAvailabilityMap;
  maxParticipants: number;
  onDateClick: (dateStr: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onClear: () => void;
};

export function ExperienceCalendarPopover({
  isOpen,
  onOpenChange,
  currentMonth,
  selectedDate,
  availabilityMap,
  maxParticipants,
  onDateClick,
  onPrevMonth,
  onNextMonth,
  onClear,
}: ExperienceCalendarPopoverProps) {
  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange,
    middleware: [offset(8), flip(), shift({ padding: 16 })],
    placement: "bottom-start",
    strategy: "fixed",
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
  ]);

  return (
    <>
      <button
        ref={refs.setReference}
        type="button"
        className="w-full text-left"
        {...getReferenceProps()}
      >
        <DateTrigger selectedDate={selectedDate} />
      </button>

      {isOpen && (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false}>
            <div
              ref={refs.setFloating}
              style={floatingStyles}
              className="z-50 min-w-[600px] p-5 rounded-2xl bg-card border border-border shadow-2xl shadow-black/40"
              {...getFloatingProps()}
            >
              <ExperienceCalendarGrid
                currentMonth={currentMonth}
                selectedDate={selectedDate}
                availabilityMap={availabilityMap}
                maxParticipants={maxParticipants}
                onDateClick={onDateClick}
                onPrevMonth={onPrevMonth}
                onNextMonth={onNextMonth}
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
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </>
  );
}

function DateTrigger({ selectedDate }: { selectedDate: string | null }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/50 transition-colors cursor-pointer">
      <svg
        aria-hidden="true"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-muted-foreground shrink-0"
      >
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
        <line x1="16" x2="16" y1="2" y2="6" />
        <line x1="8" x2="8" y1="2" y2="6" />
        <line x1="3" x2="21" y1="10" y2="10" />
      </svg>

      <div className="flex-1">
        <div className="text-[10px] text-muted-foreground">Date</div>
        <div
          className={`text-sm truncate ${selectedDate ? "text-foreground font-medium" : "text-muted-foreground/60"}`}
        >
          {selectedDate ?? "Select date"}
        </div>
      </div>
    </div>
  );
}
