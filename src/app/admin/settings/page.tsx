import { withRole } from "@/lib/auth/utils";
import { SettingsView } from "@/components/dashboard/settings/SettingsView";
import { getAgents } from "@/lib/db/actions/lead.actions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await withRole(["super_admin"]);
  const agentsRes = await getAgents();

  return (
    <SettingsView
      currentUser={{
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }}
      agents={agentsRes.data ?? []}
    />
  );
}
