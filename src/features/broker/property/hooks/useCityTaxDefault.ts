import type { CityTaxDefault } from "@/db/schema";
import { fetchCityTaxDefault } from "@/features/broker/property/api/client-server/cityTaxApi";
import { useQuery } from "@tanstack/react-query";

export function useCityTaxDefault(city: string, country: string) {
  return useQuery<CityTaxDefault | null>({
    queryKey: ["city-tax", city, country],
    queryFn: () => fetchCityTaxDefault(city, country),
    enabled: city.length > 0 && country.length > 0,
  });
}
