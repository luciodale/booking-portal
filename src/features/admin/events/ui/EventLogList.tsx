import { useEventLogs } from "@/features/admin/events/queries/useEventLogs";
import { Select } from "@/modules/ui/Select";
import { cn } from "@/modules/utils/cn";
import { useState } from "react";

const LEVEL_OPTIONS = [
  { value: "", label: "All Levels" },
  { value: "error", label: "Error" },
  { value: "warning", label: "Warning" },
  { value: "info", label: "Info" },
];

const LEVEL_STYLES: Record<string, string> = {
  error: "bg-error/20 text-error",
  warning: "bg-warning/20 text-warning",
  info: "bg-success/20 text-success",
};

function useEventLogFilters() {
  const [levelFilter, setLevelFilter] = useState("");
  const { data, isLoading, error } = useEventLogs({
    level: levelFilter || undefined,
  });

  return { levelFilter, setLevelFilter, data, isLoading, error };
}

export function EventLogList() {
  const { levelFilter, setLevelFilter, data, isLoading, error } =
    useEventLogFilters();

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Event Logs</h1>
      </div>

      <div className="mb-6 flex gap-4">
        <Select
          value={levelFilter}
          onChange={setLevelFilter}
          options={LEVEL_OPTIONS}
          placeholder="All Levels"
          className="w-auto min-w-40"
        />
      </div>

      {error && (
        <div className="bg-error/10 border border-error/20 rounded-lg p-4 mb-6">
          <p className="text-error text-sm">
            Failed to load event logs: {error.message}
          </p>
        </div>
      )}

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-secondary">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Level
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Source
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Message
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Time
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-12 text-center text-muted-foreground"
                >
                  Loading event logs...
                </td>
              </tr>
            ) : !data || data.logs.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-12 text-center text-muted-foreground"
                >
                  No event logs found.
                </td>
              </tr>
            ) : (
              data.logs.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-secondary/50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={cn(
                        "px-2.5 py-1 inline-flex text-xs leading-5 font-medium rounded-full",
                        LEVEL_STYLES[log.level]
                      )}
                    >
                      {log.level}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {log.source}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground max-w-md truncate">
                    {log.message}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {log.createdAt
                      ? new Date(log.createdAt).toLocaleString()
                      : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
