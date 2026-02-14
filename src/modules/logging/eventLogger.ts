import { getDb } from "@/db";
import { eventLogs } from "@/db/schema";
import { nanoid } from "nanoid";

type LogLevel = "info" | "warning" | "error";

interface LogEntry {
  source: string;
  message: string;
  metadata?: Record<string, unknown>;
}

function insertLog(db: D1Database, level: LogLevel, entry: LogEntry) {
  const drizzle = getDb(db);
  drizzle
    .insert(eventLogs)
    .values({
      id: nanoid(),
      level,
      source: entry.source,
      message: entry.message,
      metadata: entry.metadata,
    })
    .then(() => {})
    .catch(console.error);
}

export function createEventLogger(db: D1Database) {
  return {
    info(entry: LogEntry) {
      insertLog(db, "info", entry);
    },
    warn(entry: LogEntry) {
      insertLog(db, "warning", entry);
    },
    error(entry: LogEntry) {
      insertLog(db, "error", entry);
    },
  };
}
