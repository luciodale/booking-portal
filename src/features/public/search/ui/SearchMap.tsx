import { formatPrice } from "@/features/public/booking/domain/dateUtils";
import type {
  PropertyPrice,
  SearchProperty,
} from "@/features/public/search/types";
import L from "leaflet";
import { useEffect, useRef } from "react";

type SearchMapProps = {
  properties: SearchProperty[];
  prices: Map<string, PropertyPrice>;
  selectedId: string | null;
  focusId: string | null;
  onPropertySelect: (id: string) => void;
};

function tileUrl(dark: boolean) {
  const variant = dark ? "dark_all" : "light_all";
  return `https://{s}.basemaps.cartocdn.com/${variant}/{z}/{x}/{y}{r}.png`;
}

function createPriceIcon(price: string, selected: boolean) {
  return L.divIcon({
    className: "search-pin-wrapper",
    html: `<div class="search-pin search-pin--price${selected ? " search-pin--selected" : ""}">${price}</div>`,
    iconSize: [80, 32],
    iconAnchor: [40, 32],
  });
}

function createHomeIcon(selected: boolean) {
  return L.divIcon({
    className: "search-pin-wrapper",
    html: `<div class="search-pin search-pin--home${selected ? " search-pin--selected" : ""}">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      </svg>
    </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });
}

function featureIcon(svgPath: string) {
  return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${svgPath}</svg>`;
}

const bedIcon = featureIcon(
  '<path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/>'
);
const bathIcon = featureIcon(
  '<path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/><line x1="10" x2="8" y1="5" y2="7"/><line x1="2" x2="22" y1="12" y2="12"/><line x1="7" x2="7" y1="19" y2="21"/><line x1="17" x2="17" y1="19" y2="21"/>'
);
const guestIcon = featureIcon(
  '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>'
);

function createPopupContent(
  property: SearchProperty,
  price: PropertyPrice | undefined
) {
  const { asset, imageUrl } = property;
  const detailPath =
    asset.tier === "elite" ? `/elite/${asset.id}` : `/property/${asset.id}`;

  const badgeClass = asset.tier === "elite" ? "badge-elite" : "badge-standard";
  const badgeLabel = asset.tier === "elite" ? "Elite" : "Standard";

  const features: string[] = [];
  if (asset.bedrooms != null)
    features.push(
      `<span class="search-popup-feature">${bedIcon} ${asset.bedrooms}</span>`
    );
  if (asset.bathrooms != null)
    features.push(
      `<span class="search-popup-feature">${bathIcon} ${asset.bathrooms}</span>`
    );
  if (asset.maxOccupancy != null)
    features.push(
      `<span class="search-popup-feature">${guestIcon} ${asset.maxOccupancy}</span>`
    );

  const priceHtml =
    price && !price.loading && !price.error && price.avgNightlyRate > 0
      ? `<div class="search-popup-price"><span class="search-popup-price-value">${formatPrice(price.avgNightlyRate, price.currency)}</span><span class="search-popup-price-unit">/night</span></div>`
      : "";

  return `
    <a href="${detailPath}" class="search-popup-card" target="_blank" rel="noopener">
      <img src="${imageUrl}" alt="${asset.title ?? ""}" class="search-popup-img" />
      <div class="search-popup-info">
        <span class="search-popup-badge ${badgeClass}">${badgeLabel}</span>
        <div class="search-popup-title">${asset.title ?? ""}</div>
        ${features.length > 0 ? `<div class="search-popup-features">${features.join("")}</div>` : ""}
        ${priceHtml}
      </div>
    </a>
  `;
}

export function SearchMap({
  properties,
  prices,
  selectedId,
  focusId,
  onPropertySelect,
}: SearchMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef(new Map<string, L.Marker>());
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const updatingMarkersRef = useRef(false);
  const programmaticZoomRef = useRef(false);
  const hasUserZoomedRef = useRef(false);

  // Init map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      scrollWheelZoom: true,
      zoomControl: true,
      attributionControl: false,
    }).setView([45, 12], 5);

    map.on("zoomend", () => {
      if (!programmaticZoomRef.current) {
        hasUserZoomedRef.current = true;
      }
      programmaticZoomRef.current = false;
    });

    const isDark = document.documentElement.classList.contains("dark");
    tileLayerRef.current = L.tileLayer(tileUrl(isDark), {
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    const observer = new MutationObserver(() => {
      const dark = document.documentElement.classList.contains("dark");
      if (tileLayerRef.current) {
        tileLayerRef.current.setUrl(tileUrl(dark));
      }
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      observer.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers when properties/prices/selection change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers — suppress popupclose during cleanup
    updatingMarkersRef.current = true;
    for (const marker of markersRef.current.values()) {
      marker.remove();
    }
    markersRef.current.clear();
    updatingMarkersRef.current = false;

    if (properties.length === 0) return;

    const bounds = L.latLngBounds([]);

    for (const property of properties) {
      const { asset, latitude, longitude } = property;
      const isSelected = asset.id === selectedId;
      const price = prices.get(asset.id);
      const hasPrices =
        price && !price.loading && !price.error && price.avgNightlyRate > 0;

      const icon = hasPrices
        ? createPriceIcon(
            formatPrice(price.avgNightlyRate, price.currency),
            isSelected
          )
        : createHomeIcon(isSelected);

      const marker = L.marker([latitude, longitude], {
        icon,
        zIndexOffset: isSelected ? 1000 : 0,
      }).addTo(map);
      marker.on("click", () => onPropertySelect(asset.id));

      if (isSelected) {
        marker
          .bindPopup(createPopupContent(property, price), {
            maxWidth: 320,
            minWidth: 280,
            className: "search-popup",
            closeButton: true,
            offset: [0, -25],
          })
          .openPopup();
        marker.on("popupclose", () => {
          if (!updatingMarkersRef.current) onPropertySelect(asset.id);
        });
      }

      bounds.extend([latitude, longitude]);
      markersRef.current.set(asset.id, marker);
    }

    if (!selectedId && !focusId && bounds.isValid()) {
      programmaticZoomRef.current = true;
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
    }
  }, [properties, prices, selectedId, focusId, onPropertySelect]);

  // Fly to focused property
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !focusId) return;
    const property = properties.find((p) => p.asset.id === focusId);
    if (property) {
      const zoom = hasUserZoomedRef.current ? map.getZoom() : 16;
      programmaticZoomRef.current = true;
      map.flyTo([property.latitude, property.longitude], zoom, {
        duration: 0.8,
      });
    }
  }, [focusId, properties]);

  return <div ref={containerRef} className="w-full h-full z-0" />;
}
