import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

export function getDb(D1Database: D1Database) {
  return drizzle(D1Database, { schema });
}

// Re-export everything from schema for convenience
export * from './schema';

