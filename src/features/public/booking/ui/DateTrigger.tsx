import { cn } from "@/modules/utils/cn";

type DateTriggerProps = {
  checkIn: string | null;
  checkOut: string | null;
  variant?: "card" | "inline";
};

export function DateTrigger({
  checkIn,
  checkOut,
  variant = "card",
}: DateTriggerProps) {
  if (variant === "inline") {
    return (
      <div className="flex items-center gap-2 whitespace-nowrap">
        <svg
          aria-hidden="true"
          className="w-4 h-4 text-muted-foreground shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
          <line x1="16" x2="16" y1="2" y2="6" />
          <line x1="8" x2="8" y1="2" y2="6" />
          <line x1="3" x2="21" y1="10" y2="10" />
        </svg>
        <span
          className={cn(
            "text-base",
            checkIn ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {checkIn ?? "Check-in"}
        </span>
        <span className="text-muted-foreground text-base">&rarr;</span>
        <span
          className={cn(
            "text-base",
            checkOut ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {checkOut ?? "Check-out"}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3.5 rounded-xl border-2 border-primary/40 bg-primary/5 hover:border-primary transition-colors cursor-pointer">
      <svg
        aria-hidden="true"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-primary shrink-0"
      >
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
        <line x1="16" x2="16" y1="2" y2="6" />
        <line x1="8" x2="8" y1="2" y2="6" />
        <line x1="3" x2="21" y1="10" y2="10" />
      </svg>

      <div className="flex-1 flex items-center gap-2 min-w-0">
        <DateSlot label="Check-in" value={checkIn} />
        <span className="text-primary/50">&rarr;</span>
        <DateSlot label="Check-out" value={checkOut} />
      </div>
    </div>
  );
}

export function DateSlot({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div className="flex-1 min-w-0">
      <div className="text-[10px] text-primary/70 font-medium uppercase tracking-wider">
        {label}
      </div>
      <div
        className={cn("text-sm truncate", value && "text-foreground font-semibold")}
      >
        {value ?? "Select date"}
      </div>
    </div>
  );
}
