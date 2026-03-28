"use client";

import Link from "next/link";
import { Globe2, Plus } from "lucide-react";
import {
  COMPANY_THEME_LABELS,
  PUBLISH_STATUS_LABELS,
} from "@/lib/utils/constants";
import type { ICompany, IProperty, IPropertySite, UserRole } from "@/types";
import { PropertySiteWorkflowActions } from "@/components/dashboard/property-sites/PropertySiteWorkflowActions";

interface PropertySiteTableProps {
  sites: IPropertySite[];
  properties: IProperty[];
  companies: ICompany[];
  role: UserRole;
}

export function PropertySiteTable({
  sites,
  properties,
  companies,
  role,
}: PropertySiteTableProps) {
  const propertyMap = new Map(
    properties.map((property) => [property._id, property.projectName ?? property.title])
  );
  const companyMap = new Map(companies.map((company) => [company._id, company.name]));
  const canCreate = role !== "agent";
  const canPublish = ["super_admin", "admin"].includes(role);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-medium text-foreground">
            Property Microsites
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Publish focused single-page landing experiences for listed
            properties, with shared enquiry capture and template-level theme
            control.
          </p>
        </div>
        {canCreate && (
          <Link
            href="/admin/property-sites/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-primary-light"
          >
            <Plus className="h-4 w-4" /> Add Microsite
          </Link>
        )}
      </div>

      {sites.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card px-6 py-20 text-center">
          <Globe2 className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
          <p className="text-base font-medium text-foreground">
            No property microsites configured
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create focused landing pages tied to existing property records and
            the shared enquiry pipeline.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {["Microsite", "Property", "Company", "Status", "Theme", ""].map(
                  (label) => (
                    <th
                      key={label}
                      className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-widest text-muted-foreground"
                    >
                      {label}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {sites.map((site, index) => (
                <tr
                  key={site._id}
                  className={
                    index === sites.length - 1 ? "" : "border-b border-border"
                  }
                >
                  <td className="px-4 py-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {site.siteSlug}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        /sites/{site.siteSlug}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">
                    {propertyMap.get(site.propertyId) ?? "Unknown Property"}
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">
                    {companyMap.get(site.companyId) ?? "Inherited from property"}
                  </td>
                  <td className="px-4 py-4">
                    <span className="rounded-full border border-border bg-accent px-2.5 py-1 text-xs text-foreground">
                      {PUBLISH_STATUS_LABELS[site.publishStatus]}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">
                    {COMPANY_THEME_LABELS[site.themePreset]}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end">
                      <PropertySiteWorkflowActions
                        site={site}
                        canPublish={canPublish}
                        compact
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
