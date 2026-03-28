import type { DefaultSession, DefaultJWT } from "next-auth";
import type { UserRole } from "@/types";

/**
 * Extends the default NextAuth Session and JWT types to include
 * our custom fields: id, role.
 *
 * This file must be imported (or referenced in tsconfig) for the
 * augmented types to apply globally across the project.
 */

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      name: string;
      email: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: UserRole;
    name: string;
    email: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    userId: string;
    role: UserRole;
    name: string;
  }
}
