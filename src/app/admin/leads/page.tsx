import { getLeadsKanban, getLeadStats } from "@/lib/db/actions/lead.actions";
import { getAdminCompanies } from "@/lib/db/actions/company.actions";
import { getAdminPropertySites } from "@/lib/db/actions/property-site.actions";
import { LeadsKanban } from "@/components/dashboard/leads/LeadsKanban";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Leads Pipeline" };

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{
    companyId?: string;
    propertySiteId?: string;
    source?: string;
  }>;
}) {
  const params = await searchParams;
  const companyId = params.companyId;
  const propertySiteId = params.propertySiteId;
  const source = params.source;

  const [kanbanRes, statsRes, companiesRes, sitesRes] = await Promise.all([
    getLeadsKanban({ companyId, propertySiteId, source }),
    getLeadStats({ companyId, propertySiteId, source }),
    getAdminCompanies(),
    getAdminPropertySites(),
  ]);

  return (
    <LeadsKanban
      boardData={kanbanRes.data ?? {
        new: [], contacted: [], qualified: [],
        site_visit_scheduled: [], negotiation: [], converted: [], lost: [],
      }}
      stats={statsRes.data}
      currentCompanyId={companyId}
      currentPropertySiteId={propertySiteId}
      currentSource={source}
      companies={companiesRes.data ?? []}
      sites={sitesRes.data ?? []}
    />
  );
}
