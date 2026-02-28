import {
  deleteBrokerFee,
  fetchBrokerFees,
  fetchBrokers,
  upsertBrokerFee,
} from "@/features/admin/settings/api/client-server/queryBrokerFees";
import {
  showError,
  showSuccess,
} from "@/modules/ui/react/stores/notificationStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const brokerFeeKeys = {
  all: ["brokerFees"] as const,
  brokers: ["brokers"] as const,
};

export function useBrokerFees() {
  return useQuery({
    queryKey: brokerFeeKeys.all,
    queryFn: fetchBrokerFees,
  });
}

export function useUpsertBrokerFee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, feePercent }: { userId: string; feePercent: number }) =>
      upsertBrokerFee(userId, feePercent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brokerFeeKeys.all });
      showSuccess("Broker fee override saved");
    },
    onError: (error) => {
      showError(error.message);
    },
  });
}

export function useDeleteBrokerFee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId }: { userId: string }) => deleteBrokerFee(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brokerFeeKeys.all });
      showSuccess("Broker fee override removed");
    },
    onError: (error) => {
      showError(error.message);
    },
  });
}

export function useBrokers() {
  return useQuery({
    queryKey: brokerFeeKeys.brokers,
    queryFn: fetchBrokers,
  });
}
