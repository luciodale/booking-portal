/**
 * BrokerNotifications - Display broker logs and notifications
 * Shows last 10 logs with ability to acknowledge
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ============================================================================
// Types
// ============================================================================

interface BrokerLog {
  id: string;
  eventType: string;
  relatedEntityId: string | null;
  message: string;
  metadata: Record<string, unknown> | null;
  acknowledged: boolean;
  createdAt: string;
}

// ============================================================================
// API Client Functions
// ============================================================================

async function fetchBrokerLogs(): Promise<BrokerLog[]> {
  const response = await fetch("/api/backoffice/logs");
  if (!response.ok) {
    throw new Error("Failed to fetch logs");
  }
  const json = (await response.json()) as { data: { logs: BrokerLog[] } };
  return json.data.logs;
}

async function acknowledgeLogs(logIds: string[]): Promise<void> {
  const response = await fetch("/api/backoffice/logs/acknowledge", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ logIds }),
  });

  if (!response.ok) {
    throw new Error("Failed to acknowledge logs");
  }
}

// ============================================================================
// Component
// ============================================================================

export function BrokerNotifications() {
  const queryClient = useQueryClient();

  const { data: logs, isLoading } = useQuery({
    queryKey: ["broker-logs"],
    queryFn: fetchBrokerLogs,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const acknowledgeMutation = useMutation({
    mutationFn: acknowledgeLogs,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["broker-logs"] });
    },
  });

  const unacknowledgedLogs = logs?.filter((log) => !log.acknowledged) || [];
  const acknowledgedLogs = logs?.filter((log) => log.acknowledged) || [];

  const handleAcknowledge = (logId: string) => {
    acknowledgeMutation.mutate([logId]);
  };

  const handleAcknowledgeAll = () => {
    const ids = unacknowledgedLogs.map((log) => log.id);
    if (ids.length > 0) {
      acknowledgeMutation.mutate(ids);
    }
  };

  const getEventTypeColor = (eventType: string) => {
    if (eventType.includes("failure") || eventType.includes("error")) {
      return "text-error bg-error/10 border-error/20";
    }
    if (eventType.includes("success")) {
      return "text-green-600 bg-green-500/10 border-green-500/20";
    }
    return "text-primary bg-primary/10 border-primary/20";
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Notifications
        </h3>
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-[1.5px] border-zinc-800/20 border-t-zinc-900" />
          <p className="text-sm text-muted-foreground">
            Loading notifications...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Notifications</h3>
        {unacknowledgedLogs.length > 0 && (
          <button
            type="button"
            onClick={handleAcknowledgeAll}
            disabled={acknowledgeMutation.isPending}
            className="text-xs btn-secondary disabled:opacity-50"
          >
            Acknowledge All ({unacknowledgedLogs.length})
          </button>
        )}
      </div>

      {logs && logs.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">No notifications yet</p>
        </div>
      )}

      {/* Unacknowledged Logs */}
      {unacknowledgedLogs.length > 0 && (
        <div className="space-y-3 mb-6">
          <h4 className="text-sm font-medium text-foreground">
            Unacknowledged ({unacknowledgedLogs.length})
          </h4>
          {unacknowledgedLogs.map((log) => (
            <div
              key={log.id}
              className="border border-border rounded-lg p-4 space-y-2"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-xs px-2 py-1 rounded border ${getEventTypeColor(
                        log.eventType
                      )}`}
                    >
                      {log.eventType}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-foreground">{log.message}</p>
                  {log.relatedEntityId && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Related: {log.relatedEntityId}
                    </p>
                  )}
                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <details className="mt-2">
                      <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                        View details
                      </summary>
                      <pre className="text-xs bg-muted/50 rounded p-2 mt-1 overflow-x-auto">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleAcknowledge(log.id)}
                  disabled={acknowledgeMutation.isPending}
                  className="text-xs btn-secondary disabled:opacity-50 whitespace-nowrap"
                >
                  Acknowledge
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Acknowledged Logs */}
      {acknowledgedLogs.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">
            Recent Activity ({acknowledgedLogs.length})
          </h4>
          {acknowledgedLogs.slice(0, 5).map((log) => (
            <div
              key={log.id}
              className="border border-border/50 rounded-lg p-3 opacity-60 space-y-1"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-2 py-1 rounded border ${getEventTypeColor(
                    log.eventType
                  )}`}
                >
                  {log.eventType}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-foreground">{log.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
