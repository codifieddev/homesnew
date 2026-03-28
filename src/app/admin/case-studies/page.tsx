import { requireAuth } from "@/lib/auth/utils";
import { getAdminCompanies } from "@/lib/db/actions/company.actions";
import { getAdminCaseStudies } from "@/lib/db/actions/case-study.actions";
import { CaseStudyTable } from "@/components/dashboard/case-studies/CaseStudyTable";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Case Studies" };

export default async function CaseStudiesPage() {
  const user = await requireAuth();
  const [caseStudiesRes, companiesRes] = await Promise.all([
    getAdminCaseStudies(),
    getAdminCompanies(),
  ]);

  return (
    <CaseStudyTable
      caseStudies={caseStudiesRes.data ?? []}
      companies={companiesRes.data ?? []}
      role={user.role}
    />
  );
}
