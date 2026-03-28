import { withRole } from "@/lib/auth/utils";
import { getAgents } from "@/lib/db/actions/lead.actions";
import { CompanyForm } from "@/components/dashboard/companies/CompanyForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Add Company" };

export default async function NewCompanyPage() {
  await withRole(["super_admin", "admin"]);
  const managersRes = await getAgents();

  return (
    <CompanyForm
      managers={(managersRes.data ?? []).filter(
        (agent) => agent.role === "company_manager"
      )}
      canManageAssignments
    />
  );
}
