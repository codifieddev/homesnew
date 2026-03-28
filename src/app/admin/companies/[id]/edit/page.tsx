import { notFound } from "next/navigation";
import { withRole } from "@/lib/auth/utils";
import { getAgents } from "@/lib/db/actions/lead.actions";
import { getCompanyById } from "@/lib/db/actions/company.actions";
import { CompanyForm } from "@/components/dashboard/companies/CompanyForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Edit Company" };

export default async function EditCompanyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await withRole(["super_admin", "admin", "company_manager"]);
  const { id } = await params;
  const [companyRes, managersRes] = await Promise.all([
    getCompanyById(id),
    getAgents(),
  ]);

  if (!companyRes.success || !companyRes.data) notFound();

  return (
    <CompanyForm
      company={companyRes.data}
      managers={(managersRes.data ?? []).filter(
        (agent) => agent.role === "company_manager"
      )}
      canManageAssignments={user.role !== "company_manager"}
    />
  );
}
