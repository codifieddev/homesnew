"use client";

import Link from "next/link";
import { ExternalLink, FileText, Pencil, Plus } from "lucide-react";
import { PUBLISH_STATUS_LABELS } from "@/lib/utils/constants";
import type { ICaseStudy, ICompany, UserRole } from "@/types";

interface CaseStudyTableProps {
  caseStudies: ICaseStudy[];
  companies: ICompany[];
  role: UserRole;
}

export function CaseStudyTable({
  caseStudies,
  companies,
  role,
}: CaseStudyTableProps) {
  const companyMap = new Map(companies.map((company) => [company._id, company.name]));
  const canCreate = role !== "agent";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-medium text-foreground">
            Case Studies
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Publish proof-led stories that connect companies, properties, and
            measurable outcomes across the site.
          </p>
        </div>
        {canCreate && (
          <Link
            href="/admin/case-studies/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-primary-light"
          >
            <Plus className="h-4 w-4" /> Add Case Study
          </Link>
        )}
      </div>

      {caseStudies.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card px-6 py-20 text-center">
          <FileText className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
          <p className="text-base font-medium text-foreground">
            No case studies available
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add conversion proof, outcomes, and testimonials to strengthen the
            homepage and company profile pages.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {["Story", "Company", "Status", "Outcomes", ""].map((label) => (
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
              {caseStudies.map((caseStudy, index) => (
                <tr
                  key={caseStudy._id}
                  className={
                    index === caseStudies.length - 1
                      ? ""
                      : "border-b border-border"
                  }
                >
                  <td className="px-4 py-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {caseStudy.title}
                      </p>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {caseStudy.summary}
                      </p>
                      {caseStudy.featured && (
                        <span className="mt-2 inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
                          Featured
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">
                    {companyMap.get(caseStudy.companyId) ?? "Unknown Company"}
                  </td>
                  <td className="px-4 py-4">
                    <span className="rounded-full border border-border bg-accent px-2.5 py-1 text-xs text-foreground">
                      {PUBLISH_STATUS_LABELS[caseStudy.publishStatus]}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">
                    {caseStudy.outcomes.length}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {caseStudy.publishStatus === "published" && (
                        <Link
                          href={`/case-studies/${caseStudy.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        >
                          <ExternalLink className="h-3.5 w-3.5" /> View
                        </Link>
                      )}
                      <Link
                        href={`/admin/case-studies/${caseStudy._id}/edit`}
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
