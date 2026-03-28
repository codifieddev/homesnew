"use server";

import { getToken } from "next-auth/jwt";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { UserRole } from "@/types";
import { getAuthSecret, isSecureAuthCookie } from "./secret";

type SessionUser = {
  id: string;
  role: UserRole;
  name: string;
  email: string;
};

/**
 * Returns the current session user, or null if unauthenticated.
 * Safe to call from any Server Component or Server Action.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const secret = getAuthSecret();

  if (!secret) {
    return null;
  }

  try {
    const token = await getToken({
      req: { headers: new Headers(await headers()) },
      secret,
      secureCookie: isSecureAuthCookie(),
    });

    if (!token) {
      return null;
    }

    return {
      id: String(token.userId ?? token.sub ?? ""),
      role: (token.role as UserRole) ?? "agent",
      name: typeof token.name === "string" ? token.name : "",
      email: typeof token.email === "string" ? token.email : "",
    };
  } catch {
    return null;
  }
}

/**
 * Throws a redirect to /auth/login if the user is not authenticated.
 * Use at the top of any Server Action that requires a logged-in user.
 *
 * @example
 * export async function createLead(data: LeadInput) {
 *   await requireAuth();
 *   // ... rest of action
 * }
 */
export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/login");
  }
  return user;
}

/**
 * Requires the user to be authenticated AND have one of the allowed roles.
 * Redirects to /admin (403-equivalent) if the role is insufficient.
 *
 * @param allowedRoles - Array of roles that can proceed
 *
 * @example
 * export async function deleteProperty(id: string) {
 *   await withRole(["super_admin", "admin"]);
 *   // ... rest of action
 * }
 */
export async function withRole(allowedRoles: UserRole[]): Promise<SessionUser> {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    redirect("/admin?error=insufficient_permissions");
  }
  return user;
}

/**
 * Checks if the current user can perform admin-level mutations.
 * Returns false instead of redirecting — useful for conditional UI.
 */
export async function canManageProperties(): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  return ["super_admin", "admin", "company_manager"].includes(user.role);
}

/**
 * Checks if the current user is a super admin.
 */
export async function isSuperAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === "super_admin";
}
