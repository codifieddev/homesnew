import { getEnquiries, getEnquiryStats } from "@/lib/db/actions/enquiry.actions";
import { getAdminCompanies } from "@/lib/db/actions/company.actions";
import { getAdminPropertySites } from "@/lib/db/actions/property-site.actions";
import { EnquiryInbox } from "@/components/dashboard/enquiries/EnquiryInbox";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Enquiries" };

export default async function EnquiriesPage({
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
  const status = params.status || "new";
  const companyId = params.companyId;
  const propertySiteId = params.propertySiteId;
  const source = params.source;
  const page = Number(params.page) || 1;

  const [enquiriesRes, statsRes, companiesRes, sitesRes] = await Promise.all([
    getEnquiries({
      status: status === "all" ? undefined : status,
      companyId,
      propertySiteId,
      source,
      page,
      limit: 20,
    }),
    getEnquiryStats({ companyId, propertySiteId, source }),
    getAdminCompanies(),
    getAdminPropertySites(),
  ]);

  return (
    <EnquiryInbox
      enquiries={enquiriesRes.data ?? []}
      pagination={enquiriesRes.pagination}
      stats={statsRes.data}
      currentStatus={status}
      currentCompanyId={companyId}
      currentPropertySiteId={propertySiteId}
      currentSource={source}
      companies={companiesRes.data ?? []}
      sites={sitesRes.data ?? []}
    />
  );
}
