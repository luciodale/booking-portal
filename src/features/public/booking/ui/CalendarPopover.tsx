import { CalendarGrid } from "@/features/public/booking/ui/CalendarGrid";
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

type CalendarPopoverProps = {
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

function DateTrigger({
  checkIn,
  checkOut,
}: {
  checkIn: string | null;
  checkOut: string | null;
}) {
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

      <div className="flex-1 flex items-center gap-2 min-w-0">
        <DateSlot label="Check-in" value={checkIn} />
        <span className="text-muted-foreground/50">&rarr;</span>
        <DateSlot label="Check-out" value={checkOut} />
      </div>
    </div>
  );
}

function DateSlot({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex-1 min-w-0">
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div
        className={`text-sm truncate ${value ? "text-foreground font-medium" : "text-muted-foreground/60"}`}
      >
        {value ?? "Select date"}
      </div>
    </div>
  );
}
