"use client";

import Link from "next/link";
import { SafeImage as Image } from "@/components/shared/SafeImage";
import {
  BriefcaseBusiness,
  ExternalLink,
  Pencil,
  Plus,
} from "lucide-react";
import {
  COMPANY_THEME_LABELS,
  PUBLISH_STATUS_LABELS,
} from "@/lib/utils/constants";
import type { ICompany, UserRole } from "@/types";

interface CompanyTableProps {
  companies: ICompany[];
  role: UserRole;
}

export function CompanyTable({ companies, role }: CompanyTableProps) {
  const canCreate = role === "super_admin" || role === "admin";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-medium text-foreground">
            Companies
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage developer partners, featured logos, assigned managers, and
            company profiles.
          </p>
        </div>
        {canCreate && (
          <Link
            href="/admin/companies/new"
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-primary-light"
          >
            <Plus className="h-4 w-4" /> Add Company
          </Link>
        )}
      </div>

      {companies.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card px-6 py-20 text-center">
          <BriefcaseBusiness className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
          <p className="text-base font-medium text-foreground">
            No companies configured yet
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add builder and developer partners to power company pages, case
            studies, and property microsites.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {["Company", "Status", "Theme", "Managers", ""].map((label) => (
                  <th
                    key={label}
                    className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-widest text-muted-foreground"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {companies.map((company, index) => (
                <tr
                  key={company._id}
                  className={
                    index === companies.length - 1
                      ? ""
                      : "border-b border-border"
                  }
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-border bg-background">
                        {company.logo ? (
                          <Image
                            src={company.logo}
                            alt={company.name}
                            width={48}
                            height={48}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <BriefcaseBusiness className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {company.name}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          /companies/{company.slug}
                        </p>
                        {company.featured && (
                          <span className="mt-1 inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="rounded-full border border-border bg-accent px-2.5 py-1 text-xs text-foreground">
                      {PUBLISH_STATUS_LABELS[company.status]}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">
                    {COMPANY_THEME_LABELS[company.themePreset]}
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">
                    {company.assignedManagerIds?.length ?? 0}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {company.status === "published" && (
                        <Link
                          href={`/companies/${company.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        >
                          <ExternalLink className="h-3.5 w-3.5" /> View
                        </Link>
                      )}
                      <Link
                        href={`/admin/companies/${company._id}/edit`}
                        className="inline-flex items-center gap-1 rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 text-xs text-primary transition-colors hover:bg-primary/15"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </Link>
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
