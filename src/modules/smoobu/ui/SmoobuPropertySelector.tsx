/**
 * SmoobuPropertySelector - Step 1 of property creation
 * Allows selection of a Smoobu property and fetches its details
 */

import type {
  SmoobuApartmentDetails,
  SmoobuApartmentsResponse,
} from "@/schemas/smoobu";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";

// ============================================================================
// API Client Functions - Using worker endpoints
// ============================================================================

async function fetchApartments(): Promise<SmoobuApartmentsResponse> {
  const response = await fetch("/api/smoobu/apartments");
  if (!response.ok) {
    const error = (await response.json()) as { error?: { message?: string } };
    throw new Error(error.error?.message || "Failed to fetch apartments");
  }
  const json = (await response.json()) as { data: SmoobuApartmentsResponse };
  return json.data;
}

async function fetchApartmentDetails(
  apartmentId: number
): Promise<SmoobuApartmentDetails> {
  const response = await fetch(`/api/smoobu/apartments/${apartmentId}`);
  if (!response.ok) {
    const error = (await response.json()) as { error?: { message?: string } };
    throw new Error(
      error.error?.message || "Failed to fetch apartment details"
    );
  }
  const json = (await response.json()) as { data: SmoobuApartmentDetails };
  return json.data;
}

// ============================================================================
// Types
// ============================================================================

interface SmoobuPropertySelectorProps {
  onSelect: (
    apartmentId: number,
    apartmentDetails: SmoobuApartmentDetails
  ) => void;
  isLoading?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export function SmoobuPropertySelector({
  onSelect,
  isLoading = false,
}: SmoobuPropertySelectorProps) {
  const [selectedApartmentId, setSelectedApartmentId] = useState<number | null>(
    null
  );

  // Fetch apartments list via worker endpoint
  const {
    data: apartmentsData,
    isLoading: loadingApartments,
    error: apartmentsError,
  } = useQuery({
    queryKey: ["smoobu-apartments"],
    queryFn: fetchApartments,
  });

  // Fetch apartment details
  const detailsMutation = useMutation({
    mutationFn: fetchApartmentDetails,
    onSuccess: (details) => {
      if (selectedApartmentId) {
        onSelect(selectedApartmentId, details);
      }
    },
  });

  const handleSelectApartment = (apartmentId: number) => {
    setSelectedApartmentId(apartmentId);
    detailsMutation.mutate(apartmentId);
  };

  if (loadingApartments) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Select Smoobu Property
        </h3>
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-[1.5px] border-zinc-800/20 border-t-zinc-900" />
          <p className="text-sm text-muted-foreground">
            Loading properties from Smoobu...
          </p>
        </div>
      </div>
    );
  }

  if (apartmentsError) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Select Smoobu Property
        </h3>
        <div className="bg-error/10 border border-error/20 rounded-lg p-4">
          <p className="text-sm text-error">
            {apartmentsError.message || "Failed to load properties"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Select Smoobu Property
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        Choose a property from your Smoobu account to import.
      </p>

      {apartmentsData && apartmentsData.apartments.length > 0 ? (
        <div className="space-y-2">
          {apartmentsData.apartments.map((apt) => (
            <button
              key={apt.id}
              type="button"
              onClick={() => handleSelectApartment(apt.id)}
              disabled={isLoading || detailsMutation.isPending}
              className={`w-full text-left px-4 py-3 border rounded-lg transition-colors ${
                selectedApartmentId === apt.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <p className="text-sm font-medium text-foreground">{apt.name}</p>
              <p className="text-xs text-muted-foreground">ID: {apt.id}</p>
              {selectedApartmentId === apt.id && detailsMutation.isPending && (
                <p className="text-xs text-primary mt-1">Loading details...</p>
              )}
            </button>
          ))}
        </div>
      ) : (
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            No properties found in your Smoobu account.
          </p>
        </div>
      )}

      {detailsMutation.isError && (
        <div className="mt-4 bg-error/10 border border-error/20 rounded-lg p-3">
          <p className="text-sm text-error">
            {detailsMutation.error?.message ||
              "Failed to fetch property details"}
          </p>
        </div>
      )}
    </div>
  );
}
