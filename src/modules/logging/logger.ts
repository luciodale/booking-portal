import { nanoid } from "nanoid";

export type LogLevel = "info" | "warning" | "error";

export type LogPayload = {
  source: string;
  message: string;
  metadata?: Record<string, unknown>;
};

export type Logger = {
  correlationId: string;
  info(entry: LogPayload): void;
  warn(entry: LogPayload): void;
  error(entry: LogPayload): void;
};

function emit(level: LogLevel, correlationId: string, entry: LogPayload): void {
  const record = {
    ts: new Date().toISOString(),
    level,
    correlationId,
    source: entry.source,
    message: entry.message,
    ...(entry.metadata ? { metadata: entry.metadata } : {}),
  };
  const line = JSON.stringify(record);
  if (level === "error") console.error(line);
  else if (level === "warning") console.warn(line);
  // biome-ignore lint/suspicious/noConsole: structured logger writes to Workers Logs
  else console.log(line);
}

export function createLogger(correlationId?: string): Logger {
  const cid = correlationId ?? nanoid();
  return {
    correlationId: cid,
    info(entry) {
      emit("info", cid, entry);
    },
    warn(entry) {
      emit("warning", cid, entry);
    },
    error(entry) {
      emit("error", cid, entry);
    },
  };
}
