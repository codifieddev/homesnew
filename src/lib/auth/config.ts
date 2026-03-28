import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db/connection";
import User from "@/lib/db/models/User";
import type { UserRole } from "@/types";
import { authConfig } from "./auth.config";
import { getAuthSecret } from "./secret";

/**
 * Main NextAuth configuration for Node.js environments.
 * Extends the shared Edge-safe authConfig with DB-dependent providers.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        await connectDB();

        // Explicitly select password (excluded by default via select:false)
        const user = await User.findOne({
          email: (credentials.email as string).toLowerCase().trim(),
          isActive: true,
        }).select("+password");

        if (!user) {
          throw new Error("Invalid email or password");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password!
        );

        if (!isPasswordValid) {
          throw new Error("Invalid email or password");
        }

        // Update last login timestamp (fire and forget)
        User.findByIdAndUpdate(user._id, {
          lastLoginAt: new Date(),
        }).catch(console.error);

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role as UserRole,
        };
      },
    }),
  ],
  secret: getAuthSecret(),
});
