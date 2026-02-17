import type { ExperienceAvailabilityMap } from "@/features/public/booking/api/fetchExperienceAvailability";
import { ExperienceCalendarGrid } from "@/features/public/booking/ui/ExperienceCalendarGrid";
import { ExperienceDateTrigger } from "@/features/public/booking/ui/ExperienceDateTrigger";
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

export type ExperienceCalendarPopoverProps = {
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
        <ExperienceDateTrigger selectedDate={selectedDate} />
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
