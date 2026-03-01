import { formatPrice } from "@/features/public/booking/domain/dateUtils";
import type {
  PropertyPrice,
  SearchProperty,
} from "@/features/public/search/types";
import { useLocale } from "@/i18n/react/LocaleProvider";
import { cn } from "@/modules/utils/cn";
import { formatAddress } from "@/utils/formatLocation";
import {
  Bath,
  Bed,
  ExternalLink,
  MapPin,
  Maximize,
  Users,
  Zap,
} from "lucide-react";

type SearchPropertyCardProps = {
  property: SearchProperty;
  price: PropertyPrice | undefined;
  isSelected: boolean;
  onViewOnMap: (id: string) => void;
};

export function SearchPropertyCard({
  property,
  price,
  isSelected,
  onViewOnMap,
}: SearchPropertyCardProps) {
  const { t, localePath } = useLocale();
  const { asset, imageUrl } = property;
  const detailPath = localePath(
    asset.tier === "elite" ? `/elite/${asset.id}` : `/property/${asset.id}`
  );

  return (
    <div
      className={cn(
        "flex gap-4 p-3 rounded-xl border transition-all w-full text-left",
        isSelected ? "border-primary bg-primary/5 shadow-md" : "border-border"
      )}
    >
      <img
        src={imageUrl}
        alt={asset.title ?? ""}
        className="w-44 h-32 sm:w-52 sm:h-36 object-cover rounded-lg shrink-0"
        loading="lazy"
      />
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className={cn(
                "text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                asset.tier === "elite" ? "badge-elite" : "badge-standard"
              )}
            >
              {asset.tier === "elite" ? "Elite" : "Standard"}
            </span>
            {asset.instantBook && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-primary">
                <Zap className="w-3 h-3" />
                Instant
              </span>
            )}
          </div>
          <p className="text-base font-semibold text-foreground line-clamp-1">
            {asset.title}
          </p>
          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
            {formatAddress(asset)}
          </p>
          {asset.shortDescription && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1.5">
              {asset.shortDescription}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {asset.bedrooms != null && (
              <span className="inline-flex items-center gap-1">
                <Bed className="w-3.5 h-3.5" />
                {asset.bedrooms}
              </span>
            )}
            {asset.bathrooms != null && (
              <span className="inline-flex items-center gap-1">
                <Bath className="w-3.5 h-3.5" />
                {asset.bathrooms}
              </span>
            )}
            {asset.maxOccupancy != null && (
              <span className="inline-flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {asset.maxOccupancy}
              </span>
            )}
            {asset.sqMeters != null && (
              <span className="inline-flex items-center gap-1">
                <Maximize className="w-3.5 h-3.5" />
                {asset.sqMeters}m²
              </span>
            )}
          </div>

          <div className="text-right">
            {price &&
              !price.loading &&
              !price.error &&
              price.avgNightlyRate > 0 && (
                <p className="text-base font-bold text-foreground">
                  {formatPrice(price.avgNightlyRate, price.currency)}
                  <span className="text-xs font-normal text-muted-foreground ml-0.5">
                    {t("search.perNight")}
                  </span>
                </p>
              )}
            {price?.loading && (
              <div className="h-5 w-20 bg-muted rounded animate-pulse" />
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-2.5">
          <button
            type="button"
            onClick={() => onViewOnMap(asset.id)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-foreground hover:bg-secondary transition-colors"
          >
            <MapPin className="w-3.5 h-3.5" />
            {t("search.viewOnMap")}
          </button>
          <a
            href={detailPath}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            {t("search.viewProperty")}
          </a>
        </div>
      </div>
    </div>
  );
}
