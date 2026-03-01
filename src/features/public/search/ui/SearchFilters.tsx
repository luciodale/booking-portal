import type { TierFilter } from "@/features/public/search/types";
import { useLocale } from "@/i18n/react/LocaleProvider";
import { cn } from "@/modules/utils/cn";

type SearchFiltersProps = {
  city: string;
  resultCount: number;
  tierFilter: TierFilter;
  onTierChange: (tier: TierFilter) => void;
};

const TIERS: { value: TierFilter; labelKey: "search.filterAll" | "search.filterElite" | "search.filterStandard" }[] = [
  { value: "all", labelKey: "search.filterAll" },
  { value: "elite", labelKey: "search.filterElite" },
  { value: "standard", labelKey: "search.filterStandard" },
];

export function SearchFilters({ city, resultCount, tierFilter, onTierChange }: SearchFiltersProps) {
  const { t } = useLocale();

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div>
        <h1 className="text-lg font-semibold text-foreground">{city}</h1>
        <p className="text-sm text-muted-foreground">
          {resultCount === 1 ? t("search.resultsSingular") : t("search.results", { count: resultCount })}
        </p>
      </div>
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
  );
}
