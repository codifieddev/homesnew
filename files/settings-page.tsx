import { auth } from "@/lib/auth/config";
import { withRole } from "@/lib/auth/utils";
import { SettingsView } from "@/components/dashboard/settings/SettingsView";
import { getAgents } from "@/lib/db/actions/lead.actions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  await withRole(["super_admin"]);
  const session = await auth();
  const agentsRes = await getAgents();

  return (
    <SettingsView
      currentUser={{
        id: session!.user.id,
        name: session!.user.name,
        email: session!.user.email,
        role: session!.user.role,
      }}
      agents={agentsRes.data ?? []}
    />
  );
}
