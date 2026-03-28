import { getPropertyById } from "@/lib/db/actions/property.actions";
import { PropertyForm } from "@/components/dashboard/properties/PropertyForm";
import { withRole } from "@/lib/auth/utils";
import { getAdminCompanies } from "@/lib/db/actions/company.actions";
import { getPropertySiteByPropertyId } from "@/lib/db/actions/property-site.actions";
import { PropertySiteWorkflowActions } from "@/components/dashboard/property-sites/PropertySiteWorkflowActions";
import { PUBLISH_STATUS_LABELS } from "@/lib/utils/constants";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Edit Property" };

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await withRole(["super_admin", "admin", "company_manager"]);
  const { id } = await params;

  const [res, companiesRes, siteRes] = await Promise.all([
    getPropertyById(id),
    getAdminCompanies(),
    getPropertySiteByPropertyId(id),
  ]);
  if (!res.success || !res.data) notFound();
  const canPublish = ["super_admin", "admin"].includes(user.role);
  const site = siteRes.success ? siteRes.data : undefined;
  const canCreateMicrosite = siteRes.error === "Microsite not configured yet";

  return (
    <div className="space-y-6 py-2">
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-primary">
              Microsite
            </p>
            <h2 className="mt-2 font-serif text-2xl font-medium text-foreground">
              Property landing page workflow
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Manage the single-page property site, preview the current draft,
              and move it through review or publishing without leaving this
              property edit screen.
            </p>
          </div>
          {site ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span>/sites/{site.siteSlug}</span>
                <span className="rounded-full border border-border bg-accent px-2.5 py-1 text-xs text-foreground">
                  {PUBLISH_STATUS_LABELS[site.publishStatus]}
                </span>
              </div>
              <PropertySiteWorkflowActions
                site={site}
                canPublish={canPublish}
              />
            </div>
          ) : canCreateMicrosite ? (
            <Link
              href={`/admin/property-sites/new?propertyId=${res.data._id}`}
              className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-primary-light"
            >
              Create Microsite
            </Link>
          ) : (
            <p className="text-sm text-muted-foreground">
              Microsite workflow is temporarily unavailable.
            </p>
          )}
        </div>
      </div>

      <PropertyForm property={res.data} companies={companiesRes.data ?? []} />
    </div>
  );
}
