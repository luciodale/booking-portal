import { getDb } from "@/db";
import { eventLogs } from "@/db/schema";
import { nanoid } from "nanoid";
import { type Logger, createLogger } from "./logger";
import { redactPii } from "./redact";

type LogLevel = "info" | "warning" | "error";

type LogEntry = {
  source: string;
  message: string;
  metadata?: Record<string, unknown>;
};

export type EventLogger = {
  correlationId: string;
  info(entry: LogEntry): Promise<void>;
  warn(entry: LogEntry): Promise<void>;
  error(entry: LogEntry): Promise<void>;
};

async function insertLog(
  db: D1Database,
  level: LogLevel,
  entry: LogEntry,
  jsonLogger: Logger
): Promise<void> {
  const sanitized = redactPii(entry.metadata ?? {});
  const enriched = {
    ...sanitized,
    correlationId: jsonLogger.correlationId,
  };

  if (level === "error") jsonLogger.error({ ...entry, metadata: enriched });
  else if (level === "warning")
    jsonLogger.warn({ ...entry, metadata: enriched });
  else jsonLogger.info({ ...entry, metadata: enriched });

  try {
    const drizzle = getDb(db);
    await drizzle.insert(eventLogs).values({
      id: nanoid(),
      level,
      source: entry.source,
      message: entry.message,
      metadata: enriched,
    });
  } catch (err) {
    // Logger must never throw. Worst case the DB row is missing but the
    // structured console line still carries the information.
    jsonLogger.error({
      source: "eventLogger",
      message: "Failed to persist event log",
      metadata: { error: err instanceof Error ? err.message : String(err) },
    });
  }
}

export function createEventLogger(
  db: D1Database,
  correlationId?: string
): EventLogger {
  const jsonLogger = createLogger(correlationId);
  return {
    correlationId: jsonLogger.correlationId,
    info(entry: LogEntry) {
      return insertLog(db, "info", entry, jsonLogger);
    },
    warn(entry: LogEntry) {
      return insertLog(db, "warning", entry, jsonLogger);
    },
    error(entry: LogEntry) {
      return insertLog(db, "error", entry, jsonLogger);
    },
  };
}
