/**
 * Authentication Helpers
 * Placeholder implementation ready for Clerk integration
 *
 * @note These are temporary mock implementations that return admin access
 * @note When integrating Clerk, replace these with actual Clerk SDK calls
 */

export interface AuthContext {
  userId: string;
  role: "admin" | "broker" | "user";
  email?: string;
}

/**
 * Requires authentication for the current request
 * @placeholder Returns mock admin user until Clerk is integrated
 * @returns AuthContext with user information
 * @throws {Error} When authentication fails (in future Clerk integration)
 */
export async function requireAuth(): Promise<AuthContext> {
  // TODO: Replace with Clerk authentication
  // const { userId } = await auth();
  // if (!userId) throw new Error("Unauthorized");
  // const user = await clerkClient.users.getUser(userId);

  return {
    userId: "mock-admin-001",
    role: "admin",
    email: "admin@example.com",
  };
}

/**
 * Checks if the authenticated user has the required role
 * @placeholder Currently always returns true for admin role
 * @param authContext - The authenticated user context
 * @param requiredRole - The role required for access
 * @returns true if user has required role
 */
export function checkRole(
  authContext: AuthContext,
  requiredRole: "admin" | "broker" | "user"
): boolean {
  // TODO: Implement actual role hierarchy when Clerk is integrated
  // Admin > Broker > User
  const roleHierarchy = { admin: 3, broker: 2, user: 1 };

  return roleHierarchy[authContext.role] >= roleHierarchy[requiredRole];
}

/**
 * Requires admin role for the current request
 * @placeholder Currently always passes until Clerk is integrated
 * @throws {Error} When user doesn't have admin role
 */
export async function requireAdmin(): Promise<AuthContext> {
  const authContext = await requireAuth();

  if (!checkRole(authContext, "admin")) {
    throw new Error("Forbidden: Admin access required");
  }

  return authContext;
}
