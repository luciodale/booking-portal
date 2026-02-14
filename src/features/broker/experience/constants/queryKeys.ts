/**
 * Experience query keys for React Query. Single source of truth.
 */

export const experienceQueryKeys = {
  all: ["experiences"] as const,
  lists: () => [...experienceQueryKeys.all, "list"] as const,
  list: (filters?: {
    search?: string;
    category?: string;
    status?: string;
  }) => [...experienceQueryKeys.lists(), filters] as const,
  details: () => [...experienceQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...experienceQueryKeys.details(), id] as const,
};
