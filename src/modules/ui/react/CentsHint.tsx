import { centsToUnit } from "@/modules/money/money";

export function CentsHint({ cents }: { cents: number | undefined }) {
  if (cents == null || cents <= 0) return null;
  return (
    <span className="text-xs text-muted-foreground ml-2">
      = €{centsToUnit(cents).toLocaleString()}
    </span>
  );
}
