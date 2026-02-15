import { formatPrice } from "@/features/public/booking/domain/dateUtils";
import type { PriceLineItem } from "@/features/public/booking/domain/pricingTypes";

type PriceBreakdownProps = {
  items: PriceLineItem[];
  total: { label: string; amountCents: number };
  currency: string;
};

export function PriceBreakdown({
  items,
  total,
  currency,
}: PriceBreakdownProps) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.label}>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{item.label}</span>
            <span className="text-foreground">
              {item.amountCents > 0
                ? formatPrice(item.amountCents / 100, currency)
                : "—"}
            </span>
          </div>
          {item.detail && (
            <div className="text-[11px] text-muted-foreground/70 mt-0.5">
              {item.detail}
            </div>
          )}
        </div>
      ))}

      <div className="border-t border-border pt-2 mt-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">
            {total.label}
          </span>
          <span className="text-lg font-bold text-foreground">
            {formatPrice(total.amountCents / 100, currency)}
          </span>
        </div>
      </div>
    </div>
  );
}
