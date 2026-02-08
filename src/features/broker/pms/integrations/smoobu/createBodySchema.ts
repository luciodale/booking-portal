/**
 * Smoobu-specific validation for create/update integration body.
 */

import { z } from "zod";

export const smoobuCreateBodySchema = z.object({
  provider: z.literal("smoobu"),
  apiKey: z.string().min(1),
  pmsUserId: z.number().optional(),
  pmsEmail: z.email().optional(),
});

export type TSmoobuCreateBody = z.infer<typeof smoobuCreateBodySchema>;
export type TSmoobuCreateBodyInput = z.input<typeof smoobuCreateBodySchema>;
