import { cn } from "@/modules/utils/cn";

export function ExperienceDateTrigger({
  selectedDate,
}: {
  selectedDate: string | null;
}) {
  return (
    <div className="flex items-center gap-3 p-3.5 rounded-xl border-2 border-amber-500/40 bg-amber-500/5 hover:border-amber-400 transition-colors cursor-pointer">
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
        className="text-amber-400 shrink-0"
      >
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
        <line x1="16" x2="16" y1="2" y2="6" />
        <line x1="8" x2="8" y1="2" y2="6" />
        <line x1="3" x2="21" y1="10" y2="10" />
      </svg>

      <div className="flex-1">
        <div className="text-[10px] text-amber-400/70 font-medium uppercase tracking-wider">
          Date
        </div>
        <div
          className={cn("text-sm truncate", selectedDate ? "text-foreground font-semibold" : "text-amber-400/50")}
        >
          {selectedDate ?? "Select date"}
        </div>
      </div>
    </div>
  );
}
