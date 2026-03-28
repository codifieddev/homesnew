import type { ReactNode } from "react";

/**
 * App Router pages use server-side auth helpers, so we do not need to
 * hydrate a client session context on every page load.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  return children;
}
