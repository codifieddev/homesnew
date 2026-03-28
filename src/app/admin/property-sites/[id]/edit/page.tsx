import { notFound } from "next/navigation";
import { withRole } from "@/lib/auth/utils";
import { getAdminCompanies } from "@/lib/db/actions/company.actions";
import { getAdminProperties } from "@/lib/db/actions/property.actions";
import { getPropertySiteById } from "@/lib/db/actions/property-site.actions";
import { PropertySiteForm } from "@/components/dashboard/property-sites/PropertySiteForm";
import { PropertySiteWorkflowActions } from "@/components/dashboard/property-sites/PropertySiteWorkflowActions";
import { PUBLISH_STATUS_LABELS } from "@/lib/utils/constants";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Edit Property Microsite" };

export default async function EditPropertySitePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await withRole(["super_admin", "admin", "company_manager"]);
  const { id } = await params;

  const [siteRes, propertiesRes, companiesRes] = await Promise.all([
    getPropertySiteById(id),
    getAdminProperties({ status: "active", limit: 50 }),
    getAdminCompanies(),
  ]);

  if (!siteRes.success || !siteRes.data) notFound();

  const property = (propertiesRes.data ?? []).find(
    (item) => item._id === siteRes.data?.propertyId
  );
  const canPublish = ["super_admin", "admin"].includes(user.role);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-primary">
              Microsite Workflow
            </p>
            <h2 className="mt-2 font-serif text-2xl font-medium text-foreground">
              {property?.projectName ?? property?.title ?? siteRes.data.siteSlug}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span>/sites/{siteRes.data.siteSlug}</span>
              <span className="rounded-full border border-border bg-accent px-2.5 py-1 text-xs text-foreground">
                {PUBLISH_STATUS_LABELS[siteRes.data.publishStatus]}
              </span>
            </div>
          </div>
          <PropertySiteWorkflowActions
            site={siteRes.data}
            canPublish={canPublish}
          />
        </div>
      </div>

      <PropertySiteForm
        site={siteRes.data}
        properties={propertiesRes.data ?? []}
        companies={companiesRes.data ?? []}
        canPublish={canPublish}
      />
    </div>
  );
}
