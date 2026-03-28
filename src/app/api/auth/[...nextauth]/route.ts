import { handlers } from "@/lib/auth/config";

// Export GET and POST handlers for NextAuth's
// /api/auth/* catch-all route (sign-in, sign-out, session, csrf)
export const { GET, POST } = handlers;
