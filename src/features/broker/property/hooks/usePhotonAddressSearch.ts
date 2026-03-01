import { COUNTRY_MAP } from "@/modules/countries";
import { useCallback, useEffect, useRef, useState } from "react";

export interface PhotonSuggestion {
  label: string;
  value: string;
  street: string;
  zip: string;
  city: string;
  country: string;
  latitude: string;
  longitude: string;
}

interface PhotonProperties {
  name?: string;
  street?: string;
  housenumber?: string;
  postcode?: string;
  city?: string;
  state?: string;
  country?: string;
  countrycode?: string;
  type?: string;
}

interface PhotonFeature {
  type: "Feature";
  geometry: { type: "Point"; coordinates: [number, number] };
  properties: PhotonProperties;
}

interface PhotonResponse {
  type: "FeatureCollection";
  features: PhotonFeature[];
}

function buildLabel(props: PhotonProperties): string {
  const parts: string[] = [];
  if (props.street) {
    parts.push(
      props.housenumber ? `${props.street} ${props.housenumber}` : props.street
    );
  } else if (props.name) {
    parts.push(props.name);
  }
  if (props.city) parts.push(props.city);
  if (props.postcode) parts.push(props.postcode);
  if (props.country) parts.push(props.country);
  return parts.join(", ");
}

function mapFeature(feature: PhotonFeature): PhotonSuggestion {
  const { properties, geometry } = feature;
  const label = buildLabel(properties);
  const rawStreet = properties.street ?? (properties.type === "street" ? properties.name : undefined) ?? "";
  const street = properties.housenumber
    ? `${rawStreet} ${properties.housenumber}`.trim()
    : rawStreet;
  return {
    label,
    value: label,
    street,
    zip: properties.postcode ?? "",
    city: properties.city ?? "",
    country: (properties.countrycode && COUNTRY_MAP[properties.countrycode.toUpperCase()])
      ?? properties.country
      ?? "",
    latitude: String(geometry.coordinates[1]),
    longitude: String(geometry.coordinates[0]),
  };
}

const DEBOUNCE_MS = 350;
const MIN_CHARS = 3;

export function usePhotonAddressSearch() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<PhotonSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSuggestions = useCallback((q: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=5`,
      { signal: controller.signal }
    )
      .then((res) => res.json() as Promise<PhotonResponse>)
      .then((data) => {
        setSuggestions(data.features.map(mapFeature));
        setIsLoading(false);
      })
      .catch((err) => {
        if ((err as Error).name !== "AbortError") {
          setIsLoading(false);
        }
      });
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (query.length < MIN_CHARS) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    timerRef.current = setTimeout(() => fetchSuggestions(query), DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, fetchSuggestions]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  return { query, setQuery, suggestions, isLoading };
}
