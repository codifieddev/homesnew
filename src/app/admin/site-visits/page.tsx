import { getSiteVisits, getSiteVisitStats, getUpcomingVisits } from "@/lib/db/actions/sitevisit.actions";
import { getAdminCompanies } from "@/lib/db/actions/company.actions";
import { getAdminPropertySites } from "@/lib/db/actions/property-site.actions";
import { SiteVisitsView } from "@/components/dashboard/sitevisits/SiteVisitsView";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Site Visits" };

export default async function SiteVisitsPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    companyId?: string;
    propertySiteId?: string;
    source?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const status = params.status || "scheduled";
  const companyId = params.companyId;
  const propertySiteId = params.propertySiteId;
  const source = params.source;
  const page = Number(params.page) || 1;

  const [visitsRes, statsRes, upcomingRes, companiesRes, sitesRes] = await Promise.all([
    getSiteVisits({
      status: status === "all" ? undefined : status,
      companyId,
      propertySiteId,
      source,
      page,
      limit: 20,
    }),
    getSiteVisitStats({ companyId, propertySiteId, source }),
    getUpcomingVisits(3, { companyId, propertySiteId, source }),
    getAdminCompanies(),
    getAdminPropertySites(),
  ]);

  return (
    <SiteVisitsView
      visits={visitsRes.data ?? []}
      pagination={visitsRes.pagination}
      stats={statsRes.data}
      upcoming={upcomingRes.data ?? []}
      currentStatus={status}
      currentCompanyId={companyId}
      currentPropertySiteId={propertySiteId}
      currentSource={source}
      companies={companiesRes.data ?? []}
      sites={sitesRes.data ?? []}
    />
  );
}
