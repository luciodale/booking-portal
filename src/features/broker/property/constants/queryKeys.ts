/**
 * Property query keys for React Query. Single source of truth.
 */

export const propertyQueryKeys = {
  all: ["properties"] as const,
  lists: () => [...propertyQueryKeys.all, "list"] as const,
  list: (filters?: {
    search?: string;
    tier?: string;
    status?: string;
  }) => [...propertyQueryKeys.lists(), filters] as const,
  details: () => [...propertyQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...propertyQueryKeys.details(), id] as const,
};
