import { upsertCityTaxDefault } from "@/features/broker/property/api/client-server/cityTaxApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpsertCityTax() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: upsertCityTaxDefault,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["city-tax"] });
    },
  });
}
