import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

/**
 * Minimal NextAuth instance for Edge Runtime (Middleware/Proxy).
 * Does not include providers that use Node-only libraries.
 */
export const { auth } = NextAuth(authConfig);
