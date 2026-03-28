import { PropertyForm } from "@/components/dashboard/properties/PropertyForm";
import { withRole } from "@/lib/auth/utils";
import { getAdminCompanies } from "@/lib/db/actions/company.actions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Add Property" };

export default async function NewPropertyPage() {
  await withRole(["super_admin", "admin", "company_manager"]);
  const companiesRes = await getAdminCompanies();
  return (
    <div className="py-2">
      <PropertyForm companies={companiesRes.data ?? []} />
    </div>
  );
}
