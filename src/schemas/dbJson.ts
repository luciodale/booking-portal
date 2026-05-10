import { z } from "zod";

// Runtime guards for JSON columns. Drizzle's `.$type<>()` is compile time
// only — at read time the cell is whatever was last written, which may not
// match the current TS type. Use these to validate on reads from D1.

export const featureSchema = z.object({
  name: z.string().min(1).max(120),
  icon: z.string().min(1).max(60),
});
export type FeatureRow = z.infer<typeof featureSchema>;

export const featureArraySchema = z.array(featureSchema).default([]);

export const propertyAdditionalCostsSchema = z
  .array(
    z.object({
      label: z.string().min(1).max(120),
      amount: z.number().int().nonnegative(),
      per: z.enum(["stay", "night", "guest", "night_per_guest"]),
      maxNights: z.number().int().min(1).optional(),
    })
  )
  .default([]);

export const extrasSchema = z
  .array(
    z.object({
      name: z.string().min(1).max(120),
      icon: z.string().min(1).max(60),
      amount: z.number().int().nonnegative(),
      per: z.enum(["stay", "night", "guest", "night_per_guest"]),
      maxNights: z.number().int().min(1).optional(),
    })
  )
  .default([]);

export const logMetadataSchema = z.record(z.string(), z.unknown()).default({});

// Defensive parser: returns the default on validation failure so reads
// never throw. The caller can decide whether to log.
export function safeParseJson<T>(
  schema: z.ZodSchema<T>,
  value: unknown,
  fallback: T
): { data: T; ok: boolean } {
  const result = schema.safeParse(value);
  if (result.success) return { data: result.data, ok: true };
  return { data: fallback, ok: false };
}
