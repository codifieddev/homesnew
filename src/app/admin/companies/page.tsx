import { requireAuth } from "@/lib/auth/utils";
import { getAdminCompanies } from "@/lib/db/actions/company.actions";
import { CompanyTable } from "@/components/dashboard/companies/CompanyTable";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Companies" };

export default async function CompaniesPage() {
  const user = await requireAuth();
  const companiesRes = await getAdminCompanies();

  return (
    <CompanyTable
      companies={companiesRes.data ?? []}
      role={user.role}
    />
  );
}
