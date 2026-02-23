import {
  fetchSettings,
  updateSetting,
} from "@/features/admin/settings/api/client-server/querySettings";
import { showError, showSuccess } from "@/modules/ui/react/stores/notificationStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const settingsQueryKeys = {
  all: ["platformSettings"] as const,
};

export function usePlatformSettings() {
  return useQuery({
    queryKey: settingsQueryKeys.all,
    queryFn: fetchSettings,
  });
}

export function useUpdateSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      updateSetting(key, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsQueryKeys.all });
      showSuccess("Setting updated");
    },
    onError: (error) => {
      showError(error.message);
    },
  });
}
