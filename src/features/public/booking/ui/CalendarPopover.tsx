import { CalendarGrid } from "@/features/public/booking/ui/CalendarGrid";
import { DateTrigger } from "@/features/public/booking/ui/DateTrigger";
import type { SmoobuRateDay } from "@/schemas/smoobu";
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

export type CalendarPopoverProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentMonth: Date;
  checkIn: string | null;
  checkOut: string | null;
  rateMap: Record<string, SmoobuRateDay>;
  ratesLoading: boolean;
  currency: string | null;
  onDateClick: (dateStr: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onConfirm: () => void;
};

export function CalendarPopover({
  isOpen,
  onOpenChange,
  currentMonth,
  checkIn,
  checkOut,
  rateMap,
  ratesLoading,
  currency,
  onDateClick,
  onPrevMonth,
  onNextMonth,
  onConfirm,
}: CalendarPopoverProps) {
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
        <DateTrigger checkIn={checkIn} checkOut={checkOut} />
      </button>

      {isOpen && (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false} closeOnFocusOut={false}>
            <div
              ref={refs.setFloating}
              style={floatingStyles}
              className="z-50 min-w-[600px] p-5 rounded-2xl bg-card border border-border shadow-2xl shadow-black/40"
              {...getFloatingProps()}
            >
              <CalendarGrid
                currentMonth={currentMonth}
                checkIn={checkIn}
                checkOut={checkOut}
                rateMap={rateMap}
                ratesLoading={ratesLoading}
                currency={currency}
                onDateClick={onDateClick}
                onPrevMonth={onPrevMonth}
                onNextMonth={onNextMonth}
              />

              <div className="mt-3 pt-3 border-t border-border flex justify-end">
                <button
                  type="button"
                  onClick={onConfirm}
                  className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
                >
                  Confirm
                </button>
              </div>
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </>
  );
}
