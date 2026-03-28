import type { NextAuthConfig } from "next-auth";
import type { UserRole } from "@/types";

/**
 * Shared, Edge-compatible NextAuth configuration.
 * Contains callbacks, pages, and session settings.
 * Providers are defined separately in middleware-auth.ts and config.ts
 * to avoid importing Node-only libraries (like Mongoose) in Edge.
 */
export const authConfig = {
  providers: [], // Providers added in specific entry points
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.role = (user as { role: UserRole }).role;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.userId as string;
        session.user.role = token.role as UserRole;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
} satisfies NextAuthConfig;
