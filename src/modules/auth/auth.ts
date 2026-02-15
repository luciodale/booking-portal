import type { APIContext } from "astro";

type Role = "admin" | "broker" | "user";

export interface AuthContext {
  userId: string;
  role: Role;
}

export function requireAuth(locals: APIContext["locals"]): AuthContext {
  const auth = locals.auth();
  if (!auth.userId) {
    throw new Error("Unauthorized");
  }

  const role =
    (auth.sessionClaims?.metadata as { role?: Role } | undefined)?.role ??
    "user";

  return {
    userId: auth.userId,
    role,
  };
}

export function checkRole(authContext: AuthContext, requiredRole: Role) {
  const roleHierarchy: Record<Role, number> = { admin: 3, broker: 2, user: 1 };
  return roleHierarchy[authContext.role] >= roleHierarchy[requiredRole];
}

export function requireAdmin(locals: APIContext["locals"]): AuthContext {
  const authContext = requireAuth(locals);

  if (!checkRole(authContext, "admin")) {
    throw new Error("Forbidden: Admin access required");
  }

  return authContext;
}
