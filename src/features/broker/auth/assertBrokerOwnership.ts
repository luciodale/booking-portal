import type { BrokerContext } from "./resolveBrokerContext";

export function assertBrokerOwnership(
  record: { userId: string },
  ctx: BrokerContext
): void {
  if (ctx.isAdmin) return;
  if (record.userId !== ctx.userId) {
    throw new Error("Forbidden");
  }
}
