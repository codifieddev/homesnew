import { withRole } from "@/lib/auth/utils";
import { getAdminCompanies } from "@/lib/db/actions/company.actions";
import { getAdminProperties } from "@/lib/db/actions/property.actions";
import { PropertySiteForm } from "@/components/dashboard/property-sites/PropertySiteForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Add Property Microsite" };

export default async function NewPropertySitePage({
  searchParams,
}: {
  searchParams: Promise<{ propertyId?: string }>;
}) {
  const user = await withRole(["super_admin", "admin", "company_manager"]);
  const params = await searchParams;
  const [propertiesRes, companiesRes] = await Promise.all([
    getAdminProperties({ status: "active", limit: 50 }),
    getAdminCompanies(),
  ]);

  return (
    <PropertySiteForm
      properties={propertiesRes.data ?? []}
      companies={companiesRes.data ?? []}
      canPublish={["super_admin", "admin"].includes(user.role)}
      initialPropertyId={params.propertyId}
    />
  );
}
