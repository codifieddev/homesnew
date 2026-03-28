import { withRole } from "@/lib/auth/utils";
import { getAdminCompanies } from "@/lib/db/actions/company.actions";
import { getAdminProperties } from "@/lib/db/actions/property.actions";
import { CaseStudyForm } from "@/components/dashboard/case-studies/CaseStudyForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Add Case Study" };

export default async function NewCaseStudyPage() {
  const user = await withRole(["super_admin", "admin", "company_manager"]);
  const [companiesRes, propertiesRes] = await Promise.all([
    getAdminCompanies(),
    getAdminProperties({ status: "active", limit: 50 }),
  ]);

  return (
    <CaseStudyForm
      companies={companiesRes.data ?? []}
      properties={propertiesRes.data ?? []}
      canPublish={["super_admin", "admin"].includes(user.role)}
    />
  );
}
