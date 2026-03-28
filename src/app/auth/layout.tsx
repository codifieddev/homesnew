import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — Homes Admin",
  description: "Sign in to the Homes property management dashboard.",
  robots: { index: false, follow: false },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
