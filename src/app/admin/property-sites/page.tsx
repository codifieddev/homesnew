import { requireAuth } from "@/lib/auth/utils";
import { getAdminCompanies } from "@/lib/db/actions/company.actions";
import { getAdminProperties } from "@/lib/db/actions/property.actions";
import { getAdminPropertySites } from "@/lib/db/actions/property-site.actions";
import { PropertySiteTable } from "@/components/dashboard/property-sites/PropertySiteTable";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Property Microsites" };

export default async function PropertySitesPage() {
  const user = await requireAuth();
  const [sitesRes, propertiesRes, companiesRes] = await Promise.all([
    getAdminPropertySites(),
    getAdminProperties({ limit: 50 }),
    getAdminCompanies(),
  ]);

  return (
    <PropertySiteTable
      sites={sitesRes.data ?? []}
      properties={propertiesRes.data ?? []}
      companies={companiesRes.data ?? []}
      role={user.role}
    />
  );
}
