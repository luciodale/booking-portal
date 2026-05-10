import { getDb } from "@/db";
import { eventLogs } from "@/db/schema";
import { nanoid } from "nanoid";

type LogLevel = "info" | "warning" | "error";

type LogEntry = {
  source: string;
  message: string;
  metadata?: Record<string, unknown>;
};

async function insertLog(db: D1Database, level: LogLevel, entry: LogEntry) {
  const drizzle = getDb(db);
  await drizzle.insert(eventLogs).values({
    id: nanoid(),
    level,
    source: entry.source,
    message: entry.message,
    metadata: entry.metadata,
  });
}

export function createEventLogger(db: D1Database) {
  return {
    info(entry: LogEntry) {
      return insertLog(db, "info", entry);
    },
    warn(entry: LogEntry) {
      return insertLog(db, "warning", entry);
    },
    error(entry: LogEntry) {
      return insertLog(db, "error", entry);
    },
  };
}
