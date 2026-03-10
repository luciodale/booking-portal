import type { TierFilter } from "@/features/public/search/types";
import { useLocale } from "@/i18n/react/LocaleProvider";
import { cn } from "@/modules/utils/cn";

type SearchFiltersProps = {
  city: string;
  resultCount: number;
  tierFilter: TierFilter;
  onTierChange: (tier: TierFilter) => void;
  onlyAvailable: boolean;
  onOnlyAvailableChange: (value: boolean) => void;
  showAvailabilityToggle: boolean;
};

const TIERS: { value: TierFilter; labelKey: "search.filterAll" | "search.filterElite" | "search.filterStandard" }[] = [
  { value: "all", labelKey: "search.filterAll" },
  { value: "elite", labelKey: "search.filterElite" },
  { value: "standard", labelKey: "search.filterStandard" },
];

export function SearchFilters({
  city,
  resultCount,
  tierFilter,
  onTierChange,
  onlyAvailable,
  onOnlyAvailableChange,
  showAvailabilityToggle,
}: SearchFiltersProps) {
  const { t } = useLocale();

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div>
        <h1 className="text-lg font-semibold text-foreground">{city}</h1>
        <p className="text-sm text-muted-foreground">
          {resultCount === 1 ? t("search.resultsSingular") : t("search.results", { count: resultCount })}
        </p>
      </div>
      <div className="flex items-center gap-3">
        {showAvailabilityToggle && (
          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {t("search.onlyAvailable")}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={onlyAvailable}
              onClick={() => onOnlyAvailableChange(!onlyAvailable)}
              className={cn(
                "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border-2 border-transparent transition-colors",
                onlyAvailable ? "bg-primary" : "bg-border"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform",
                  onlyAvailable ? "translate-x-4" : "translate-x-0.5"
                )}
              />
            </button>
          </label>
        )}
        <div className="flex rounded-full border border-border bg-card p-1 gap-0.5">
          {TIERS.map(({ value, labelKey }) => (
            <button
              key={value}
              type="button"
              onClick={() => onTierChange(value)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-full transition-colors",
                tierFilter === value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t(labelKey)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
