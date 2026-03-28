import type { Metadata } from "next";
import { AddLeadForm } from "@/components/dashboard/leads/AddLeadForm";
import { getAdminProperties } from "@/lib/db/actions/property.actions";
import { withRole } from "@/lib/auth/utils";

export const metadata: Metadata = { title: "Add Lead" };

export default async function NewLeadPage() {
  await withRole(["super_admin", "admin", "agent", "company_manager"]);

  const propertiesRes = await getAdminProperties({
    status: "active",
    limit: 50,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const propertyOptions = (propertiesRes.data ?? []).map((property) => ({
    id: property._id!,
    name: property.projectName ?? property.title,
    slug: property.slug,
  }));

  return (
    <div className="py-2">
      <AddLeadForm properties={propertyOptions} />
    </div>
  );
}
