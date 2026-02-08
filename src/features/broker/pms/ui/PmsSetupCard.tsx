/**
 * Generic PMS integration setup card: status, loading, connected state, or setup form slot.
 * Receives integrationStatus + isLoading from parent (e.g. dashboard).
 */

import type {
  IntegrationStatusResponse,
  PmsIntegration,
} from "@/features/broker/pms/api";
import type { ReactNode } from "react";

export type PmsSetupCardProps = {
  integrationStatus: IntegrationStatusResponse | undefined;
  isLoading: boolean;
  connectedTitle: string;
  connectedDescription: string;
  getConnectedDetail?: (integration: PmsIntegration) => ReactNode;
  setupTitle: string;
  setupDescription: string;
  children: ReactNode;
};

export function PmsSetupCard({
  integrationStatus: status,
  isLoading,
  connectedTitle,
  connectedDescription,
  getConnectedDetail,
  setupTitle,
  setupDescription,
  children,
}: PmsSetupCardProps) {
  if (isLoading) {
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

  if (status?.hasIntegration && status.integration) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
            <svg
              aria-hidden
              className="w-6 h-6 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <title>Connected</title>
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
              {connectedTitle}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {connectedDescription}
            </p>
            {getConnectedDetail?.(status.integration)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <svg
            aria-hidden
            className="w-6 h-6 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <title>Connect</title>
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
            {setupTitle}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {setupDescription}
          </p>
          {children}
        </div>
      </div>
    </div>
  );
}
