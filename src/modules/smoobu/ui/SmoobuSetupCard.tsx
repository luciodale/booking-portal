/**
 * SmoobuSetupCard - API Key Integration Component
 * Allows brokers to connect their Smoobu account
 */

import type { SmoobuUser } from "@/schemas/smoobu";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { verifySmoobuApiKey } from "../api/client";

// ============================================================================
// API Client Functions
// ============================================================================

async function checkIntegrationStatus(): Promise<{
  hasIntegration: boolean;
  integration: {
    id: string;
    provider: string;
    smoobuUserId?: number;
    smoobuEmail?: string;
  } | null;
}> {
  const response = await fetch("/api/backoffice/integrations");
  if (!response.ok) {
    throw new Error("Failed to check integration status");
  }
  const json = (await response.json()) as {
    data: {
      hasIntegration: boolean;
      integration: {
        id: string;
        provider: string;
        smoobuUserId?: number;
        smoobuEmail?: string;
      } | null;
    };
  };
  return json.data;
}

async function saveIntegration(params: {
  apiKey: string;
  smoobuUserId: number;
  smoobuEmail: string;
}): Promise<void> {
  const response = await fetch("/api/backoffice/integrations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      provider: "smoobu",
      apiKey: params.apiKey,
      smoobuUserId: params.smoobuUserId,
      smoobuEmail: params.smoobuEmail,
    }),
  });

  if (!response.ok) {
    const error = (await response.json()) as { error?: { message?: string } };
    throw new Error(error.error?.message || "Failed to save integration");
  }
}

// ============================================================================
// Component
// ============================================================================

export function SmoobuSetupCard() {
  const queryClient = useQueryClient();
  const [apiKey, setApiKey] = useState("");
  const [verifiedUser, setVerifiedUser] = useState<SmoobuUser | null>(null);

  // Check if integration already exists
  const { data: integrationStatus, isLoading: checkingStatus } = useQuery({
    queryKey: ["smoobu-integration"],
    queryFn: checkIntegrationStatus,
  });

  // Verify API key mutation
  const verifyMutation = useMutation({
    mutationFn: async (key: string) => {
      return await verifySmoobuApiKey({ apiKey: key });
    },
    onSuccess: (user) => {
      setVerifiedUser(user);
    },
    onError: (error: Error) => {
      console.error("Verification failed:", error);
      setVerifiedUser(null);
    },
  });

  // Save integration mutation
  const saveMutation = useMutation({
    mutationFn: saveIntegration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["smoobu-integration"] });
      setApiKey("");
      setVerifiedUser(null);
    },
  });

  const handleVerify = () => {
    if (!apiKey.trim()) return;
    verifyMutation.mutate(apiKey);
  };

  const handleConfirm = () => {
    if (!verifiedUser) return;
    saveMutation.mutate({
      apiKey,
      smoobuUserId: verifiedUser.id,
      smoobuEmail: verifiedUser.email,
    });
  };

  const handleCancel = () => {
    setVerifiedUser(null);
    setApiKey("");
    verifyMutation.reset();
  };

  // Already connected
  if (integrationStatus?.hasIntegration) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-6 h-6 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground mb-1">
              Smoobu Connected
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Your Smoobu account is connected and ready to use.
            </p>
            {integrationStatus.integration?.smoobuEmail && (
              <p className="text-xs text-muted-foreground">
                Connected as: {integrationStatus.integration.smoobuEmail}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (checkingStatus) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="animate-pulse flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-muted" />
          <div className="flex-1">
            <div className="h-4 bg-muted rounded w-1/3 mb-2" />
            <div className="h-3 bg-muted rounded w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  // Setup flow
  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <svg
            className="w-6 h-6 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-1">
            Connect Smoobu
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Connect your Smoobu account to manage properties and bookings.
          </p>

          {!verifiedUser ? (
            <>
              <div className="bg-muted/50 rounded-lg p-4 mb-4">
                <p className="text-xs text-muted-foreground mb-2">
                  <strong>How to get your API key:</strong>
                </p>
                <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Go to Smoobu → Advanced → API Keys</li>
                  <li>Generate an API key</li>
                  <li>Paste it below</li>
                </ol>
              </div>

              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="smoobu-api-key"
                    className="block text-sm font-medium text-foreground mb-1"
                  >
                    API Key
                  </label>
                  <input
                    id="smoobu-api-key"
                    type="text"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your Smoobu API key"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={verifyMutation.isPending}
                  />
                </div>

                {verifyMutation.isError && (
                  <div className="bg-error/10 border border-error/20 rounded-lg p-3">
                    <p className="text-sm text-error">
                      {verifyMutation.error?.message ||
                        "Failed to verify API key. Please check and try again."}
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleVerify}
                  disabled={!apiKey.trim() || verifyMutation.isPending}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {verifyMutation.isPending ? "Verifying..." : "Verify API Key"}
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <p className="text-sm font-medium text-foreground mb-2">
                  Confirm this is you:
                </p>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>
                    <strong>Name:</strong> {verifiedUser.firstName}{" "}
                    {verifiedUser.lastName}
                  </p>
                  <p>
                    <strong>Email:</strong> {verifiedUser.email}
                  </p>
                  <p>
                    <strong>User ID:</strong> {verifiedUser.id}
                  </p>
                </div>
              </div>

              {saveMutation.isError && (
                <div className="bg-error/10 border border-error/20 rounded-lg p-3">
                  <p className="text-sm text-error">
                    {saveMutation.error?.message ||
                      "Failed to save integration. Please try again."}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={saveMutation.isPending}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saveMutation.isPending
                    ? "Connecting..."
                    : "Yes, Connect Account"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saveMutation.isPending}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
